import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
    isLoading?: boolean;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "default",
            isLoading,
            children,
            ...props
        },
        ref,
    ) => {
        return (
            <Button
                ref={ref}
                className={cn(
                    "transition-all duration-200",
                    {
                        "bg-primary text-primary-foreground hover:bg-primary/90":
                            variant === "primary",
                        "bg-secondary text-secondary-foreground hover:bg-secondary/80":
                            variant === "secondary",
                        "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground":
                            variant === "outline",
                        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
                        "h-9 px-4 py-2": size === "default",
                        "h-8 rounded-md px-3 text-xs": size === "sm",
                        "h-10 rounded-md px-8": size === "lg",
                    },
                    className,
                )}
                disabled={isLoading}
                {...props}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Loading...</span>
                    </div>
                ) : (
                    children
                )}
            </Button>
        );
    },
);

ActionButton.displayName = "ActionButton";
