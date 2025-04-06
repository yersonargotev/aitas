"use client";

import { ActionButton } from "@/components/eisenhower/action-button";
import { AIClassifyButton } from "@/components/eisenhower/ai-classify-button";
import { DndContextProvider } from "@/components/eisenhower/dnd-context-provider";
import { DroppableZone } from "@/components/eisenhower/droppable-zone";
import { TaskCard } from "@/components/eisenhower/task-card";
import { TaskFilters } from "@/components/eisenhower/task-filters";
import { TaskForm } from "@/components/eisenhower/task-form";
import { TaskStatistics } from "@/components/eisenhower/task-statistics";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { useTaskStore } from "@/lib/stores/task-store";
import type { TaskPriority } from "@/lib/stores/types";
import type {
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
} from "@dnd-kit/core";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
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
    } = useTaskStore();

    const [activeId, setActiveId] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((task) => task.id === active.id);
        if (!activeTask) return;

        const overId = over.id as string;
        if (activeTask.priority === overId) return;

        moveTask(activeTask.id, overId as TaskPriority);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
    };

    const handleTaskCreate = (task: Omit<Task, "id">) => {
        addTask(task);
    };

    const handleTaskEdit = (taskId: string, updates?: { title?: string; description?: string }) => {
        if (updates) {
            // If updates are provided, update the task
            updateTask(taskId, updates);
            setEditingTaskId(null);
        } else {
            // Otherwise, set the task as being edited
            setEditingTaskId(taskId);
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

    // Filter tasks based on current filters
    const filteredTasks = tasks.filter((task) => {
        if (filters.priority !== "all" && task.priority !== filters.priority) {
            return false;
        }
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
    console.log("activeTasks", activeTasks);
    console.log("completedTasks", completedTasks);

    // Group active tasks by priority
    const tasksByPriority = {
        urgent: activeTasks.filter((task) => task.priority === "urgent"),
        important: activeTasks.filter((task) => task.priority === "important"),
        delegate: activeTasks.filter((task) => task.priority === "delegate"),
        eliminate: activeTasks.filter((task) => task.priority === "eliminate"),
        unclassified: activeTasks.filter(
            (task) => task.priority === "unclassified",
        ),
    };

    return (
        <div className="space-y-6">
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
            <div className="flex flex-col gap-4">
                <div className="flex-1">
                    <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
                </div>
            </div>

            <DndContextProvider
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                    {Object.entries(tasksByPriority).map(([priority, tasks]) => (
                        <DroppableZone
                            key={priority}
                            id={priority}
                            className="min-h-[200px]"
                        >
                            <div className="space-y-4 h-full">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold capitalize">
                                        {priority}
                                    </h2>
                                    <span className="text-sm text-muted-foreground">
                                        {tasks.length} tasks
                                    </span>
                                </div>
                                <div className="space-y-2 h-full">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                {Object.entries(tasksByPriority).map(([priority, _]) => {
                                    const priorityCompletedTasks = completedTasks.filter(
                                        task => task.priority === priority
                                    );

                                    if (priorityCompletedTasks.length === 0) return null;

                                    return (
                                        <div key={`completed-${priority}`} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-md font-medium capitalize">
                                                    {priority}
                                                </h3>
                                                <span className="text-sm text-muted-foreground">
                                                    {priorityCompletedTasks.length} tasks
                                                </span>
                                            </div>
                                            <div className="space-y-2">
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
