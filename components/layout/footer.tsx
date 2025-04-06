export function Footer() {
    return (
        <footer className="border-t py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Eisenhower Task Manager</p>
                    <p>
                        Desarrollado con ❤️ usando Next.js, Tailwind CSS y TypeScript
                    </p>
                </div>
            </div>
        </footer>
    );
} 