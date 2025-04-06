"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { TaskPriority } from "@/lib/stores/types";
import { cn } from "@/lib/utils";

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
    { value: "all", label: "Todas las prioridades" },
    { value: "urgent", label: "Urgente" },
    { value: "important", label: "Importante" },
    { value: "delegate", label: "Delegar" },
    { value: "eliminate", label: "Eliminar" },
    { value: "unclassified", label: "Sin clasificar" },
];

const statusOptions = [
    { value: "all", label: "Todas las tareas" },
    { value: "pending", label: "Pendientes" },
    { value: "completed", label: "Completadas" },
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
