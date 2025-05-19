"use client";

import { NoteEditor } from "@/components/notes/note-editor";
import { NoteList } from "@/components/notes/note-list";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useNotesStore } from "@/hooks/use-notes";
import { PanelLeftClose, XIcon } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';

interface ProjectNotesViewProps {
    projectId: string;
}

export function ProjectNotesView({ projectId }: ProjectNotesViewProps) {
    // Selectores individuales para el store de Zustand
    const loadNotes = useNotesStore((state) => state.loadNotes);
    const selectNote = useNotesStore((state) => state.selectNote);
    const clearNotes = useNotesStore((state) => state.clearNotes);
    const currentNoteId = useNotesStore((state) => state.currentNoteId);
    const currentProjectIdFromStore = useNotesStore((state) => state.currentProjectId); // Renombrado para evitar confusión con prop projectId

    const [editorMode, setEditorMode] = useState<"view" | "new" | null>(null);

    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const listPanelRef = useRef<ImperativePanelHandle>(null);
    const editorPanelRef = useRef<ImperativePanelHandle>(null);

    useEffect(() => {
        if (projectId && projectId !== currentProjectIdFromStore) {
            loadNotes(projectId);
        }
    }, [projectId, loadNotes, currentProjectIdFromStore]);

    useEffect(() => {
        return () => {
            clearNotes();
        };
    }, [clearNotes]);

    useEffect(() => {
        if (currentNoteId) {
            // If a note is selected (currentNoteId is truthy),
            // always switch to 'view' mode for that note.
            if (editorMode !== 'view') { // Optimization: only set if not already 'view'
                setEditorMode('view');
            }
            if (!isDesktop) {
                // Ensure drawer is open when a note is selected on mobile
                if (!isDrawerOpen) setIsDrawerOpen(true);
            }
        } else {
            // No currentNoteId.
            // This means either we are in 'new' note mode, or no note is selected (show placeholder).
            if (editorMode !== 'new') {
                // If not actively in 'new' mode, then reset to placeholder.
                if (editorMode !== null) { // Optimization: only set if not already null
                    setEditorMode(null);
                }
                if (!isDesktop) {
                    // If not on desktop and drawer is open (and not in 'new' mode), close it.
                    if (isDrawerOpen) setIsDrawerOpen(false);
                }
            }
            // If editorMode IS 'new' (and currentNoteId is null), we are actively creating a new note.
            // In this case, editorMode remains 'new', and drawer state is managed by handleCreateNewNote/handleEditorCancel.
        }
    }, [currentNoteId, isDesktop, editorMode, isDrawerOpen]); // Added isDrawerOpen to dependencies

    const handleSelectNote = useCallback((noteId: string) => {
        selectNote(noteId);
    }, [selectNote]);

    const handleCreateNewNote = useCallback(() => {
        selectNote(null);
        setEditorMode('new');
        if (isDesktop) {
            if (editorPanelRef.current?.isCollapsed()) {
                editorPanelRef.current.expand();
            } else if (editorPanelRef.current?.getSize() === 0) {
                editorPanelRef.current.resize(70);
            }
        } else {
            setIsDrawerOpen(true);
        }
    }, [isDesktop, selectNote]);

    const handleEditorSave = useCallback(() => {
        // Esta función es un callback para NoteEditor.
        // La lógica principal de actualización de UI (como cambiar editorMode o cerrar drawer)
        // se maneja a través de useEffects que reaccionan a cambios en currentNoteId,
        // los cuales son provocados por las acciones del store (addNote/updateNote).
    }, []); // Sin dependencias ya que el cuerpo no las usa activamente.

    const handleEditorCancel = useCallback(() => {
        selectNote(null);
        setEditorMode(null);
    }, [selectNote]);

    const editorPlaceholder = (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
            <PanelLeftClose className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Selecciona una nota para verla o editarla.</p>
            <p className="text-sm">O crea una <Button variant="link" className="p-0 h-auto inline" onClick={handleCreateNewNote}>nueva nota</Button>.</p>
        </div>
    );

    const currentEditor = editorMode ? (
        <NoteEditor
            key={editorMode === 'new' ? 'new-note-editor' : currentNoteId}
            noteId={editorMode === 'view' ? currentNoteId : null}
            onSave={handleEditorSave}
            onCancel={handleEditorCancel}
        />
    ) : editorPlaceholder;

    if (isDesktop) {
        return (
            <ResizablePanelGroup
                direction="horizontal"
                className="h-full w-full rounded-lg border bg-background"
            >
                <ResizablePanel
                    ref={listPanelRef}
                    defaultSize={30}
                    minSize={20}
                    maxSize={40}
                    collapsible={true}
                    collapsedSize={4.5}
                    onCollapse={() => editorPanelRef.current?.resize(100 - 4.5)}
                    onExpand={() => editorPanelRef.current?.resize(70)}
                    className="min-w-[200px]"
                >
                    <NoteList
                        onSelectNote={handleSelectNote}
                        onCreateNewNote={handleCreateNewNote}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                    ref={editorPanelRef}
                    defaultSize={70}
                    minSize={30}
                    className="min-w-[300px]"
                >
                    {currentEditor}
                </ResizablePanel>
            </ResizablePanelGroup>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <NoteList
                onSelectNote={handleSelectNote}
                onCreateNewNote={handleCreateNewNote}
            />
            <Drawer
                open={isDrawerOpen}
                onOpenChange={(open) => {
                    setIsDrawerOpen(open);
                    if (!open) {
                        handleEditorCancel();
                    }
                }}
            >
                <DrawerContent className="h-[90vh] flex flex-col">
                    <DrawerHeader className="flex justify-between items-center p-4 border-b">
                        <DrawerTitle className="text-lg font-semibold">
                            {editorMode === 'new' ? 'Nueva Nota' : (currentNoteId ? 'Editar Nota' : 'Nota')}
                        </DrawerTitle>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" onClick={handleEditorCancel}>
                                <XIcon className="h-5 w-5" />
                            </Button>
                        </DrawerClose>
                    </DrawerHeader>
                    <div className="p-0 flex-1 overflow-y-auto">
                        {currentEditor}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
