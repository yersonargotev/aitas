import { AppSidebar } from "@/components/app-sidebar"
import { Matrix } from "@/components/eisenhower/matrix"
import { Header } from "@/components/layout/header"
import { ProjectNotesView } from "@/components/notes/project-notes-view"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

const MAIN_PAGE_PROJECT_ID = "main_dashboard_notes"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header showSidebarTrigger={true} />
        <div className="flex flex-1 flex-col overflow-auto p-4 gap-6">
          <div>
            <Matrix />
          </div>
          <div className="flex flex-1 flex-col min-h-[500px]">
            <ProjectNotesView projectId={MAIN_PAGE_PROJECT_ID} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
