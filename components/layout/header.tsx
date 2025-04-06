import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function Header() {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl">
                    Eisenhower Tasks
                </Link>

                <nav className="flex items-center gap-6">
                    <Link href="/tasks" className="text-sm hover:text-primary">
                        Mis Tareas
                    </Link>
                    <Link href="/about" className="text-sm hover:text-primary">
                        Acerca de
                    </Link>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
} 