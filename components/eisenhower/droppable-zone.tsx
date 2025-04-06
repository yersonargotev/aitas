import { cn } from "@/lib/utils"
import { useDroppable } from "@dnd-kit/core"
import { AnimatePresence, motion } from "framer-motion"

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
        <motion.div
            ref={setNodeRef}
            className={cn(
                "transition-all duration-200",
                {
                    "ring-2 ring-primary ring-offset-2": isOver,
                    "bg-primary/5": isOver,
                },
                className
            )}
            animate={{
                scale: isOver ? 1.02 : 1,
                transition: { duration: 0.2 }
            }}
        >
            <AnimatePresence>
                {isOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none"
                    />
                )}
            </AnimatePresence>
            {children}
        </motion.div>
    )
} 