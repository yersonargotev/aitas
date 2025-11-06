"use client";

import { ProjectNotesView } from "@/components/notes/project-notes-view";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ProjectNotesDialogProps {
	projectId: string;
	projectName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProjectNotesDialog({
	projectId,
	projectName,
	open,
	onOpenChange,
}: ProjectNotesDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle className="flex items-center gap-2">
						<span>Notes: {projectName}</span>
					</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-hidden">
					<ProjectNotesView
						projectId={projectId}
						projectName={projectName}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
