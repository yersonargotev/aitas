"use client"

import { Matrix } from "@/components/eisenhower/matrix"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTasks } from "@/lib/hooks/use-tasks"
import { AlertCircle } from "lucide-react"

export default function Home() {
  const {
    tasks,
    isHydrated,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks()

  // Wrapper function to handle task editing
  const handleTaskEdit = (taskId: string) => {
    // For now, we'll just log the task ID
    // In a real implementation, you would open a modal or navigate to an edit page
    console.log("Edit task:", taskId)

    // Example of how you would update a task:
    // updateTask(taskId, { title: "Updated title" })
  }

  // Show loading state while the store is being hydrated
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Preparing your Eisenhower Matrix</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Eisenhower Matrix</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Organize your tasks based on their urgency and importance using the Eisenhower Matrix.
          Prioritize what really matters and make better decisions about your time.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Matrix />
    </div>
  )
}
