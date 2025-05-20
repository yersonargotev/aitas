"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { TaskStatisticsDashboard } from "@/components/dashboard/task-statistics-dashboard";
import { Matrix } from "@/components/eisenhower/matrix";
import { Header } from "@/components/layout/header";
import { ProjectNotesView } from "@/components/notes/project-notes-view";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useState } from "react";

const MAIN_PAGE_PROJECT_ID = "main_dashboard_notes";

export default function Page() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header showSidebarTrigger={true} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col p-0 sm:p-4">
            <TabsList className="mb-2 sm:mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-0 sm:px-1 py-1.5 h-auto self-start">
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5">Dashboard</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5">Tasks</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
              <TaskStatisticsDashboard />
            </TabsContent>
            <TabsContent value="tasks" className="flex-1 overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0">
              <Matrix />
            </TabsContent>
            <TabsContent value="notes" className="flex-1 flex flex-col overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[500px]">
              <ProjectNotesView projectId={MAIN_PAGE_PROJECT_ID} />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

