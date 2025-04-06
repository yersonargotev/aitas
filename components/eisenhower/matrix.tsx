"use client";

import { ActionButton } from "@/components/eisenhower/action-button";
import { DndContextProvider } from "@/components/eisenhower/dnd-context-provider";
import { DroppableZone } from "@/components/eisenhower/droppable-zone";
import { TaskCard } from "@/components/eisenhower/task-card";
import { TaskFilters } from "@/components/eisenhower/task-filters";
import { TaskForm } from "@/components/eisenhower/task-form";
import { TaskStatistics } from "@/components/eisenhower/task-statistics";
import { useTaskStore } from "@/lib/stores/task-store";
import type { TaskPriority } from "@/lib/stores/types";
import type {
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
} from "@dnd-kit/core";
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

    const handleTaskEdit = (taskId: string) => {
        setEditingTaskId(taskId);
    };

    const handleTaskDelete = (taskId: string) => {
        deleteTask(taskId);
    };

    const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
        updateTask(taskId, updates);
        setEditingTaskId(null);
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

    // Group tasks by priority
    const tasksByPriority = {
        urgent: filteredTasks.filter((task) => task.priority === "urgent"),
        important: filteredTasks.filter((task) => task.priority === "important"),
        delegate: filteredTasks.filter((task) => task.priority === "delegate"),
        eliminate: filteredTasks.filter((task) => task.priority === "eliminate"),
        unclassified: filteredTasks.filter(
            (task) => task.priority === "unclassified",
        ),
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
                </div>
                <div className="w-full md:w-80">
                    <TaskStatistics statistics={statistics} />
                </div>
            </div>

            <DndContextProvider
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(tasksByPriority).map(([priority, tasks]) => (
                        <DroppableZone
                            key={priority}
                            id={priority}
                            className="min-h-[200px]"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold capitalize">
                                        {priority}
                                    </h2>
                                    <span className="text-sm text-muted-foreground">
                                        {tasks.length} tasks
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {tasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            {...task}
                                            onEdit={() => handleTaskEdit(task.id)}
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

            <TaskForm
                onSubmit={handleTaskCreate}
                trigger={
                    <ActionButton>
                        New Task
                    </ActionButton>
                }
            />
        </div>
    );
}
