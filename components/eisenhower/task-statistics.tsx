"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TaskPriority } from "@/lib/stores/types";
import { cn } from "@/lib/utils";

interface TaskStatisticsProps {
    statistics: {
        totalTasks: number;
        completedTasks: number;
        tasksByPriority: Record<TaskPriority, number>;
        completedTasksByPriority: Record<TaskPriority, number>;
    };
}

const priorityLabels: Record<TaskPriority, string> = {
    urgent: "Urgent",
    important: "Important",
    delegate: "Delegate",
    eliminate: "Eliminate",
    unclassified: "Unclassified",
};

const priorityColors: Record<TaskPriority, string> = {
    urgent: "text-red-500",
    important: "text-blue-500",
    delegate: "text-yellow-500",
    eliminate: "text-gray-500",
    unclassified: "text-slate-500",
};

export function TaskStatistics({ statistics }: TaskStatisticsProps) {
    const completionRate =
        statistics.totalTasks > 0
            ? Math.round((statistics.completedTasks / statistics.totalTasks) * 100)
            : 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Task Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Tasks</span>
                        <span className="text-sm">{statistics.totalTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Completed Tasks</span>
                        <span className="text-sm">{statistics.completedTasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Completion Rate</span>
                        <span className="text-sm">{completionRate}%</span>
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Tasks by Priority</h4>
                        <div className="space-y-2">
                            {(Object.keys(statistics.tasksByPriority) as TaskPriority[]).map(
                                (priority) => (
                                    <div
                                        key={priority}
                                        className="flex items-center justify-between"
                                    >
                                        <span className={cn("text-sm", priorityColors[priority])}>
                                            {priorityLabels[priority]}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">
                                                {statistics.completedTasksByPriority[priority]}/
                                                {statistics.tasksByPriority[priority]}
                                            </span>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
