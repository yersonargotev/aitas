import {
	deleteNoteFromStorage,
	getNoteFromStorage,
	getNotesFromStorage,
	saveNoteToStorage,
} from "@/lib/notes-local-storage";
import { imageStorage } from "@/lib/stores/image-storage";
import type { Note } from "@/types/note";
import { create } from "zustand";
import { nanoid } from 'nanoid';

/**
 * Notes Store - Manages both standalone and project-specific notes
 *
 * Standalone notes: currentProjectId is undefined
 * - Stored in localStorage under 'standalone_notes' key
 * - Accessible from main dashboard Notes tab
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
	currentProjectId: string | null | undefined; // Para saber de qué proyecto cargar/guardar

	loadNotes: (projectId?: string) => void;
	loadStandaloneNotes: () => void;
	addNote: (title: string, content: string, tempImageParentId?: string) => Promise<Note | null>;
	updateNote: (
		noteId: string,
		title: string,
		content: string,
	) => Promise<Note | null>;
	deleteNote: (noteId: string) => Promise<void>;
	selectNote: (noteId: string | null) => void;
	getNoteById: (noteId: string) => Note | undefined;
	clearNotes: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
	notes: [],
	currentNoteId: null,
	isLoading: false,
	error: null,
	currentProjectId: undefined,

	loadNotes: (projectId) => {
		set({ isLoading: true, error: null, currentProjectId: projectId });
		try {
			const notesFromStorage = getNotesFromStorage(projectId);
			set({ notes: notesFromStorage, isLoading: false });
		} catch (e) {
			const error = e instanceof Error ? e.message : "Failed to load notes";
			set({ error, isLoading: false });
			console.error(error);
		}
	},

	loadStandaloneNotes: () => {
		get().loadNotes(undefined);
	},

	addNote: async (title, content, tempImageParentId?: string) => {
		const projectId = get().currentProjectId; // Can be undefined for standalone notes
		set({ isLoading: true, error: null });
		try {
			const noteId = nanoid();
			const now = new Date().toISOString();

			const newNoteData: Partial<Note> = {
				title,
				content,
				createdAt: now,
				updatedAt: now,
				projectId, // Will be undefined for standalone notes
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

			// Assuming saveNoteToStorage can take a full Note object or specific fields including the generated id.
			// It needs to merge projectId and the generated id.
			const newNote = saveNoteToStorage({ ...newNoteData, id: noteId });


			set((state) => ({
				notes: [...state.notes, newNote],
				isLoading: false,
				currentNoteId: newNote.id, // Opcional: seleccionar la nueva nota
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
		const projectId = get().currentProjectId; // Can be undefined
		set({ isLoading: true, error: null });
		try {
			const updatedNote = saveNoteToStorage({
				id: noteId,
				projectId, // Can be undefined
				title,
				content,
			});
			set((state) => ({
				notes: state.notes.map((n) => (n.id === noteId ? updatedNote : n)),
				isLoading: false,
				currentNoteId: updatedNote.id, // Opcional: mantener seleccionada la nota
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
		const projectId = get().currentProjectId; // Can be undefined
		set({ isLoading: true, error: null });
		try {
			deleteNoteFromStorage(noteId, projectId); // This is synchronous

			// Attempt to delete associated images
			try {
				await imageStorage.deleteImagesByParentId(noteId);
			} catch (imageError) {
				// Log the error but don't let it block note deletion workflow
				console.error(`Failed to delete images for note ${noteId}:`, imageError);
				// Optionally, set a specific error state related to image deletion if needed
				// For now, we just log it and proceed with note deletion from state.
			}

			set((state) => ({
				notes: state.notes.filter((n) => n.id !== noteId),
				isLoading: false,
				currentNoteId:
					state.currentNoteId === noteId ? null : state.currentNoteId, // Deseleccionar si era la actual
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

	getNoteById: (noteId: string) => {
		const projectId = get().currentProjectId; // Can be undefined
		// Primero intenta desde el store para rapidez, luego desde localStorage como fallback
		const noteFromStore = get().notes.find((note) => note.id === noteId);
		if (noteFromStore) return noteFromStore;
		return getNoteFromStorage(noteId, projectId);
	},

	clearNotes: () => {
		set({
			notes: [],
			currentNoteId: null,
			currentProjectId: null,
			error: null,
		});
	},
}));
