"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  PlusCircle,
  StickyNote,
  Trash2,
} from "lucide-react"

import { ProjectNotesDialog } from "@/components/notes/project-notes-dialog"
import { ProjectForm } from "@/components/projects/project-form"
import { Button } from "@/components/ui/button"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useProjectStore } from "@/lib/stores/project-store"
import { useTaskStore } from "@/lib/stores/task-store"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function NavProjects() {
  const { isMobile, state } = useSidebar()
  const router = useRouter()
  const { projects, addProject, deleteProject, selectProject, selectedProjectId } = useProjectStore()
  const { setFilter } = useTaskStore()

  // State for notes dialog
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [selectedProjectForNotes, setSelectedProjectForNotes] = useState<{
    id: string;
    name: string;
  } | null>(null)

  // Handle project creation
  const handleProjectCreate = (project: { name: string; description?: string; icon?: string }) => {
    addProject(project)
  }

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    selectProject(projectId)
    // @ts-expect-error - we've extended the types but TypeScript doesn't recognize it yet
    setFilter("projectId", projectId)
    router.push("/")
  }

  // Handle project deletion
  const handleProjectDelete = (projectId: string) => {
    deleteProject(projectId)
    // If the deleted project was selected, clear the filter
    if (selectedProjectId === projectId) {
      // @ts-expect-error - we've extended the types but TypeScript doesn't recognize it yet
      setFilter("projectId", undefined)
    }
  }

  // Handle view notes
  const handleViewNotes = (projectId: string, projectName: string) => {
    setSelectedProjectForNotes({ id: projectId, name: projectName })
    setNotesDialogOpen(true)
  }

  const isCollapsed = state === "collapsed"

  return (
    <>
      <div className={cn("mb-4 px-3", isCollapsed && "px-1")}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ProjectForm
                  onSubmit={handleProjectCreate}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-2 bg-background/50 hover:bg-background",
                        isCollapsed && "justify-center p-2"
                      )}
                    >
                      <PlusCircle className={cn("h-4 w-4 text-primary", isCollapsed && "h-5 w-5")} />
                      <span className={cn("text-sm", isCollapsed && "hidden")}>New Project</span>
                    </Button>
                  }
                />
              </div>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">New Project</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
      <SidebarGroup>
        <div className={cn("flex items-center justify-between px-3 py-2", isCollapsed && "justify-center px-1")}>
          <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>Projects</SidebarGroupLabel>
          {isCollapsed && <Folder className="h-4 w-4 text-muted-foreground" />}
        </div>
        <SidebarMenu>
          {projects.map((project) => (
            <SidebarMenuItem key={project.id}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => handleProjectSelect(project.id)}
                      className={cn(
                        selectedProjectId === project.id ? "bg-accent" : "",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <Folder className={cn("h-4 w-4", isCollapsed && "h-5 w-5", selectedProjectId === project.id && "text-primary")} />
                      <span className={cn(isCollapsed && "hidden")}>{project.name}</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{project.name}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
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
                  <DropdownMenuItem onClick={() => handleViewNotes(project.id, project.name)}>
                    <StickyNote className="text-muted-foreground" />
                    <span>View Notes</span>
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
              <SidebarMenuButton className={cn(
                "text-sidebar-foreground/70",
                isCollapsed && "justify-center"
              )}>
                <span className={cn(isCollapsed ? "text-xs" : "")}>{isCollapsed ? "..." : "No projects yet"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      {/* Project Notes Dialog */}
      {selectedProjectForNotes && (
        <ProjectNotesDialog
          projectId={selectedProjectForNotes.id}
          projectName={selectedProjectForNotes.name}
          open={notesDialogOpen}
          onOpenChange={setNotesDialogOpen}
        />
      )}
    </>
  )
}
