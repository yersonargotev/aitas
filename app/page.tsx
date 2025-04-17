import { AppSidebar } from "@/components/app-sidebar"
import { Matrix } from "@/components/eisenhower/matrix"
import { Header } from "@/components/layout/header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header showSidebarTrigger={true} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          <Matrix />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
