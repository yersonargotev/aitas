import { TaskMatrix } from "@/components/tasks/task-matrix";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Matriz de Eisenhower</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Organiza tus tareas según su urgencia e importancia utilizando la matriz de Eisenhower.
          Prioriza lo que realmente importa y toma mejores decisiones sobre tu tiempo.
        </p>
      </div>

      <TaskMatrix />
    </div>
  );
}
