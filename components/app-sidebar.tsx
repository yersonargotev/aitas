"use client";

import { CheckSquare } from "lucide-react";
import type * as React from "react";

import { NavProjects } from "@/components/nav-projects";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, isMobile } = useSidebar(); // Added isMobile
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className={cn(
        "flex h-14 items-center px-4 gap-2",
        isCollapsed && !isMobile && "px-0 justify-center" // Apply collapse styles only if not mobile
      )}>
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed && !isMobile && "justify-center w-full" // Apply collapse styles only if not mobile
        )}>
          <CheckSquare className={cn(
            "h-6 w-6 text-primary shrink-0",
            isCollapsed && !isMobile && "h-7 w-7" // Apply collapse styles only if not mobile
          )} />
          <span className={cn(
            "font-semibold text-lg tracking-tight",
            isCollapsed && !isMobile && "hidden" // Apply collapse styles only if not mobile
          )}>
            Tasks
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects />
      </SidebarContent>
      <SidebarFooter className={cn(
        "flex items-center justify-center p-2 border-t mt-auto",
        // If mobile, use expanded styles for padding. Otherwise, use desktop collapsed/expanded styles.
        isMobile ? "px-4 py-2" : (isCollapsed ? "py-3" : "px-4 py-2")
      )}>
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
