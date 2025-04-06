"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { TaskPriority } from "@/lib/stores/types";

interface TaskFiltersProps {
    filters: {
        priority: TaskPriority | "all";
        status: "all" | "completed" | "pending";
    };
    onFilterChange: (
        filterType: "priority" | "status",
        value: TaskPriority | "all" | "completed" | "pending",
    ) => void;
}

const priorityOptions: { value: TaskPriority | "all"; label: string }[] = [
    { value: "all", label: "All Priorities" },
    { value: "urgent", label: "Urgent" },
    { value: "important", label: "Important" },
    { value: "delegate", label: "Delegate" },
    { value: "eliminate", label: "Eliminate" },
    { value: "unclassified", label: "Unclassified" },
];

const statusOptions = [
    { value: "all", label: "All Tasks" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
];

export function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
            <div className="flex-1">
                <Select
                    value={filters.priority}
                    onValueChange={(value) =>
                        onFilterChange("priority", value as TaskPriority | "all")
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                        {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1">
                <Select
                    value={filters.status}
                    onValueChange={(value) =>
                        onFilterChange("status", value as "all" | "completed" | "pending")
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
