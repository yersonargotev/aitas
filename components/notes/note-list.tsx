'use client';

import { NoteListItem } from '@/components/notes/note-list-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotesStore } from '@/hooks/use-notes';
import type { Note } from '@/types/note';
import { PlusCircle } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

interface NoteListProps {
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
        return <div className="p-4 text-center text-sm text-muted-foreground">Loading notes...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-sm text-red-500">Error loading notes: {error}</div>;
    }

    return (
        <div className="flex flex-col h-full border-r">
            <div className="p-3 border-b space-y-2">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Notes</h3>
                    <Badge variant="secondary" className="text-xs">{notes.length}</Badge>
                </div>
                <Button onClick={onCreateNewNote} className="w-full" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Note
                </Button>
            </div>
            <ScrollArea className="flex-1">
                {notes.length === 0 ? (
                    <div className="p-4 text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            No notes yet.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Create your first note to get started!
                        </p>
                    </div>
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