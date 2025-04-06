import { Card } from "@/components/ui/card";

type Quadrant = {
    title: string;
    description: string;
    tasks: Task[];
};

type Task = {
    id: string;
    title: string;
    completed: boolean;
};

export function TaskMatrix() {
    const quadrants: Record<string, Quadrant> = {
        q1: {
            title: "Urgente y Importante",
            description: "Hazlo ahora",
            tasks: [],
        },
        q2: {
            title: "Importante pero no Urgente",
            description: "Programa para hacerlo",
            tasks: [],
        },
        q3: {
            title: "Urgente pero no Importante",
            description: "Delega si es posible",
            tasks: [],
        },
        q4: {
            title: "Ni Urgente ni Importante",
            description: "Elimina o pospon",
            tasks: [],
        },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(quadrants).map(([key, quadrant]) => (
                <Card key={key} className="p-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg">{quadrant.title}</h3>
                            <p className="text-sm text-muted-foreground">{quadrant.description}</p>
                        </div>

                        <div className="space-y-2">
                            {quadrant.tasks.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No hay tareas en este cuadrante
                                </p>
                            ) : (
                                quadrant.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            className="rounded"
                                        />
                                        <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                                            {task.title}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
} 