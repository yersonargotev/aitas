export interface Note {
	id: string;
	projectId?: string; // Optional - undefined means standalone note
	title: string;
	content: string; // Contenido de la nota en formato Markdown
	createdAt: string; // Fecha de creación (ISO string)
	updatedAt: string; // Fecha de última modificación (ISO string)
}
