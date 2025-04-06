"use client";

import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
	Task,
	TaskActions,
	TaskPriority,
	TaskState,
	TaskStore,
} from "./types";

// Initial state
const initialState = {
	tasks: [],
	selectedTaskIds: [],
	isLoading: false,
	error: null,
	filters: {
		priority: "all" as const,
		status: "all" as const,
	},
	statistics: {
		totalTasks: 0,
		completedTasks: 0,
		tasksByPriority: {} as Record<TaskPriority, number>,
		completedTasksByPriority: {} as Record<TaskPriority, number>,
	},
};

const calculateStatistics = (tasks: Task[]) => {
	const statistics = {
		totalTasks: tasks.length,
		completedTasks: tasks.filter((task) => task.completed).length,
		tasksByPriority: {} as Record<TaskPriority, number>,
		completedTasksByPriority: {} as Record<TaskPriority, number>,
	};

	// Initialize counters for each priority
	const priorities: TaskPriority[] = [
		"urgent",
		"important",
		"delegate",
		"eliminate",
		"unclassified",
	];
	for (const priority of priorities) {
		statistics.tasksByPriority[priority] = 0;
		statistics.completedTasksByPriority[priority] = 0;
	}

	// Count tasks by priority
	for (const task of tasks) {
		statistics.tasksByPriority[task.priority]++;
		if (task.completed) {
			statistics.completedTasksByPriority[task.priority]++;
		}
	}

	return statistics;
};

// Create the store with persist middleware
export const useTaskStore = create<TaskState & TaskActions>()(
	persist(
		(set, get) => ({
			// Initial state
			...initialState,

			// Task CRUD operations
			addTask: (taskData) => {
				try {
					const now = new Date();
					const newTask: Task = {
						...taskData,
						id: uuidv4(),
						createdAt: now,
						updatedAt: now,
						completed: false,
					};

					set((state) => ({
						tasks: [...state.tasks, newTask],
						statistics: calculateStatistics([...state.tasks, newTask]),
						error: null,
					}));
				} catch (error) {
					set({ error: "Error adding task" });
				}
			},

			updateTask: (taskId, updates) => {
				try {
					set((state) => {
						const updatedTasks = state.tasks.map((task) =>
							task.id === taskId
								? { ...task, ...updates, updatedAt: new Date() }
								: task,
						);
						return {
							tasks: updatedTasks,
							statistics: calculateStatistics(updatedTasks),
							error: null,
						};
					});
				} catch (error) {
					set({ error: "Error updating task" });
				}
			},

			deleteTask: (taskId) => {
				try {
					set((state) => {
						const filteredTasks = state.tasks.filter(
							(task) => task.id !== taskId,
						);
						return {
							tasks: filteredTasks,
							statistics: calculateStatistics(filteredTasks),
							selectedTaskIds: state.selectedTaskIds.filter(
								(id) => id !== taskId,
							),
							error: null,
						};
					});
				} catch (error) {
					set({ error: "Error deleting task" });
				}
			},

			// Task movement and status
			moveTask: (taskId, newPriority) => {
				try {
					set((state) => {
						const updatedTasks = state.tasks.map((task) =>
							task.id === taskId
								? { ...task, priority: newPriority, updatedAt: new Date() }
								: task,
						);
						return {
							tasks: updatedTasks,
							statistics: calculateStatistics(updatedTasks),
							error: null,
						};
					});
				} catch (error) {
					set({ error: "Error moving task" });
				}
			},

			reorderTasks: (taskId, overTaskId) => {
				try {
					set((state) => {
						const taskIndex = state.tasks.findIndex(
							(task) => task.id === taskId,
						);
						const overTaskIndex = state.tasks.findIndex(
							(task) => task.id === overTaskId,
						);

						if (taskIndex === -1 || overTaskIndex === -1) return state;

						const task = state.tasks[taskIndex];
						const overTask = state.tasks[overTaskIndex];

						// Only reorder if tasks are in the same priority
						if (task.priority !== overTask.priority) return state;

						const updatedTasks = [...state.tasks];
						updatedTasks.splice(taskIndex, 1);
						updatedTasks.splice(overTaskIndex, 0, task);

						return {
							tasks: updatedTasks,
							statistics: calculateStatistics(updatedTasks),
							error: null,
						};
					});
				} catch (error) {
					set({ error: "Error reordering tasks" });
				}
			},

			toggleTaskCompletion: (taskId) => {
				try {
					set((state) => {
						const updatedTasks = state.tasks.map((task) =>
							task.id === taskId
								? { ...task, completed: !task.completed, updatedAt: new Date() }
								: task,
						);
						return {
							tasks: updatedTasks,
							statistics: calculateStatistics(updatedTasks),
							error: null,
						};
					});
				} catch (error) {
					set({ error: "Error toggling task completion" });
				}
			},

			// Task selection for AI ordering
			selectTask: (taskId) => {
				try {
					set((state) => ({
						selectedTaskIds: [...state.selectedTaskIds, taskId],
						error: null,
					}));
				} catch (error) {
					set({ error: "Error selecting task" });
				}
			},

			deselectTask: (taskId) => {
				try {
					set((state) => ({
						selectedTaskIds: state.selectedTaskIds.filter(
							(id) => id !== taskId,
						),
						error: null,
					}));
				} catch (error) {
					set({ error: "Error deselecting task" });
				}
			},

			clearSelectedTasks: () => {
				try {
					set({ selectedTaskIds: [], error: null });
				} catch (error) {
					set({ error: "Error clearing selected tasks" });
				}
			},

			// Filter management
			setFilter: (
				filterType: "priority" | "status",
				value: TaskPriority | "all" | "completed" | "pending",
			) => {
				set((state) => ({
					filters: {
						...state.filters,
						[filterType]: value,
					},
				}));
			},

			// State management
			setError: (error) => set({ error }),
			clearError: () => set({ error: null }),
		}),
		{
			name: "eisenhower-matrix-storage", // unique name for localStorage
			storage: createJSONStorage(() => localStorage),
			// Only persist these parts of the state
			partialize: (state) => ({
				tasks: state.tasks,
				selectedTaskIds: state.selectedTaskIds,
				filters: state.filters,
				statistics: state.statistics,
			}),
			// Handle errors during storage operations
			onRehydrateStorage: () => (state) => {
				// This function runs after rehydration
				if (state) {
					// Validate tasks after rehydration
					const validTasks = state.tasks.filter((task) => {
						// Ensure all required fields are present
						return (
							task.id &&
							task.title &&
							task.priority &&
							task.createdAt &&
							task.updatedAt
						);
					});

					// If some tasks were invalid, update the state
					if (validTasks.length !== state.tasks.length) {
						state.tasks = validTasks;
					}
				}
			},
		},
	),
);
