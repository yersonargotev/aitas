'use client';

import { NoteListItem } from '@/components/notes/note-list-item';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotesStore } from '@/hooks/use-notes';
import type { Note } from '@/types/note';
import { PlusCircle } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

interface NoteListProps {
    // projectId se toma ahora del store
    onSelectNote: (noteId: string) => void;
    onCreateNewNote: () => void;
}

export function NoteList({ onSelectNote, onCreateNewNote }: NoteListProps) {
    const { notes, currentNoteId, isLoading, error } = useNotesStore(
        useShallow((state) => ({
            notes: state.notes,
            currentNoteId: state.currentNoteId,
            isLoading: state.isLoading,
            error: state.error,
        }))
    );

    if (isLoading && !notes.length) {
        return <div className="p-4 text-center text-sm text-muted-foreground">Cargando notas...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-sm text-red-500">Error al cargar notas: {error}</div>;
    }

    return (
        <div className="flex flex-col h-full border-r">
            <div className="p-3 border-b">
                <Button onClick={onCreateNewNote} className="w-full" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Nota
                </Button>
            </div>
            <ScrollArea className="flex-1">
                {notes.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                        No hay notas en este proyecto. ¡Crea una!
                    </p>
                ) : (
                    <div className="p-2 space-y-1">
                        {notes.map((note: Note) => (
                            <NoteListItem
                                key={note.id}
                                note={note}
                                onSelectNote={onSelectNote}
                                isSelected={note.id === currentNoteId}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
} 