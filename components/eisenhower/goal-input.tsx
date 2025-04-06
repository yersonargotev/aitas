"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";

interface GoalInputProps {
    onGoalChange: (goal: string) => void;
    className?: string;
}

export function GoalInput({ onGoalChange, className }: GoalInputProps) {
    const [goal, setGoal] = useState("");

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newGoal = e.target.value;
        setGoal(newGoal);
        onGoalChange(newGoal);
    };

    return (
        <div className={`relative ${className}`}>
            <Input
                type="text"
                placeholder="Enter your goal (optional)"
                value={goal}
                onChange={handleGoalChange}
                className="w-full"
            />
        </div>
    );
} 