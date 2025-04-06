/**
 * Enumeración que define los cuadrantes de la matriz de Eisenhower
 */
export enum EisenhowerQuadrant {
	Q1 = "Q1", // Urgente y Importante
	Q2 = "Q2", // Importante pero no Urgente
	Q3 = "Q3", // Urgente pero no Importante
	Q4 = "Q4", // Ni Urgente ni Importante
}

/**
 * Enumeración que define los estados de una tarea
 */
export enum TaskStatus {
	TODO = "TODO",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
}

/**
 * Interfaz que define una tarea en la aplicación
 */
export interface Task {
	id: string;
	title: string;
	description: string;
	quadrant: EisenhowerQuadrant;
	status: TaskStatus;
	createdAt: Date;
	updatedAt: Date;
	dueDate?: Date;
	completedAt?: Date;
	tags?: string[];
	priority?: number; // 1-5, donde 5 es la mayor prioridad
}

/**
 * Interfaz que define un cuadrante de la matriz de Eisenhower
 */
export interface Quadrant {
	id: EisenhowerQuadrant;
	title: string;
	description: string;
	tasks: Task[];
}

/**
 * Interfaz que define la matriz completa de Eisenhower
 */
export interface EisenhowerMatrix {
	quadrants: Record<EisenhowerQuadrant, Quadrant>;
}
