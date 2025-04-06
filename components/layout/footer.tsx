import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Eisenhower Task Manager</p>
                    <p>
                        Developed by <Link href="https://github.com/yargote69" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline-offset-2 underline">me</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
} 