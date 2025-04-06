import {
    type DragEndEvent,
    DragOverEvent,
    DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { ActionButton } from "./action-button";
import { AIClassifier } from "./ai-classifier";
import { DndContextProvider } from "./dnd-context-provider";
import { DroppableZone } from "./droppable-zone";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "urgent" | "important" | "delegate" | "eliminate" | "unclassified";
    dueDate?: Date;
}

interface EisenhowerMatrixProps {
    tasks: Task[];
    onTaskCreate: (task: Task) => void;
    onTaskEdit?: (taskId: string) => void;
    onTaskDelete?: (taskId: string) => void;
    onTaskMove?: (taskId: string, newPriority: Task["priority"]) => void;
}

export function EisenhowerMatrix({
    tasks,
    onTaskCreate,
    onTaskEdit,
    onTaskDelete,
    onTaskMove,
}: EisenhowerMatrixProps) {
    const [showClassifier, setShowClassifier] = useState(false);

    const quadrants = {
        urgent: tasks.filter((task) => task.priority === "urgent"),
        important: tasks.filter((task) => task.priority === "important"),
        delegate: tasks.filter((task) => task.priority === "delegate"),
        eliminate: tasks.filter((task) => task.priority === "eliminate"),
        unclassified: tasks.filter((task) => task.priority === "unclassified"),
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id as string;
        const newPriority = over.id as Task["priority"];

        if (taskId && newPriority) {
            onTaskMove?.(taskId, newPriority);
        }
    };

    const handleTasksClassified = (classifications: Record<string, Task["priority"]>) => {
        for (const [taskId, priority] of Object.entries(classifications)) {
            onTaskMove?.(taskId, priority);
        }
        setShowClassifier(false);
    };

    return (
        <DndContextProvider onDragEnd={handleDragEnd}>
            <div className="relative w-full">
                {/* Task Form */}
                <div className="mb-4">
                    <TaskForm onSubmit={onTaskCreate} />
                </div>

                {/* AI Classifier Toggle */}
                <div className="mb-4">
                    <ActionButton
                        onClick={() => setShowClassifier(!showClassifier)}
                        variant="outline"
                    >
                        {showClassifier ? "Hide AI Classifier" : "Show AI Classifier"}
                    </ActionButton>
                </div>

                {/* AI Classifier */}
                {showClassifier && (
                    <div className="mb-6">
                        <AIClassifier
                            tasks={tasks}
                            onTasksClassified={handleTasksClassified}
                        />
                    </div>
                )}

                {/* Unclassified Tasks */}
                {quadrants.unclassified.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">
                            Tareas sin clasificar
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quadrants.unclassified.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    {...task}
                                    onEdit={() => onTaskEdit?.(task.id)}
                                    onDelete={() => onTaskDelete?.(task.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Headers */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center font-semibold text-lg">Urgente</div>
                    <div className="text-center font-semibold text-lg">No Urgente</div>
                </div>

                {/* Left side label */}
                <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 transform">
                    <div className="rotate-[-90deg] whitespace-nowrap">
                        <span className="font-semibold text-lg">Importante</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 relative">
                    {/* Urgent & Important */}
                    <DroppableZone
                        id="urgent"
                        className="rounded-lg border-2 border-red-200 bg-red-50/30 dark:bg-red-950/10 p-4"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                                Do it now
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Tareas que requieren atención inmediata
                            </p>
                        </div>
                        <div className="space-y-4 min-h-[200px]">
                            {quadrants.urgent.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    {...task}
                                    onEdit={() => onTaskEdit?.(task.id)}
                                    onDelete={() => onTaskDelete?.(task.id)}
                                />
                            ))}
                        </div>
                    </DroppableZone>

                    {/* Important & Not Urgent */}
                    <DroppableZone
                        id="important"
                        className="rounded-lg border-2 border-blue-200 bg-blue-50/30 dark:bg-blue-950/10 p-4"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                Decide
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Programa un tiempo específico para realizarlo
                            </p>
                        </div>
                        <div className="space-y-4 min-h-[200px]">
                            {quadrants.important.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    {...task}
                                    onEdit={() => onTaskEdit?.(task.id)}
                                    onDelete={() => onTaskDelete?.(task.id)}
                                />
                            ))}
                        </div>
                    </DroppableZone>

                    {/* Urgent & Not Important */}
                    <DroppableZone
                        id="delegate"
                        className="rounded-lg border-2 border-yellow-200 bg-yellow-50/30 dark:bg-yellow-950/10 p-4"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                                Delegate
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                ¿Quién puede hacerlo por ti?
                            </p>
                        </div>
                        <div className="space-y-4 min-h-[200px]">
                            {quadrants.delegate.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    {...task}
                                    onEdit={() => onTaskEdit?.(task.id)}
                                    onDelete={() => onTaskDelete?.(task.id)}
                                />
                            ))}
                        </div>
                    </DroppableZone>

                    {/* Not Urgent & Not Important */}
                    <DroppableZone
                        id="eliminate"
                        className="rounded-lg border-2 border-gray-200 bg-gray-50/30 dark:bg-gray-950/10 p-4"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                                Delete
                            </h2>
                            <p className="text-sm text-muted-foreground">Elimínalo</p>
                        </div>
                        <div className="space-y-4 min-h-[200px]">
                            {quadrants.eliminate.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    {...task}
                                    onEdit={() => onTaskEdit?.(task.id)}
                                    onDelete={() => onTaskDelete?.(task.id)}
                                />
                            ))}
                        </div>
                    </DroppableZone>
                </div>

                {/* Right side label */}
                <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 transform">
                    <div className="rotate-90 whitespace-nowrap">
                        <span className="font-semibold text-lg">No Importante</span>
                    </div>
                </div>
            </div>
        </DndContextProvider>
    );
}
