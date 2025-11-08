import {
	deleteNoteFromStorage,
	getNoteFromStorage,
	getNotesFromStorage,
	saveNoteToStorage,
	getLastOpenedNote,
	setLastOpenedNote,
	getPreviewPreference,
	setPreviewPreference,
} from "@/lib/notes-local-storage";
import { imageStorage } from "@/lib/stores/image-storage";
import type { Note } from "@/types/note";
import { create } from "zustand";
import { nanoid } from 'nanoid';

/**
 * Notes Store - Manages project-specific notes
 *
 * Project notes: currentProjectId is a valid project ID string
 * - Stored in localStorage under 'project_notes_{projectId}' key
 * - Accessible from project dropdown "View Notes" action
 *
 * The store maintains context through currentProjectId and loads
 * appropriate notes when switching between contexts.
 */
interface NotesState {
	notes: Note[];
	currentNoteId: string | null;
	isLoading: boolean;
	error: string | null;
	currentProjectId: string | undefined; // To know which project to load/save from
	previewPreference: boolean; // Whether user prefers preview view

	loadNotes: (projectId?: string) => void;
	addNote: (title: string, content: string, tempImageParentId?: string) => Promise<Note | null>;
	updateNote: (
		noteId: string,
		title: string,
		content: string,
	) => Promise<Note | null>;
	deleteNote: (noteId: string) => Promise<void>;
	selectNote: (noteId: string | null) => void;
	selectNoteAndPersist: (noteId: string) => void;
	getNoteById: (noteId: string) => Note | undefined;
	clearNotes: () => void;
	setPreviewPreference: (preferPreview: boolean) => void;
	restoreLastOpenedNote: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
	notes: [],
	currentNoteId: null,
	isLoading: false,
	error: null,
	currentProjectId: undefined,
	previewPreference: false,

	loadNotes: (projectId) => {
		set({ isLoading: true, error: null, currentProjectId: projectId });
		if (!projectId) {
			set({ notes: [], isLoading: false, previewPreference: false });
			return;
		}
		try {
			const notesFromStorage = getNotesFromStorage(projectId);
			const previewPref = getPreviewPreference(projectId);
			set({ notes: notesFromStorage, isLoading: false, previewPreference: previewPref });
		} catch (e) {
			const error = e instanceof Error ? e.message : "Failed to load notes";
			set({ error, isLoading: false, previewPreference: false });
			console.error(error);
		}
	},

	addNote: async (title, content, tempImageParentId?: string) => {
		const projectId = get().currentProjectId;
		set({ isLoading: true, error: null });
		try {
			const noteId = nanoid();
			const now = new Date().toISOString();

			const newNoteData: Partial<Note> = {
				title,
				content,
				createdAt: now,
				updatedAt: now,
				projectId,
			};

			if (tempImageParentId) {
				try {
					// Initialize imageStorage if it hasn't been already
					if (!imageStorage.db) {
						await imageStorage.init();
					}
					await imageStorage.transferImages(tempImageParentId, noteId);
				} catch (error) {
					console.error(`Failed to transfer images from temp ID ${tempImageParentId} to new note ${noteId}:`, error);
					// Optionally, set an error state or include this info in the returned note/error
				}
			}

			const newNote = saveNoteToStorage({ ...newNoteData, id: noteId });


			set((state) => ({
				notes: [...state.notes, newNote],
				isLoading: false,
				currentNoteId: newNote.id,
			}));
			return newNote;
		} catch (e) {
			const error = e instanceof Error ? e.message : "Failed to add note";
			set({ error, isLoading: false });
			console.error(error);
			return null;
		}
	},

	updateNote: async (noteId, title, content) => {
		const projectId = get().currentProjectId;
		set({ isLoading: true, error: null });
		try {
			const updatedNote = saveNoteToStorage({
				id: noteId,
				projectId,
				title,
				content,
			});
			set((state) => ({
				notes: state.notes.map((n) => (n.id === noteId ? updatedNote : n)),
				isLoading: false,
				currentNoteId: updatedNote.id,
			}));
			return updatedNote;
		} catch (e) {
			const error = e instanceof Error ? e.message : "Failed to update note";
			set({ error, isLoading: false });
			console.error(error);
			return null;
		}
	},

	deleteNote: async (noteId) => {
		const projectId = get().currentProjectId;
		if (!projectId) {
			const error = "Project ID not set, cannot delete note.";
			set({ error, isLoading: false });
			console.error(error);
			return;
		}
		set({ isLoading: true, error: null });
		try {
			deleteNoteFromStorage(noteId, projectId); // This is synchronous

			// Attempt to delete associated images
			try {
				await imageStorage.deleteImagesByParentId(noteId);
			} catch (imageError) {
				// Log the error but don't let it block note deletion workflow
				console.error(`Failed to delete images for note ${noteId}:`, imageError);
			}

			set((state) => ({
				notes: state.notes.filter((n) => n.id !== noteId),
				isLoading: false,
				currentNoteId:
					state.currentNoteId === noteId ? null : state.currentNoteId,
			}));
		} catch (e) {
			const error = e instanceof Error ? e.message : "Failed to delete note";
			set({ error, isLoading: false });
			console.error(error);
		}
	},

	selectNote: (noteId) => {
		set({ currentNoteId: noteId, error: null });
	},

	selectNoteAndPersist: (noteId) => {
		const projectId = get().currentProjectId;
		set({ currentNoteId: noteId, error: null });
		// Save the last opened note for this project
		if (projectId && noteId) {
			setLastOpenedNote(projectId, noteId);
		}
	},

	getNoteById: (noteId: string) => {
		const projectId = get().currentProjectId;
		const noteFromStore = get().notes.find((note) => note.id === noteId);
		if (noteFromStore) return noteFromStore;
		if (!projectId) return undefined;
		return getNoteFromStorage(noteId, projectId);
	},

	clearNotes: () => {
		set({
			notes: [],
			currentNoteId: null,
			currentProjectId: undefined,
			error: null,
			previewPreference: false,
		});
	},

	setPreviewPreference: (preferPreview: boolean) => {
		const projectId = get().currentProjectId;
		set({ previewPreference: preferPreview });
		// Save the preview preference for this project
		if (projectId) {
			setPreviewPreference(projectId, preferPreview);
		}
	},

	restoreLastOpenedNote: () => {
		const projectId = get().currentProjectId;
		const { notes } = get();
		if (!projectId || notes.length === 0) return;

		const lastOpenedNoteId = getLastOpenedNote(projectId);
		if (lastOpenedNoteId) {
			// Check if the last opened note still exists
			const noteExists = notes.find(note => note.id === lastOpenedNoteId);
			if (noteExists) {
				get().selectNote(lastOpenedNoteId);
				return;
			}
		}

		// If no last opened note or it doesn't exist, select the first note
		const firstNote = notes[0];
		if (firstNote) {
			get().selectNote(firstNote.id);
		}
	},
}));
