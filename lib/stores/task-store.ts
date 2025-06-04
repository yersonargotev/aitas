"use client";

import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { imageStorage, type ImageRecord } from "./image-storage";
import type {
	Task,
	TaskActions,
	TaskImage,
	TaskPriority,
	TaskState,
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
		projectId: undefined as string | undefined,
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
			addTask: async (taskInput) => { // Renamed taskData to taskInput for clarity
				try {
					const now = new Date();
					const { id: tempTaskId, ...restOfTaskInput } = taskInput; // Destructure tempTaskId

					const newPermanentId = uuidv4(); // Always generate a new permanent ID

					const newTaskBase: Omit<Task, 'images'> = {
						...restOfTaskInput,
						id: newPermanentId, // Use the new permanent ID
						createdAt: now,
						updatedAt: now,
						completed: false,
						// Ensure all required fields from Task are present, e.g. priority if not in taskInput
						priority: taskInput.priority || 'unclassified',
						// title: taskInput.title (already in restOfTaskInput)
						// description: taskInput.description (already in restOfTaskInput)
					};

					let taskImages: TaskImage[] = [];

					if (tempTaskId) {
						try {
							// Initialize imageStorage if it hasn't been already
							if (!imageStorage.db) {
								await imageStorage.init();
							}
							await imageStorage.transferImages(tempTaskId, newPermanentId);
						} catch (error) {
							console.error(`Failed to transfer images from ${tempTaskId} to ${newPermanentId}:`, error);
							// Decide if you want to throw, or continue without images, or partial images
						}
					}

					// Always fetch images for the newPermanentId,
					// this will get transferred images or newly added ones if API changes.
					try {
						if (!imageStorage.db) { // Ensure initialized before fetching
							await imageStorage.init();
						}
						const imageRecords = await imageStorage.getImagesByParentId(newPermanentId);
						taskImages = imageRecords.map((record) => ({
							id: record.id,
							file: record.file, // Include file for URL creation
							name: record.name,
							size: record.size,
							type: record.type,
							createdAt: record.createdAt,
						}));
					} catch (imageError) {
						console.warn(`Failed to load images for task ${newPermanentId}:`, imageError);
					}

					const newTask: Task = {
						...newTaskBase,
						images: taskImages,
					};

					set((state) => ({
						tasks: [...state.tasks, newTask],
						statistics: calculateStatistics([...state.tasks, newTask]),
						error: null,
					}));
				} catch (error) {
					console.error(`Error adding task: ${error}`);
					set({ error: "Error adding task" });
				}
			},

			updateTask: (taskId, updates) => {
				try {
					set((state) => {
						const updatedTasks = state.tasks.map((task) =>
							task.id === taskId
								? {
										...task,
										...updates,
										updatedAt: new Date(),
										// Preservar explícitamente las imágenes si no se están actualizando
										images:
											updates.images !== undefined
												? updates.images
												: task.images || [],
									}
								: task,
						);
						return {
							tasks: updatedTasks,
							statistics: calculateStatistics(updatedTasks),
							error: null,
						};
					});
				} catch (error) {
					console.error(`Error updating task: ${error}`);
					set({ error: "Error updating task" });
				}
			},

			deleteTask: async (taskId) => {
				try {
					// Eliminar imágenes asociadas de IndexedDB
					await imageStorage.deleteImagesByParentId(taskId);

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
					console.error(`Error deleting task: ${error}`);
					set({ error: "Error deleting task" });
				}
			},

			// Task movement and status
			moveTask: (taskId, newPriority) => {
				try {
					set((state) => {
						const updatedTasks = state.tasks.map((task) =>
							task.id === taskId
								? {
										...task,
										priority: newPriority,
										updatedAt: new Date(),
										// Preservar explícitamente las imágenes
										images: task.images || [],
									}
								: task,
						);
						return {
							tasks: updatedTasks,
							statistics: calculateStatistics(updatedTasks),
							error: null,
						};
					});
				} catch (error) {
					console.error(`Error moving task: ${error}`);
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
						// Preservar las imágenes al reordenar
						const taskWithImages = { ...task, images: task.images || [] };
						updatedTasks.splice(taskIndex, 1);
						updatedTasks.splice(overTaskIndex, 0, taskWithImages);

						return {
							tasks: updatedTasks,
							statistics: calculateStatistics(updatedTasks),
							error: null,
						};
					});
				} catch (error) {
					console.error(`Error reordering tasks: ${error}`);
					set({ error: "Error reordering tasks" });
				}
			},

			toggleTaskCompletion: (taskId) => {
				try {
					set((state) => {
						const updatedTasks = state.tasks.map((task) =>
							task.id === taskId
								? {
										...task,
										completed: !task.completed,
										updatedAt: new Date(),
										// Preservar explícitamente las imágenes
										images: task.images || [],
									}
								: task,
						);
						return {
							tasks: updatedTasks,
							statistics: calculateStatistics(updatedTasks),
							error: null,
						};
					});
				} catch (error) {
					console.error(`Error toggling task completion: ${error}`);
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
					console.error(`Error selecting task: ${error}`);
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
					console.error(`Error deselecting task: ${error}`);
					set({ error: "Error deselecting task" });
				}
			},

			clearSelectedTasks: () => {
				try {
					set({ selectedTaskIds: [], error: null });
				} catch (error) {
					console.error(`Error clearing selected tasks: ${error}`);
					set({ error: "Error clearing selected tasks" });
				}
			},

			// Image management actions
			addImageToTask: async (taskId: string, file: File): Promise<string> => {
				try {
					// Inicializar ImageStorage si no está listo
					if (!imageStorage.db) {
						await imageStorage.init();
					}

					// Validar tamaño del archivo (10MB max)
					const maxSize = 10 * 1024 * 1024; // 10MB
					if (file.size > maxSize) {
						throw new Error("File size exceeds 10MB limit");
					}

					// Validar tipo de archivo
					if (!file.type.startsWith("image/")) {
						throw new Error("File must be an image");
					}

					// Guardar imagen en IndexedDB
					const imageRecord = await imageStorage.saveImage(taskId, file);

					// Crear TaskImage para el estado de Zustand
					const taskImage: TaskImage = {
						id: imageRecord.id,
						// file: imageRecord.file, // Avoid storing File object in Zustand state
						name: imageRecord.name,
						size: imageRecord.size,
						type: imageRecord.type,
						createdAt: imageRecord.createdAt,
					};

					// Actualizar la tarea en el estado
					set((state) => ({
						tasks: state.tasks.map((task) =>
							task.id === taskId
								? {
										...task,
										images: [...(task.images || []), taskImage],
										updatedAt: new Date(),
									}
								: task,
						),
						error: null,
					}));

					// Return the image ID
					return imageRecord.id;
				} catch (error) {
					console.error("Error adding image to task:", error);
					const errorMessage =
						error instanceof Error
							? error.message
							: "Error adding image to task";
					set({ error: errorMessage });
					throw error; // Re-throw to allow caller to handle
				}
			},

			removeImageFromTask: async (taskId: string, imageId: string) => {
				try {
					// Eliminar de IndexedDB
					await imageStorage.deleteImage(imageId);

					// Actualizar el estado
					set((state) => ({
						tasks: state.tasks.map((task) =>
							task.id === taskId
								? {
										...task,
										images: task.images?.filter((img) => img.id !== imageId),
										updatedAt: new Date(),
									}
								: task,
						),
						error: null,
					}));
				} catch (error) {
					console.error("Error removing image from task:", error);
					set({ error: "Error removing image from task" });
				}
			},

			getTaskImages: async (taskId: string): Promise<ImageRecord[]> => {
				try {
					if (!imageStorage.db) {
						await imageStorage.init();
					}
					// This should return the full ImageRecord, including the File object
					return imageStorage.getImagesByParentId(taskId);
				} catch (error) {
					console.error("Error getting task images:", error);
					return [];
				}
			},

			// Método para refrescar las imágenes de todas las tareas desde IndexedDB
			refreshTaskImages: async () => {
				try {
					if (!imageStorage.db) {
						await imageStorage.init();
					}

					const state = get();
					const updatedTasks = await Promise.all(
						state.tasks.map(async (task) => {
							try {
								const images = await imageStorage.getImagesByParentId(task.id);
								return {
									...task,
									images: images.map((record) => ({
										id: record.id,
										file: record.file,
										name: record.name,
										size: record.size,
										type: record.type,
										createdAt: record.createdAt,
									})),
								};
							} catch (error) {
								console.warn(
									`Failed to refresh images for task ${task.id}:`,
									error,
								);
								return task;
							}
						}),
					);

					set({
						tasks: updatedTasks,
						error: null,
					});
				} catch (error) {
					console.error("Error refreshing task images:", error);
					set({ error: "Error refreshing task images" });
				}
			},

			// Filter management
			setFilter: (
				filterType: "priority" | "status" | "projectId",
				value:
					| TaskPriority
					| "all"
					| "completed"
					| "pending"
					| string
					| undefined,
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
			// Only persist these parts of the state (excluding imageUrls as they are temporary)
			partialize: (state) => ({
				tasks: state.tasks,
				selectedTaskIds: state.selectedTaskIds,
				filters: state.filters,
				statistics: state.statistics,
			}),
			// Handle errors during storage operations
			onRehydrateStorage: () => async (state) => {
				// This function runs after rehydration
				if (state) {
					// Initialize image storage
					try {
						await imageStorage.init();

						// Load images for existing tasks from IndexedDB
						for (const task of state.tasks) {
							if (task.id) {
								try {
									const images = await imageStorage.getImagesByParentId(task.id);
									if (images.length > 0) {
										task.images = images.map((record) => ({
											id: record.id,
											file: record.file, // Include file for URL creation
											name: record.name,
											size: record.size,
											type: record.type,
											createdAt: record.createdAt,
										}));
									}
								} catch (error) {
									console.warn(
										`Failed to load images for task ${task.id}:`,
										error,
									);
								}
							}
						}
					} catch (error) {
						console.error("Failed to initialize image storage:", error);
					}

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
