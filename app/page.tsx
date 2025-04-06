"use client"

import { EisenhowerMatrix } from "@/components/eisenhower/matrix"
import { useState } from "react"

interface Task {
  id: string
  title: string
  description?: string
  priority: "urgent" | "important" | "delegate" | "eliminate" | "unclassified"
  dueDate?: Date
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])

  const handleTaskCreate = (task: Task) => {
    setTasks((prev) => [...prev, task])
  }

  const handleTaskEdit = (taskId: string) => {
    // TODO: Implement task editing
    console.log("Edit task:", taskId)
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const handleTaskMove = (taskId: string, newPriority: Task["priority"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, priority: newPriority } : task
      )
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Matriz de Eisenhower</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Organiza tus tareas según su urgencia e importancia utilizando la matriz de Eisenhower.
          Prioriza lo que realmente importa y toma mejores decisiones sobre tu tiempo.
        </p>
      </div>

      <EisenhowerMatrix
        tasks={tasks}
        onTaskCreate={handleTaskCreate}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        onTaskMove={handleTaskMove}
      />
    </div>
  )
}
