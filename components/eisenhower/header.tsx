import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

interface HeaderProps {
    onNewTask?: () => void
}

export function Header({ onNewTask }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <a className="mr-6 flex items-center space-x-2" href="/">
                        <span className="font-bold">Eisenhower Matrix</span>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center space-x-2">
                        <Button
                            onClick={onNewTask}
                            className="mr-2"
                            aria-label="Create new task"
                        >
                            New Task
                        </Button>
                        <ThemeToggle />
                    </nav>
                </div>
            </div>
        </header>
    )
} 