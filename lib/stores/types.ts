export type TaskPriority =
	| "urgent"
	| "important"
	| "delegate"
	| "eliminate"
	| "unclassified";

export interface Project {
	id: string;
	name: string;
	description?: string;
	icon?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Task {
	id: string;
	title: string;
	description?: string;
	priority: TaskPriority;
	projectId?: string;
	dueDate?: Date;
	completed?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface TaskState {
	tasks: Task[];
	selectedTaskIds: string[];
	isLoading: boolean;
	error: string | null;
	filters: {
		priority: TaskPriority | "all";
		status: "all" | "completed" | "pending";
		projectId?: string;
	};
	statistics: {
		totalTasks: number;
		completedTasks: number;
		tasksByPriority: Record<TaskPriority, number>;
		completedTasksByPriority: Record<TaskPriority, number>;
	};
}

export interface TaskActions {
	// Task CRUD operations
	addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
	updateTask: (
		taskId: string,
		updates: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>,
	) => void;
	deleteTask: (taskId: string) => void;

	// Task movement and status
	moveTask: (taskId: string, newPriority: TaskPriority) => void;
	reorderTasks: (taskId: string, overTaskId: string) => void;
	toggleTaskCompletion: (taskId: string) => void;

	// Task selection for AI ordering
	selectTask: (taskId: string) => void;
	deselectTask: (taskId: string) => void;
	clearSelectedTasks: () => void;

	// Filter management
	setFilter: (
		filterType: "priority" | "status",
		value: TaskPriority | "all" | "completed" | "pending",
	) => void;

	// State management
	setError: (error: string | null) => void;
	clearError: () => void;
}

export type TaskStore = TaskState & TaskActions;
