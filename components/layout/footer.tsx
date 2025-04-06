import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Task Manager. {" "}
                        <span>
                            Developed by <Link href="https://github.com/yesonargotev" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline-offset-2 underline">me</Link>
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
} 