"use client";

import { ActionButton } from "@/components/eisenhower/action-button";
import { AIClassifyButton } from "@/components/eisenhower/ai-classify-button";
import { DndContextProvider } from "@/components/eisenhower/dnd-context-provider";
import { DroppableZone } from "@/components/eisenhower/droppable-zone";
import { ProjectSelector } from "@/components/eisenhower/project-selector";
import { TaskCard } from "@/components/eisenhower/task-card";
import { TaskFilters } from "@/components/eisenhower/task-filters";
import { TaskForm } from "@/components/eisenhower/task-form";
import { TaskStatistics } from "@/components/eisenhower/task-statistics";
import { UnclassifiedTasksSection } from "@/components/eisenhower/unclassified-tasks-section";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";
import type { TaskPriority } from "@/lib/stores/types";
import type {
    DragEndEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import { CheckCircle2 } from "lucide-react";

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    projectId?: string;
    dueDate?: Date;
    completed?: boolean;
}

export function Matrix() {
    const {
        tasks,
        filters,
        statistics,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        toggleTaskCompletion,
        setFilter,
        reorderTasks,
    } = useTaskStore();

    const { selectedProjectId } = useProjectStore();

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((task) => task.id === active.id);
        if (!activeTask) return;

        const overId = over.id as string;

        // If dropping on another task, handle reordering
        if (over.data.current?.type === "task") {
            const overTask = tasks.find((task) => task.id === over.id);
            if (overTask && activeTask.priority === overTask.priority) {
                reorderTasks(activeTask.id, overTask.id);
                return;
            }
        }

        // If dropping on a zone, handle moving between priorities
        if (activeTask.priority !== overId) {
            moveTask(activeTask.id, overId as TaskPriority);
        }
    };

    const handleTaskCreate = (task: Omit<Task, "id">) => {
        // Add project ID to the task if a project is selected
        const taskWithProject = selectedProjectId
            ? { ...task, projectId: selectedProjectId }
            : task;

        addTask(taskWithProject);
    };

    const handleTaskEdit = (taskId: string, updates?: { title?: string; description?: string }) => {
        if (updates) {
            // If updates are provided, update the task
            updateTask(taskId, updates);
        }
    };

    const handleTaskDelete = (taskId: string) => {
        deleteTask(taskId);
    };

    const handleFilterChange = (
        filterType: "priority" | "status",
        value: TaskPriority | "all" | "completed" | "pending",
    ) => {
        setFilter(filterType, value);
    };

    // Filter tasks based on current filters and selected project
    const filteredTasks = tasks.filter((task) => {
        // Filter by project
        if (selectedProjectId && task.projectId !== selectedProjectId) {
            return false;
        }

        // Filter by priority
        if (filters.priority !== "all" && task.priority !== filters.priority) {
            return false;
        }

        // Filter by status
        if (filters.status === "completed" && !task.completed) {
            return false;
        }
        if (filters.status === "pending" && task.completed) {
            return false;
        }

        return true;
    });

    // Separate completed and active tasks
    const completedTasks = filteredTasks.filter(task => task.completed);
    const activeTasks = filteredTasks.filter(task => !task.completed);

    // Group active tasks by priority
    const tasksByPriority = {
        urgent: activeTasks.filter((task) => task.priority === "urgent"),
        important: activeTasks.filter((task) => task.priority === "important"),
        delegate: activeTasks.filter((task) => task.priority === "delegate"),
        eliminate: activeTasks.filter((task) => task.priority === "eliminate"),
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Handle reordering if dropping on another task
        if (over.data.current?.type === "task") {
            const activeTask = tasks.find((task) => task.id === active.id);
            const overTask = tasks.find((task) => task.id === over.id);

            if (activeTask && overTask && activeTask.priority === overTask.priority) {
                reorderTasks(activeTask.id, overTask.id);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2">
                    <TaskForm
                        onSubmit={handleTaskCreate}
                        trigger={
                            <ActionButton>
                                New Task
                            </ActionButton>
                        }
                    />
                    <AIClassifyButton />
                </div>
                <ProjectSelector />
            </div>

            <DndContextProvider
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <UnclassifiedTasksSection
                    tasks={filteredTasks}
                    onEdit={handleTaskEdit}
                    onDelete={handleTaskDelete}
                    onToggleComplete={toggleTaskCompletion}
                />

                <div className="flex flex-col gap-4">
                    <div className="flex-1">
                        <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(tasksByPriority).map(([priority, tasks]) => (
                        <DroppableZone
                            key={priority}
                            id={priority}
                            className="min-h-[200px] h-full"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold capitalize">
                                        {priority}
                                    </h2>
                                    <span className="text-sm text-muted-foreground">
                                        {tasks.length} tasks
                                    </span>
                                </div>
                                <div className="flex-1 flex flex-col gap-3">
                                    {tasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            {...task}
                                            onEdit={(updates) => handleTaskEdit(task.id, updates)}
                                            onDelete={() => handleTaskDelete(task.id)}
                                            onToggleComplete={() => toggleTaskCompletion(task.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </DroppableZone>
                    ))}
                </div>
            </DndContextProvider>

            {/* Completed Tasks Accordion */}
            {completedTasks.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="completed-tasks">
                        <AccordionTrigger className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span>Completed Tasks ({completedTasks.length})</span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                {Object.entries(tasksByPriority).map(([priority]) => {
                                    const priorityCompletedTasks = completedTasks.filter(
                                        task => task.priority === priority
                                    );

                                    if (priorityCompletedTasks.length === 0) return null;

                                    return (
                                        <div key={`completed-${priority}`} className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-md font-medium capitalize">
                                                    {priority}
                                                </h3>
                                                <span className="text-sm text-muted-foreground">
                                                    {priorityCompletedTasks.length} tasks
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                {priorityCompletedTasks.map((task) => (
                                                    <TaskCard
                                                        key={task.id}
                                                        {...task}
                                                        onEdit={(updates) => handleTaskEdit(task.id, updates)}
                                                        onDelete={() => handleTaskDelete(task.id)}
                                                        onToggleComplete={() => toggleTaskCompletion(task.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}

            <div className="w-full mx-auto">
                <TaskStatistics statistics={statistics} />
            </div>
        </div>
    );
}
