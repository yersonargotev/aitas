'use client';

import { Button as ShadcnButton } from '@/components/ui/button'; // Renombrar para evitar conflicto
import { useNotesStore } from '@/hooks/use-notes';
import type { Note } from '@/types/note';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale'; // Para formato de fecha en español
import { FileText, Trash2 } from 'lucide-react';

interface NoteListItemProps {
    note: Note;
    onSelectNote: (noteId: string) => void;
    isSelected: boolean;
}

export function NoteListItem({ note, onSelectNote, isSelected }: NoteListItemProps) {
    const { deleteNote, isLoading } = useNotesStore();

    const handleDelete = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation(); // Evitar que el evento se propague al div padre
        if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
            deleteNote(note.id);
        }
    };

    const timeAgo = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: es });

    return (
        <button
            type="button"
            aria-selected={isSelected}
            className={`flex items-center justify-between w-full p-3 rounded-lg text-left hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${isSelected ? 'bg-muted' : 'bg-transparent'}`}
            onClick={() => onSelectNote(note.id)}
            disabled={isLoading} // Deshabilitar el item si algo está cargando globalmente en las notas
        >
            <div className="flex items-center gap-3 truncate">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="truncate">
                    <p className="font-medium truncate text-sm">{note.title || 'Nota sin título'}</p>
                    <p className="text-xs text-muted-foreground">Modificado {timeAgo}</p>
                </div>
            </div>
            <ShadcnButton
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                onKeyDown={(e) => { // Permitir borrar con Enter/Space en el botón de borrar
                    if (e.key === 'Enter' || e.key === ' ') handleDelete(e);
                }}
                disabled={isLoading}
                aria-label="Eliminar nota"
            >
                <Trash2 className="h-4 w-4" />
            </ShadcnButton>
        </button>
    );
} 