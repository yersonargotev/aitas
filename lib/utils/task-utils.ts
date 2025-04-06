import { type EisenhowerQuadrant, type Task, TaskStatus } from "../types/task";

/**
 * Genera un ID único para una tarea
 */
export function generateTaskId(): string {
	return Math.random().toString(36).substring(2, 15);
}

/**
 * Crea una nueva tarea con valores por defecto
 */
export function createNewTask(
	title: string,
	description: string,
	quadrant: EisenhowerQuadrant,
): Task {
	const now = new Date();
	return {
		id: generateTaskId(),
		title,
		description,
		quadrant,
		status: TaskStatus.TODO,
		createdAt: now,
		updatedAt: now,
		priority: 3, // Prioridad media por defecto
		tags: [],
	};
}

/**
 * Actualiza el estado de una tarea
 */
export function updateTaskStatus(task: Task, newStatus: TaskStatus): Task {
	const now = new Date();
	return {
		...task,
		status: newStatus,
		updatedAt: now,
		completedAt: newStatus === TaskStatus.COMPLETED ? now : task.completedAt,
	};
}

/**
 * Mueve una tarea a otro cuadrante
 */
export function moveTaskToQuadrant(
	task: Task,
	newQuadrant: EisenhowerQuadrant,
): Task {
	return {
		...task,
		quadrant: newQuadrant,
		updatedAt: new Date(),
	};
}

/**
 * Filtra tareas por estado
 */
export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
	return tasks.filter((task) => task.status === status);
}

/**
 * Filtra tareas por cuadrante
 */
export function filterTasksByQuadrant(
	tasks: Task[],
	quadrant: EisenhowerQuadrant,
): Task[] {
	return tasks.filter((task) => task.quadrant === quadrant);
}

/**
 * Ordena tareas por prioridad (mayor a menor)
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
	return [...tasks].sort((a, b) => {
		const priorityA = a.priority || 0;
		const priorityB = b.priority || 0;
		return priorityB - priorityA;
	});
}

/**
 * Ordena tareas por fecha de vencimiento (más cercana primero)
 */
export function sortTasksByDueDate(tasks: Task[]): Task[] {
	return [...tasks].sort((a, b) => {
		if (!a.dueDate) return 1;
		if (!b.dueDate) return -1;
		return a.dueDate.getTime() - b.dueDate.getTime();
	});
}
