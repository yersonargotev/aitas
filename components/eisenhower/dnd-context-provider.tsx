import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useState } from "react";
import { TaskCard } from "./task-card";

interface DndContextProviderProps {
    children: React.ReactNode;
    onDragEnd: (event: DragEndEvent) => void;
    onDragOver?: (event: DragOverEvent) => void;
    onDragStart?: (event: DragStartEvent) => void;
}

export function DndContextProvider({
    children,
    onDragEnd,
    onDragOver,
    onDragStart,
}: DndContextProviderProps) {
    const [activeTask, setActiveTask] = useState<{
        id: string;
        title: string;
        description?: string;
        priority: "urgent" | "important" | "delegate" | "eliminate" | "unclassified";
        dueDate?: Date;
    } | null>(null);

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10, // Minimum distance before activation
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250, // Delay before activation
            tolerance: 5, // Tolerance for movement
        },
    });

    const sensors = useSensors(mouseSensor, touchSensor);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const taskData = active.data.current?.task;

        if (taskData) {
            setActiveTask(taskData);
        }

        onDragStart?.(event);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        onDragEnd(event);
    };

    return (
        <DndContext
            sensors={sensors}
            modifiers={[restrictToWindowEdges]}
            onDragEnd={handleDragEnd}
            onDragOver={onDragOver}
            onDragStart={handleDragStart}
        >
            {children}
            <DragOverlay>
                {activeTask && (
                    <div className="transform scale-105 rotate-3">
                        <TaskCard
                            {...activeTask}
                            className="shadow-xl"
                            isDragging
                        />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
