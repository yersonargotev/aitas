"use client";

import { ProjectForm } from "@/components/projects/project-form";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { Check, Folder } from "lucide-react";

export function ProjectSelector() {
    const { projects, addProject, selectedProjectId, selectProject } = useProjectStore();
    const { setFilter } = useTaskStore();

    const handleProjectCreate = (project: { name: string; description?: string; icon?: string }) => {
        addProject(project);
    };

    const handleProjectSelect = (projectId: string | null) => {
        selectProject(projectId);
        // @ts-ignore - we've extended the types but TypeScript doesn't recognize it yet
        setFilter("projectId", projectId === null ? undefined : projectId);
    };

    const selectedProject = projects.find((project) => project.id === selectedProjectId);

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        <span>
                            {selectedProject ? selectedProject.name : "All Projects"}
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() => handleProjectSelect(null)}
                            className="flex items-center justify-between"
                        >
                            <span>All Projects</span>
                            {selectedProjectId === null && (
                                <Check className="h-4 w-4" />
                            )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {projects.map((project) => (
                            <DropdownMenuItem
                                key={project.id}
                                onClick={() => handleProjectSelect(project.id)}
                                className="flex items-center justify-between"
                            >
                                <span>{project.name}</span>
                                {selectedProjectId === project.id && (
                                    <Check className="h-4 w-4" />
                                )}
                            </DropdownMenuItem>
                        ))}

                        {projects.length === 0 && (
                            <DropdownMenuItem disabled>
                                No projects available
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <ProjectForm
                onSubmit={handleProjectCreate}
                trigger={
                    <Button variant="ghost" size="sm">
                        New Project
                    </Button>
                }
            />
        </div>
    );
} 