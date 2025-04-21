"use client";

import { ActionButton } from "@/components/eisenhower/action-button";
import { AIClassifyButton } from "@/components/eisenhower/ai-classify-button";
import { DndContextProvider } from "@/components/eisenhower/dnd-context-provider";
import { DroppableZone } from "@/components/eisenhower/droppable-zone";
import { ProjectSelector } from "@/components/eisenhower/project-selector";
import { TaskCard } from "@/components/eisenhower/task-card";
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
import { cn } from "@/lib/utils";
import type {
    DragEndEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import { AlertTriangle, CheckCircle2, CircleDot, Trash2 } from "lucide-react";

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    projectId?: string;
    dueDate?: Date;
    completed?: boolean;
}

// Priority color and icon mapping
const priorityConfig: Record<TaskPriority, { color: string, bgColor: string, icon: React.ReactNode, label: string }> = {
    urgent: {
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-950/30",
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        label: "Do First"
    },
    important: {
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        icon: <CircleDot className="h-4 w-4 text-blue-600" />,
        label: "Schedule"
    },
    delegate: {
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
        icon: <CircleDot className="h-4 w-4 text-amber-600" />,
        label: "Delegate"
    },
    eliminate: {
        color: "text-gray-600",
        bgColor: "bg-gray-50 dark:bg-gray-900/50",
        icon: <Trash2 className="h-4 w-4 text-gray-600" />,
        label: "Eliminate"
    },
    unclassified: {
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-950/30",
        icon: <CircleDot className="h-4 w-4 text-purple-600" />,
        label: "Unclassified"
    }
};

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto">
                    <TaskForm
                        onSubmit={handleTaskCreate}
                        trigger={
                            <ActionButton className="w-full sm:w-auto">
                                New Task
                            </ActionButton>
                        }
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <AIClassifyButton />
                </div>
                <div className="mt-3 sm:mt-0">
                    <ProjectSelector />
                </div>
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

                {/* Matrix header grid layout */}
                <div className="relative">
                    {/* Horizontal labels (Urgent / Not Urgent) */}
                    <div className="hidden md:flex justify-between px-10 lg:px-16 mb-2">
                        <div className="w-1/2 text-center font-medium border-b-2 border-dashed pb-1">
                            Urgent
                        </div>
                        <div className="w-1/2 text-center font-medium border-b-2 border-dashed pb-1">
                            Not Urgent
                        </div>
                    </div>

                    {/* Vertical labels (Important / Not Important) */}
                    <div className="hidden lg:block absolute left-0 top-0 h-full">
                        <div className="grid grid-rows-2 h-full">
                            <div className="flex items-center justify-center pb-4 pl-4">
                                <div className="transform -rotate-90 origin-bottom-left whitespace-nowrap absolute top-1/4 -translate-y-1/2 -left-5">
                                    <span className="font-medium">Important</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center pt-4 pl-4">
                                <div className="transform -rotate-90 origin-bottom-left whitespace-nowrap absolute top-3/4 -translate-y-1/2 -left-5">
                                    <span className="font-medium">Not Important</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Matrix grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-5 lg:mx-12">
                        {Object.entries(tasksByPriority).map(([priority, tasks], index) => {
                            const config = priorityConfig[priority as TaskPriority];

                            // Determine border positions based on index for the matrix layout
                            let borderClasses = "";
                            if (index === 0) { // urgent (top-left)
                                borderClasses = "md:border-r md:border-b";
                            } else if (index === 1) { // important (top-right)
                                borderClasses = "md:border-b";
                            } else if (index === 2) { // delegate (bottom-left)
                                borderClasses = "md:border-r";
                            }

                            return (
                                <DroppableZone
                                    key={priority}
                                    id={priority}
                                    className={cn(
                                        "min-h-[250px] h-full rounded-lg border",
                                        `${borderClasses}`,
                                        config.bgColor
                                    )}
                                >
                                    <div className="flex flex-col h-full p-3 md:p-4">
                                        <div className={cn(
                                            "flex items-center justify-between mb-4 pb-2 border-b",
                                            config.color
                                        )}>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {config.icon}
                                                <h2 className="text-lg font-semibold capitalize">
                                                    {priority}
                                                </h2>
                                                <span className="text-xs font-normal text-muted-foreground whitespace-nowrap">
                                                    ({config.label})
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium ml-1 flex-shrink-0">
                                                {tasks.length}
                                            </span>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
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
                            );
                        })}
                    </div>
                </div>
            </DndContextProvider>

            {/* Completed Tasks Accordion */}
            {completedTasks.length > 0 && (
                <Accordion type="single" collapsible className="w-full mt-8">
                    <AccordionItem value="completed-tasks">
                        <AccordionTrigger className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span>Completed Tasks ({completedTasks.length})</span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                {Object.entries(tasksByPriority).map(([priority]) => {
                                    const priorityCompletedTasks = completedTasks.filter(
                                        task => task.priority === priority
                                    );

                                    if (priorityCompletedTasks.length === 0) return null;

                                    const config = priorityConfig[priority as TaskPriority];

                                    return (
                                        <div
                                            key={`completed-${priority}`}
                                            className={cn(
                                                "flex flex-col gap-3 rounded-lg border p-3",
                                                config.bgColor
                                            )}
                                        >
                                            <div className={cn(
                                                "flex items-center justify-between pb-2 border-b",
                                                config.color
                                            )}>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {config.icon}
                                                    <h3 className="text-md font-medium capitalize">
                                                        {priority}
                                                    </h3>
                                                </div>
                                                <span className="text-sm text-muted-foreground flex-shrink-0">
                                                    {priorityCompletedTasks.length}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
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
