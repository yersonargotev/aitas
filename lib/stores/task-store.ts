"use client";

import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type Task, TaskPriority, type TaskStore } from "./types";

// Initial state
const initialState = {
	tasks: [],
	selectedTaskIds: [],
	isLoading: false,
	error: null,
};

// Create the store with persist middleware
export const useTaskStore = create<TaskStore>()(
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
					};

					set((state) => ({
						tasks: [...state.tasks, newTask],
						error: null,
					}));
				} catch (error) {
					set({ error: "Error adding task" });
				}
			},

			updateTask: (taskId, updates) => {
				try {
					set((state) => ({
						tasks: state.tasks.map((task) =>
							task.id === taskId
								? { ...task, ...updates, updatedAt: new Date() }
								: task,
						),
						error: null,
					}));
				} catch (error) {
					set({ error: "Error updating task" });
				}
			},

			deleteTask: (taskId) => {
				try {
					set((state) => ({
						tasks: state.tasks.filter((task) => task.id !== taskId),
						selectedTaskIds: state.selectedTaskIds.filter(
							(id) => id !== taskId,
						),
						error: null,
					}));
				} catch (error) {
					set({ error: "Error deleting task" });
				}
			},

			// Task movement and status
			moveTask: (taskId, newPriority) => {
				try {
					set((state) => ({
						tasks: state.tasks.map((task) =>
							task.id === taskId
								? { ...task, priority: newPriority, updatedAt: new Date() }
								: task,
						),
						error: null,
					}));
				} catch (error) {
					set({ error: "Error moving task" });
				}
			},

			toggleTaskCompletion: (taskId) => {
				try {
					set((state) => ({
						tasks: state.tasks.map((task) =>
							task.id === taskId
								? {
										...task,
										completed: !task.completed,
										updatedAt: new Date(),
									}
								: task,
						),
						error: null,
					}));
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
