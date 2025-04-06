"use client";

import { ActionButton } from "@/components/eisenhower/action-button";
import { useTaskStore } from "@/lib/stores/task-store";
import type { TaskPriority } from "@/lib/stores/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AIClassifyButton() {
    const { tasks, moveTask, setError, clearError } = useTaskStore();
    const [isClassifying, setIsClassifying] = useState(false);

    // Get unclassified tasks
    const unclassifiedTasks = tasks.filter(task => task.priority === "unclassified");

    const handleClassify = async () => {
        if (unclassifiedTasks.length === 0) {
            toast.info("No unclassified tasks to classify");
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
                body: JSON.stringify({ tasks: tasksToClassify }),
            });

            console.log("API response status:", response.status);

            // Get the response text first for debugging
            const responseText = await response.text();
            console.log("API response text:", responseText);

            let classifications: Record<string, string> | { error: string };

            try {
                // Try to parse the response as JSON
                classifications = JSON.parse(responseText);
            } catch (parseError) {
                console.error("Error parsing API response as JSON:", parseError);
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
            }

            if (!response.ok) {
                throw new Error('error' in classifications ? classifications.error : 'Failed to classify tasks');
            }

            console.log("Parsed classifications:", classifications);

            // Apply classifications to tasks
            let classifiedCount = 0;
            for (const [taskId, priority] of Object.entries(classifications)) {
                if (typeof priority === "string" &&
                    ["urgent", "important", "delegate", "eliminate"].includes(priority)) {
                    moveTask(taskId, priority as TaskPriority);
                    classifiedCount++;
                }
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
        <ActionButton
            onClick={handleClassify}
            disabled={isClassifying || unclassifiedTasks.length === 0}
            className="flex items-center gap-2"
        >
            {isClassifying && <Loader2 className="h-4 w-4 animate-spin" />}
            {isClassifying ? "Classifying..." : "Classify Tasks"}
        </ActionButton>
    );
} 