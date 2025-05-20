"use client";

import { TaskStatistics } from "@/components/eisenhower/task-statistics";
import { useTaskStore } from "@/lib/stores/task-store";

export function TaskStatisticsDashboard() {
    const { statistics } = useTaskStore();

    if (!statistics) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                Loading statistics...
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 sm:py-6">
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                <TaskStatistics statistics={statistics} />
            </div>
        </div>
    );
}