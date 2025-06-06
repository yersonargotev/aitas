"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button as ShadcnButton } from "@/components/ui/button";
import { useNotesStore } from "@/hooks/use-notes";
import type { Note } from "@/types/note";
import { formatDistanceToNow } from "date-fns";
import { FileText, Trash2 } from "lucide-react";
import type React from "react";

interface NoteListItemProps {
    note: Note;
    onSelectNote: (noteId: string) => void;
    isSelected: boolean;
}

export function NoteListItem({
    note,
    onSelectNote,
    isSelected,
}: NoteListItemProps) {
    const { deleteNote, isLoading } = useNotesStore();

    const handleDeleteConfirm = () => {
        deleteNote(note.id);
    };

    const handleItemClick = () => {
        if (!isLoading) {
            onSelectNote(note.id);
        }
    };

    const handleItemKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isLoading) {
                onSelectNote(note.id);
            }
        }
    };

    const timeAgo = formatDistanceToNow(new Date(note.updatedAt), {
        addSuffix: true,
    });

    return (
        <div
            // biome-ignore lint/a11y/useSemanticElements: <explanation>
            role="button"
            tabIndex={isLoading ? -1 : 0}
            aria-current={isSelected ? "page" : undefined}
            aria-disabled={isLoading}
            className={`flex items-center justify-between w-full p-3 rounded-lg text-left hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${isSelected ? "bg-muted" : "bg-transparent"}
        ${isLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            onClick={handleItemClick}
            onKeyDown={handleItemKeyDown}
        >
            <div className="flex items-center gap-3 truncate">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="truncate">
                    <p className="font-medium truncate text-sm">
                        {note.title || "Untitled Note"}
                    </p>
                    <p className="text-xs text-muted-foreground">Modified {timeAgo}</p>
                </div>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <ShadcnButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                        disabled={isLoading}
                        aria-label="Delete note"
                    >
                        <Trash2 className="h-4 w-4" />
                    </ShadcnButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            your note from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isLoading}
                            className={isLoading ? "opacity-70 cursor-not-allowed" : ""}
                        >
                            {isLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
