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
        <Card className="w-full h-full">
            <CardHeader className="px-4 py-3">
                <CardTitle className="text-lg">Task Statistics</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-2">
                <div className="grid gap-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                            <span className="text-xs sm:text-sm font-medium">Total Tasks</span>
                            <span className="text-xs sm:text-sm font-bold">{statistics.totalTasks}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                            <span className="text-xs sm:text-sm font-medium">Completed</span>
                            <span className="text-xs sm:text-sm font-bold">{statistics.completedTasks}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-md col-span-2 sm:col-span-1">
                            <span className="text-xs sm:text-sm font-medium">Completion</span>
                            <span className="text-xs sm:text-sm font-bold">{completionRate}%</span>
                        </div>
                    </div>
                    <div className="border-t mt-1 pt-2">
                        <h4 className="text-xs sm:text-sm font-medium mb-2">Tasks by Priority</h4>
                        <div className="grid gap-1.5">
                            {(Object.keys(statistics.tasksByPriority) as TaskPriority[]).map(
                                (priority) => (
                                    <div
                                        key={priority}
                                        className="flex items-center justify-between p-1.5 hover:bg-secondary/50 rounded-sm transition-colors"
                                    >
                                        <span className={cn("text-xs sm:text-sm font-medium", priorityColors[priority])}>
                                            {priorityLabels[priority]}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs sm:text-sm font-bold">
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
