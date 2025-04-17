"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";

type SidebarContextType = ReturnType<typeof useSidebar> | undefined;

export function Header({ showSidebarTrigger = false }: { showSidebarTrigger?: boolean }) {
    // Safely try to use the sidebar context if available
    let sidebarContext: SidebarContextType;
    try {
        sidebarContext = useSidebar();
    } catch (error) {
        // If the context is not available, sidebarContext will remain undefined
    }

    return (
        <header className="border-b">
            <div className="container mx-auto p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {showSidebarTrigger && sidebarContext && (
                        <>
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                        </>
                    )}
                    {!showSidebarTrigger && (
                        <Link href="/" className="font-bold text-xl">
                            Tasks
                        </Link>
                    )}
                    {showSidebarTrigger && (
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Tasks</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    )}
                </div>
                <ThemeToggle />
            </div>
        </header>
    );
} 