import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function Header() {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl">
                    Eisenhower Tasks
                </Link>

                <ThemeToggle />
            </div>
        </header>
    );
} 