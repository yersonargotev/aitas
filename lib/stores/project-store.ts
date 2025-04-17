"use client";

import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Project } from "./types";

interface ProjectState {
	projects: Project[];
	selectedProjectId: string | null;
	isLoading: boolean;
	error: string | null;
}

interface ProjectActions {
	// Project CRUD operations
	addProject: (
		project: Omit<Project, "id" | "createdAt" | "updatedAt">,
	) => void;
	updateProject: (
		projectId: string,
		updates: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>,
	) => void;
	deleteProject: (projectId: string) => void;

	// Project selection
	selectProject: (projectId: string | null) => void;

	// State management
	setError: (error: string | null) => void;
	clearError: () => void;
}

// Initial state
const initialState: ProjectState = {
	projects: [],
	selectedProjectId: null,
	isLoading: false,
	error: null,
};

// Create the store with persist middleware
export const useProjectStore = create<ProjectState & ProjectActions>()(
	persist(
		(set) => ({
			// Initial state
			...initialState,

			// Project CRUD operations
			addProject: (projectData) => {
				try {
					const now = new Date();
					const newProject: Project = {
						...projectData,
						id: uuidv4(),
						createdAt: now,
						updatedAt: now,
					};

					set((state) => ({
						projects: [...state.projects, newProject],
						error: null,
					}));
				} catch (error) {
					console.error(`Error adding project: ${error}`);
					set({ error: "Error adding project" });
				}
			},

			updateProject: (projectId, updates) => {
				try {
					set((state) => {
						const updatedProjects = state.projects.map((project) =>
							project.id === projectId
								? { ...project, ...updates, updatedAt: new Date() }
								: project,
						);
						return {
							projects: updatedProjects,
							error: null,
						};
					});
				} catch (error) {
					console.error(`Error updating project: ${error}`);
					set({ error: "Error updating project" });
				}
			},

			deleteProject: (projectId) => {
				try {
					set((state) => {
						const filteredProjects = state.projects.filter(
							(project) => project.id !== projectId,
						);
						return {
							projects: filteredProjects,
							selectedProjectId:
								state.selectedProjectId === projectId
									? null
									: state.selectedProjectId,
							error: null,
						};
					});
				} catch (error) {
					console.error(`Error deleting project: ${error}`);
					set({ error: "Error deleting project" });
				}
			},

			// Project selection
			selectProject: (projectId) => {
				set({ selectedProjectId: projectId });
			},

			// State management
			setError: (error) => set({ error }),
			clearError: () => set({ error: null }),
		}),
		{
			name: "projects-storage", // unique name for localStorage
			storage: createJSONStorage(() => localStorage),
			// Only persist these parts of the state
			partialize: (state) => ({
				projects: state.projects,
				selectedProjectId: state.selectedProjectId,
			}),
			// Handle errors during storage operations
			onRehydrateStorage: () => (state) => {
				// This function runs after rehydration
				if (state) {
					// Validate projects after rehydration
					const validProjects = state.projects.filter((project) => {
						// Ensure all required fields are present
						return (
							project.id &&
							project.name &&
							project.createdAt &&
							project.updatedAt
						);
					});

					// If some projects were invalid, update the state
					if (validProjects.length !== state.projects.length) {
						state.projects = validProjects;
					}
				}
			},
		},
	),
);
