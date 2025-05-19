'use client';

import { renderMarkdownPreviewAction } from '@/app/actions/notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useNotesStore } from '@/hooks/use-notes';
import type { Note } from '@/types/note';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface NoteEditorProps {
    noteId?: string | null;
    onSave?: (note: Note) => void;
    onCancel?: () => void;
}

export function NoteEditor({ noteId, onSave, onCancel }: NoteEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [currentTab, setCurrentTab] = useState<'edit' | 'preview'>('edit');
    const [previewHtml, setPreviewHtml] = useState('');
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const { addNote, updateNote, getNoteById, currentProjectId, isLoading, error } = useNotesStore();

    const debouncedRenderPreview = useDebouncedCallback(async (newContent: string) => {
        if (!newContent.trim()) {
            setPreviewHtml('');
            setPreviewError(null);
            setIsPreviewLoading(false);
            return;
        }
        setIsPreviewLoading(true);
        setPreviewError(null);
        try {
            const result = await renderMarkdownPreviewAction(newContent);
            if ('html' in result) {
                setPreviewHtml(result.html);
            } else {
                setPreviewHtml('');
                setPreviewError(result.error + (result.details ? `: ${result.details}` : ''));
                console.error("Preview error:", result.error, result.details);
            }
        } catch (e) {
            setPreviewHtml('');
            setPreviewError('An unexpected error occurred while rendering preview.');
            console.error("Unexpected preview error:", e);
        }
        setIsPreviewLoading(false);
    }, 300);

    useEffect(() => {
        if (noteId && currentProjectId) {
            const noteToEdit = getNoteById(noteId);
            if (noteToEdit) {
                setTitle(noteToEdit.title);
                setContent(noteToEdit.content);
                if (currentTab === 'preview') {
                    debouncedRenderPreview(noteToEdit.content);
                }
            } else {
                setTitle('');
                setContent('');
                setPreviewHtml('');
            }
        } else {
            setTitle('');
            setContent('');
            setPreviewHtml('');
        }
    }, [noteId, currentProjectId, getNoteById]);

    useEffect(() => {
        if (currentTab === 'preview') {
            debouncedRenderPreview(content);
        }
        return () => {
            debouncedRenderPreview.cancel();
        };
    }, [content, currentTab, debouncedRenderPreview]);

    const handleSave = async () => {
        if (!currentProjectId) {
            console.error('Project ID not set, cannot save note.');
            return;
        }
        let savedNote: Note | null = null;
        if (noteId) {
            savedNote = await updateNote(noteId, title, content);
        } else {
            savedNote = await addNote(title, content);
        }
        if (savedNote && onSave) {
            onSave(savedNote);
        } else if (savedNote) {
            setTitle('');
            setContent('');
            setPreviewHtml('');
            setCurrentTab('edit');
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            setTitle('');
            setContent('');
            setPreviewHtml('');
            setCurrentTab('edit');
        }
    };

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
                            <p className="text-muted-foreground">Generando vista previa...</p>
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