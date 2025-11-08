import type { Note } from "@/types/note";
import { v4 as uuidv4 } from "uuid";

const getNotesKey = (projectId: string): string => {
	if (!projectId) {
		throw new Error("Project ID is required to get the notes key.");
	}
	return `project_notes_${projectId}`;
};

export function getNotesFromStorage(projectId: string): Note[] {
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
	projectId: string,
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
			projectId: noteToSave.projectId,
			...noteToSave,
		};
	}
	const { projectId } = noteToSave;
	if (!projectId) {
		throw new Error("Project ID is required to save a note.");
	}
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

export function deleteNoteFromStorage(noteId: string, projectId: string): void {
	if (typeof window === "undefined") return;
	let notes = getNotesFromStorage(projectId);
	notes = notes.filter((note) => note.id !== noteId);
	try {
		localStorage.setItem(getNotesKey(projectId), JSON.stringify(notes));
	} catch (error) {
		console.error("Error deleting note from localStorage:", error);
	}
}
