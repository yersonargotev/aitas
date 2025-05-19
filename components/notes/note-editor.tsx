'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useNotesStore } from '@/hooks/use-notes';
import type { Note } from '@/types/note';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { renderMarkdownPreviewAction } from '@/app/actions/notes'; // Adjust path if necessary

interface NoteEditorProps {
    noteId?: string | null; // Si se proporciona, edita una nota existente
    onSave?: (note: Note) => void; // Callback opcional al guardar
    onCancel?: () => void; // Callback opcional al cancelar
}

export function NoteEditor({ noteId, onSave, onCancel }: NoteEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [currentTab, setCurrentTab] = useState<'edit' | 'preview'>('edit');
    const [previewHtml, setPreviewHtml] = useState('');
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const {
        addNote,
        updateNote,
        getNoteById,
        currentProjectId,
        isLoading,
        error
    } = useNotesStore();

    useEffect(() => {
        if (noteId && currentProjectId) {
            const noteToEdit = getNoteById(noteId);
            if (noteToEdit) {
                setTitle(noteToEdit.title);
                setContent(noteToEdit.content);
                // Initial preview render for existing notes when tab is preview
                if (currentTab === 'preview') {
                    debouncedRenderPreview(noteToEdit.content);
                }
            } else {
                // Si la nota no se encuentra (ej. ID inválido o no cargada aún)
                // Podríamos resetear o mostrar un mensaje
                setTitle('');
                setContent('');
                setPreviewHtml('');
            }
        } else {
            // Si no hay noteId, es una nueva nota
            setTitle('');
            setContent('');
            setPreviewHtml('');
        }
    }, [noteId, currentProjectId, getNoteById, currentTab]);

    const debouncedRenderPreview = useDebouncedCallback(async (newContent: string) => {
        if (!newContent.trim()) {
            setPreviewHtml('');
            setPreviewError(null);
            return;
        }
        setIsPreviewLoading(true);
        setPreviewError(null);
        try {
            const result = await renderMarkdownPreviewAction(newContent);
            if ('html' in result) {
                setPreviewHtml(result.html);
            } else {
                setPreviewHtml(''); // Clear previous preview on error
                setPreviewError(result.error + (result.details ? `: ${result.details}` : ''));
                console.error("Preview error:", result.error, result.details);
            }
        } catch (e) {
            setPreviewHtml('');
            setPreviewError('An unexpected error occurred while rendering preview.');
            console.error("Unexpected preview error:", e);
        }
        setIsPreviewLoading(false);
    }, 300); // Debounce by 300ms

    useEffect(() => {
        if (currentTab === 'preview') {
            debouncedRenderPreview(content);
        }
        // Cleanup pending debounced calls if component unmounts or tab changes from preview
        return () => {
            debouncedRenderPreview.cancel();
        };
    }, [content, currentTab, debouncedRenderPreview]);

    const handleSave = async () => {
        if (!currentProjectId) {
            console.error('Project ID not set, cannot save note.');
            // Podríamos mostrar un error al usuario aquí
            return;
        }

        let savedNote: Note | null = null;
        if (noteId) {
            savedNote = await updateNote(noteId, title, content);
        } else {
            savedNote = await addNote(title, content);
        }

        if (savedNote) {
            if (onSave) onSave(savedNote);
            // Opcionalmente, resetear campos si no hay onSave o si se queda en la misma vista
            // Si onSave redirige o cierra el editor, no sería necesario resetear.
            if (!onSave) {
                setTitle('');
                setContent('');
                setPreviewHtml('');
            }
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            // Comportamiento por defecto si no hay onCancel (ej. resetear campos)
            setTitle('');
            setContent('');
            setPreviewHtml('');
        }
    };

    if (!currentProjectId && !noteId) {
        // Espera a que se cargue el proyecto o si es una nueva nota sin proyecto (no debería pasar en este flujo)
        // Podríamos mostrar un loader o un mensaje
        // return <div>Loading project context...</div>;
    }

    return (
        <div className="flex flex-col h-full p-1">
            <Input
                placeholder="Título de la nota"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-2"
                disabled={isLoading}
            />
            <div className="mb-2 flex gap-1 border-b pb-1">
                <Button variant={currentTab === 'edit' ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentTab('edit')}>Editar</Button>
                <Button variant={currentTab === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentTab('preview')}>Vista Previa</Button>
            </div>

            <ScrollArea className="flex-1 mb-2 min-h-[200px]">
                {currentTab === 'edit' ? (
                    <Textarea
                        placeholder="Escribe tu nota en Markdown..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[300px] resize-none h-full text-sm"
                        disabled={isLoading}
                    />
                ) : (
                    <div className="p-2 border rounded-md min-h-[300px] bg-muted/30 prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1">
                        {isPreviewLoading && <p className="text-muted-foreground">Cargando vista previa...</p>}
                        {previewError && <p className="text-red-500">Error en la vista previa: {previewError}</p>}
                        {!isPreviewLoading && !previewError && previewHtml && (
                            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                        )}
                        {!isPreviewLoading && !previewError && !previewHtml && !content.trim() && (
                            <p className="text-muted-foreground">Empieza a escribir para ver la vista previa.</p>
                        )}
                        {!isPreviewLoading && !previewError && !previewHtml && content.trim() && (
                            <p className="text-muted-foreground">Generando vista previa...</p> // Fallback if html is empty but content exists
                        )}
                    </div>
                )}
            </ScrollArea>

            {error && <p className="text-sm text-red-500 mb-2">Error guardando: {error}</p>}

            <div className="flex justify-end gap-2 mt-auto">
                {onCancel && (
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                        Cancelar
                    </Button>
                )}
                <Button onClick={handleSave} disabled={isLoading || !title.trim() || !content.trim()}>
                    {isLoading ? 'Guardando...' : (noteId ? 'Actualizar Nota' : 'Guardar Nota')}
                </Button>
            </div>
        </div>
    );
} 