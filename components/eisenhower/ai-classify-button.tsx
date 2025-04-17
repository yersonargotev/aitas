"use client";

import { ActionButton } from "@/components/eisenhower/action-button";
import { GoalInput } from "@/components/eisenhower/goal-input";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";
import type { TaskPriority } from "@/lib/stores/types";
import { Loader2, Sparkle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AIClassifyButton() {
    const { tasks, moveTask, setError, clearError } = useTaskStore();
    const { selectedProjectId } = useProjectStore();
    const [isClassifying, setIsClassifying] = useState(false);
    const [goal, setGoal] = useState("");

    // Get unclassified tasks from the current project only
    const unclassifiedTasks = tasks.filter(
        task => task.priority === "unclassified" &&
            (selectedProjectId ? task.projectId === selectedProjectId : !task.projectId)
    );

    const handleClassify = async () => {
        if (unclassifiedTasks.length === 0) {
            toast.info("No unclassified tasks to classify in the current project");
            return;
        }

        setIsClassifying(true);

        try {
            // Prepare tasks for the API
            const tasksToClassify = unclassifiedTasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description || ""
            }));

            console.log("Sending tasks to classify:", tasksToClassify);

            // Send the request to the API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tasks: tasksToClassify,
                    goal: goal,
                    projectId: selectedProjectId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to classify tasks');
            }

            // Parse the response
            const classifications = await response.json();
            console.log("Received classifications:", classifications);

            // Apply classifications to tasks
            let classifiedCount = 0;
            for (const [taskId, priority] of Object.entries(classifications)) {
                moveTask(taskId, priority as TaskPriority);
                classifiedCount++;
            }

            if (classifiedCount > 0) {
                toast.success(`Successfully classified ${classifiedCount} tasks!`);
            } else {
                toast.warning("No tasks were classified. Please try again.");
            }

            clearError();
        } catch (error) {
            console.error("Error in AI classification:", error);
            setError("Failed to classify tasks with AI");
            toast.error(`Failed to classify tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsClassifying(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <ActionButton
                onClick={handleClassify}
                disabled={isClassifying || unclassifiedTasks.length === 0}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
                <Sparkle className="h-4 w-4 animate-pulse transition-all duration-300" />
                {isClassifying && <Loader2 className="h-4 w-4 animate-spin" />}
                {isClassifying ? "Classifying..." : "Classify Tasks"}
            </ActionButton>
            <GoalInput
                onGoalChange={setGoal}
                className="w-full sm:w-64"
            />
        </div>
    );
} 