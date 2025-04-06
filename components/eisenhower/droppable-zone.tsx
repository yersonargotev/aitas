import { cn } from "@/lib/utils"
import { useDroppable } from "@dnd-kit/core"

interface DroppableZoneProps {
    id: string
    children: React.ReactNode
    className?: string
}

export function DroppableZone({ id, children, className }: DroppableZoneProps) {
    const { isOver, setNodeRef } = useDroppable({
        id,
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "transition-colors duration-200",
                {
                    "ring-2 ring-primary ring-offset-2": isOver,
                },
                className
            )}
        >
            {children}
        </div>
    )
} 