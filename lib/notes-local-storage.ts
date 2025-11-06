import type { Note } from "@/types/note";
import { v4 as uuidv4 } from "uuid";

const STANDALONE_NOTES_KEY = 'standalone_notes';

const getNotesKey = (projectId?: string): string => {
	return projectId ? `project_notes_${projectId}` : STANDALONE_NOTES_KEY;
};

export function getNotesFromStorage(projectId?: string): Note[] {
	if (typeof window === "undefined") return [];
	try {
		const notesJson = localStorage.getItem(getNotesKey(projectId));
		return notesJson ? JSON.parse(notesJson) : [];
	} catch (error) {
		console.error("Error reading notes from localStorage:", error);
		return [];
	}
}

export function getNoteFromStorage(
	noteId: string,
	projectId?: string,
): Note | undefined {
	const notes = getNotesFromStorage(projectId);
	return notes.find((note) => note.id === noteId);
}

export function saveNoteToStorage(
	noteToSave: Partial<Note>,
): Note {
	if (typeof window === "undefined") {
		// Devolver una nota simulada o lanzar un error si estamos en el servidor y no debería ocurrir
		console.warn(
			"Attempted to save note on server side. This should not happen for localStorage operations.",
		);
		// Esto es un placeholder, idealmente no se llegaría aquí en un flujo normal.
		const now = new Date().toISOString();
		return {
			id: noteToSave.id || uuidv4(),
			title: noteToSave.title || "Untitled",
			content: noteToSave.content || "",
			createdAt: now,
			updatedAt: now,
			projectId: noteToSave.projectId, // Allow undefined
			...noteToSave,
		};
	}
	const projectId = noteToSave.projectId; // Can be undefined
	const notes = getNotesFromStorage(projectId);
	const now = new Date().toISOString();
	let finalNote: Note;

	if (noteToSave.id) {
		// Actualizar nota existente
		const noteIndex = notes.findIndex((n) => n.id === noteToSave.id);
		if (noteIndex > -1) {
			const existingNote = notes[noteIndex];
			finalNote = {
				...existingNote,
				...noteToSave,
				updatedAt: now,
			};
			notes[noteIndex] = finalNote;
		} else {
			// Si no se encuentra la nota para actualizar, podría ser un error o crearla como nueva.
			// Optamos por crearla como nueva si el ID no coincide.
			finalNote = {
				id: uuidv4(),
				createdAt: now,
				...noteToSave,
				title: noteToSave.title || "Untitled",
				content: noteToSave.content || "",
				updatedAt: now,
			};
			notes.push(finalNote);
		}
	} else {
		// Crear nueva nota
		finalNote = {
			id: uuidv4(),
			createdAt: now,
			...noteToSave,
			title: noteToSave.title || "Untitled",
			content: noteToSave.content || "",
			updatedAt: now,
		};
		notes.push(finalNote);
	}

	try {
		localStorage.setItem(
			getNotesKey(projectId),
			JSON.stringify(notes),
		);
	} catch (error) {
		console.error("Error saving notes to localStorage:", error);
		// Aquí podrías implementar un manejo de error más robusto, como notificar al usuario.
	}
	return finalNote;
}

export function deleteNoteFromStorage(noteId: string, projectId?: string): void {
	if (typeof window === "undefined") return;
	let notes = getNotesFromStorage(projectId);
	notes = notes.filter((note) => note.id !== noteId);
	try {
		localStorage.setItem(getNotesKey(projectId), JSON.stringify(notes));
	} catch (error) {
		console.error("Error deleting note from localStorage:", error);
	}
}

/**
 * Migration utility to convert old main_dashboard_notes to standalone_notes
 * Runs once on first load after update
 * @returns true if migration was performed, false if already done or no old notes
 */
export function migrateMainDashboardNotesToStandalone(): boolean {
	if (typeof window === "undefined") return false;

	const oldKey = 'project_notes_main_dashboard_notes';
	const newKey = 'standalone_notes';

	try {
		// Check if migration already done
		const alreadyMigrated = localStorage.getItem('notes_migration_v1_done');
		if (alreadyMigrated === 'true') {
			return false; // Already migrated
		}

		// Get old notes
		const oldNotesJson = localStorage.getItem(oldKey);
		if (!oldNotesJson) {
			// No old notes to migrate
			localStorage.setItem('notes_migration_v1_done', 'true');
			return false;
		}

		// Check if standalone notes already exist
		const existingStandaloneJson = localStorage.getItem(newKey);
		if (existingStandaloneJson) {
			// Merge old notes with existing standalone notes
			const oldNotes: Note[] = JSON.parse(oldNotesJson);
			const existingNotes: Note[] = JSON.parse(existingStandaloneJson);

			// Remove projectId from old notes and merge
			const migratedNotes = oldNotes.map(note => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { projectId, ...noteWithoutProjectId } = note;
				return noteWithoutProjectId as Note;
			});

			const mergedNotes = [...existingNotes, ...migratedNotes];
			localStorage.setItem(newKey, JSON.stringify(mergedNotes));
		} else {
			// Simply move and clean projectId
			const oldNotes: Note[] = JSON.parse(oldNotesJson);
			const migratedNotes = oldNotes.map(note => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { projectId, ...noteWithoutProjectId } = note;
				return noteWithoutProjectId as Note;
			});
			localStorage.setItem(newKey, JSON.stringify(migratedNotes));
		}

		// Mark migration as complete
		localStorage.setItem('notes_migration_v1_done', 'true');

		// Keep old notes as backup for now (can be removed in future version)
		console.log('Successfully migrated main dashboard notes to standalone notes');
		return true;
	} catch (error) {
		console.error('Error during notes migration:', error);
		return false;
	}
}
