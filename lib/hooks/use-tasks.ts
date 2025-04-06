"use client";

import { useTaskStore } from "../stores/task-store";
import { Task, TaskPriority } from "../stores/types";
import { useStoreHydration } from "./use-store-hydration";

/**
 * Custom hook to use the task store with proper hydration
 * This hook ensures that the store is only accessed after hydration is complete
 * to avoid hydration mismatches between server and client
 */
export function useTasks() {
	// Get all tasks from the store
	const [tasks, isTasksHydrated] = useStoreHydration(
		useTaskStore,
		(state) => state.tasks,
	);

	// Get selected task IDs from the store
	const [selectedTaskIds, isSelectedHydrated] = useStoreHydration(
		useTaskStore,
		(state) => state.selectedTaskIds,
	);

	// Get error from the store
	const [error, isErrorHydrated] = useStoreHydration(
		useTaskStore,
		(state) => state.error,
	);

	// Get actions from the store
	const {
		addTask,
		updateTask,
		deleteTask,
		moveTask,
		toggleTaskCompletion,
		selectTask,
		deselectTask,
		clearSelectedTasks,
		setError,
		clearError,
	} = useTaskStore();

	// Check if all parts of the store are hydrated
	const isHydrated = isTasksHydrated && isSelectedHydrated && isErrorHydrated;

	// Group tasks by priority
	const tasksByPriority = tasks
		? {
				urgent: tasks.filter((task) => task.priority === "urgent"),
				important: tasks.filter((task) => task.priority === "important"),
				delegate: tasks.filter((task) => task.priority === "delegate"),
				eliminate: tasks.filter((task) => task.priority === "eliminate"),
				unclassified: tasks.filter((task) => task.priority === "unclassified"),
			}
		: {
				urgent: [],
				important: [],
				delegate: [],
				eliminate: [],
				unclassified: [],
			};

	// Get completed and pending tasks
	const completedTasks = tasks ? tasks.filter((task) => task.completed) : [];
	const pendingTasks = tasks ? tasks.filter((task) => !task.completed) : [];

	// Get selected tasks
	const selectedTasks =
		tasks && selectedTaskIds
			? tasks.filter((task) => selectedTaskIds.includes(task.id))
			: [];

	return {
		// State
		tasks: tasks || [],
		selectedTaskIds: selectedTaskIds || [],
		error,
		isHydrated,

		// Grouped tasks
		tasksByPriority,
		completedTasks,
		pendingTasks,
		selectedTasks,

		// Actions
		addTask,
		updateTask,
		deleteTask,
		moveTask,
		toggleTaskCompletion,
		selectTask,
		deselectTask,
		clearSelectedTasks,
		setError,
		clearError,
	};
}
