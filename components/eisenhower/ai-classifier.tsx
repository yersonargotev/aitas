'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "urgent" | "important" | "delegate" | "eliminate" | "unclassified";
    dueDate?: Date;
}

interface AIClassifierProps {
    tasks: Task[];
    onTasksClassified: (classifications: Record<string, Task['priority']>) => void;
}

export function AIClassifier({ tasks, onTasksClassified }: AIClassifierProps) {
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [isClassifying, setIsClassifying] = useState(false);

    const toggleTaskSelection = (taskId: string) => {
        const newSelection = new Set(selectedTasks);
        if (newSelection.has(taskId)) {
            newSelection.delete(taskId);
        } else {
            newSelection.add(taskId);
        }
        setSelectedTasks(newSelection);
    };

    const handleClassify = async () => {
        if (selectedTasks.size === 0) {
            toast.error('Please select at least one task to classify');
            return;
        }

        setIsClassifying(true);
        try {
            const tasksToClassify = tasks.filter(task => selectedTasks.has(task.id));

            const response = await fetch('/api/classify-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tasks: tasksToClassify }),
            });

            if (!response.ok) {
                throw new Error('Failed to classify tasks');
            }

            const classifications = await response.json();
            onTasksClassified(classifications);
            toast.success('Tasks classified successfully');
            setSelectedTasks(new Set());
        } catch (error) {
            console.error('Error classifying tasks:', error);
            toast.error('Failed to classify tasks. Please try again.');
        } finally {
            setIsClassifying(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Task Classification</h3>
                <Button
                    onClick={handleClassify}
                    disabled={selectedTasks.size === 0 || isClassifying}
                >
                    {isClassifying ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Classifying...
                        </>
                    ) : (
                        'Classify Selected Tasks'
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-start space-x-2 p-2 rounded-lg border"
                    >
                        <Checkbox
                            checked={selectedTasks.has(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                        />
                        <div className="flex-1">
                            <h4 className="font-medium">{task.title}</h4>
                            {task.description && (
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 