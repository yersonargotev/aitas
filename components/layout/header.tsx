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

export function Header({ showSidebarTrigger = false }: { showSidebarTrigger?: boolean }) {
    // Always call useSidebar at the top level
    const sidebarContext = useSidebar();

    // Only use the sidebar context if showSidebarTrigger is true
    const shouldShowSidebarControls = showSidebarTrigger && sidebarContext;

    return (
        <header className="border-b">
            <div className="container mx-auto p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {shouldShowSidebarControls && (
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