import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

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

    return (
        <DndContext
            sensors={sensors}
            modifiers={[restrictToWindowEdges]}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragStart={onDragStart}
        >
            {children}
        </DndContext>
    );
}
