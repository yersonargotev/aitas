"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  PlusCircle,
  Trash2,
} from "lucide-react"

import { ProjectForm } from "@/components/projects/project-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useProjectStore } from "@/lib/stores/project-store"
import { useTaskStore } from "@/lib/stores/task-store"
import { useRouter } from "next/navigation"

export function NavProjects() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { projects, addProject, deleteProject, selectProject, selectedProjectId } = useProjectStore()
  const { setFilter } = useTaskStore()

  // Handle project creation
  const handleProjectCreate = (project: { name: string; description?: string; icon?: string }) => {
    addProject(project)
  }

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    selectProject(projectId)
    // @ts-ignore - we've extended the types but TypeScript doesn't recognize it yet
    setFilter("projectId", projectId)
    router.push("/dashboard")
  }

  // Handle project deletion
  const handleProjectDelete = (projectId: string) => {
    deleteProject(projectId)
    // If the deleted project was selected, clear the filter
    if (selectedProjectId === projectId) {
      // @ts-ignore - we've extended the types but TypeScript doesn't recognize it yet
      setFilter("projectId", undefined)
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <ProjectForm
          onSubmit={handleProjectCreate}
          trigger={
            <SidebarMenuAction>
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only">New Project</span>
            </SidebarMenuAction>
          }
        />
      </div>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.id}>
            <SidebarMenuButton
              onClick={() => handleProjectSelect(project.id)}
              className={selectedProjectId === project.id ? "bg-accent" : ""}
            >
              <Folder />
              <span>{project.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleProjectSelect(project.id)}>
                  <Folder className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleProjectDelete(project.id)}>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {projects.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <span>No projects yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
