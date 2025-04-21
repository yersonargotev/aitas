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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className={cn(
        "flex h-14 items-center px-4 gap-2",
        isCollapsed && "px-0 justify-center"
      )}>
        <div className={cn(
          "flex items-center gap-2",
          isCollapsed && "justify-center w-full"
        )}>
          <CheckSquare className={cn(
            "h-6 w-6 text-primary shrink-0",
            isCollapsed && "h-7 w-7"
          )} />
          <span className={cn(
            "font-semibold text-lg tracking-tight",
            isCollapsed && "hidden"
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
        isCollapsed ? "py-3" : "px-4 py-2"
      )}>
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
