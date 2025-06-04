'use client';

import { renderMarkdownPreviewAction } from '@/app/actions/notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useNotesStore } from '@/hooks/use-notes';
import type { Note } from '@/types/note';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useClipboardPaste } from '@/lib/hooks/use-clipboard-paste';
import { imageStorage } from '@/lib/stores/image-storage';
// import { nanoid } from 'nanoid'; // Not strictly needed if noteId is always present for pasting

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
    const [isImageStorageInitialized, setIsImageStorageInitialized] = useState(false);
    const [imageStorageError, setImageStorageError] = useState<string | null>(null);
    const [pasteError, setPasteError] = useState<string | null>(null);
    const [activeBlobUrls, setActiveBlobUrls] = useState<Set<string>>(new Set());

    const { addNote, updateNote, getNoteById, currentProjectId, isLoading, error } = useNotesStore();

    useEffect(() => {
        const initStorage = async () => {
            try {
                await imageStorage.init();
                setIsImageStorageInitialized(true);
                setImageStorageError(null);
            } catch (err) {
                console.error("Failed to initialize image storage:", err);
                setImageStorageError(err instanceof Error ? err.message : "Unknown error initializing storage");
                setIsImageStorageInitialized(false);
            }
        };
        initStorage();
    }, []);

    // Effect for cleaning up blob URLs
    useEffect(() => {
        // This effect runs when the component unmounts or when noteId changes.
        return () => {
            activeBlobUrls.forEach(url => imageStorage.revokeImageUrl(url));
            setActiveBlobUrls(new Set()); // Clear the set after revoking
        };
    }, [noteId]); // Only re-run if noteId changes, or on unmount.

    const handleImagePaste = async (file: File) => {
        setPasteError(null);
        if (!noteId) {
            setPasteError("Please save the note before pasting images.");
            return;
        }
        if (!isImageStorageInitialized) {
            setPasteError("Image storage is not ready. Please try again in a moment.");
            return;
        }

        try {
            const savedImage = await imageStorage.saveImage(noteId, file);
            const markdownImage = `![pasted-image](indexeddb://${savedImage.id})`;
            setContent((prevContent) => prevContent + "\n" + markdownImage + "\n");
        } catch (err) {
            console.error("Failed to save pasted image:", err);
            setPasteError(err instanceof Error ? err.message : "Failed to save image.");
        }
    };

    const { isPasting, pasteFromClipboard } = useClipboardPaste({
        onImagePaste: handleImagePaste,
        enabled: !!noteId && isImageStorageInitialized,
        // onPasteStart: () => { /* Optionally set some pasting state */ },
        // onPasteComplete: () => { /* Optionally clear pasting state */ },
    });

    const debouncedRenderPreview = useDebouncedCallback(async (markdownContent: string) => {
        if (!markdownContent.trim()) {
            setPreviewHtml('');
            setPreviewError(null);
            setIsPreviewLoading(false);
            // Revoke any existing blob URLs if content is cleared
            activeBlobUrls.forEach(url => imageStorage.revokeImageUrl(url));
            setActiveBlobUrls(new Set());
            return;
        }
        setIsPreviewLoading(true);
        setPreviewError(null);

        let contentWithBlobUrls = markdownContent;
        const imageRegex = /!\[.*?\]\(indexeddb:\/\/([a-zA-Z0-9_-]+)\)/g;
        const matches = Array.from(markdownContent.matchAll(imageRegex));
        const newlyCreatedBlobUrls = new Set<string>();

        if (isImageStorageInitialized) {
            const processingPromises = matches.map(async (match) => {
                const imageId = match[1];
                try {
                    const record = await imageStorage.getImageById(imageId);
                    if (record && record.file) {
                        const blobUrl = imageStorage.createImageUrl(record.file);
                        newlyCreatedBlobUrls.add(blobUrl);
                        // Replace in contentWithBlobUrls. Need to be careful with regex replacement.
                        // Using a simple string replace for the full match should be safe here.
                        contentWithBlobUrls = contentWithBlobUrls.replace(match[0], `![${match[0].substring(2, match[0].indexOf(']'))}](${blobUrl})`);
                    } else {
                        contentWithBlobUrls = contentWithBlobUrls.replace(match[0], `![Image not found: ${imageId}](missing-image-placeholder)`);
                    }
                } catch (error) {
                    console.error(`Error processing image ${imageId} for preview:`, error);
                    contentWithBlobUrls = contentWithBlobUrls.replace(match[0], `![Error loading image: ${imageId}](error-loading-image)`);
                }
            });
            await Promise.all(processingPromises);
        } else {
            // If image storage is not ready, replace all indexeddb links with a message
            contentWithBlobUrls = markdownContent.replace(imageRegex, `![Image storage not ready](image-storage-not-ready)`);
        }

        // Manage blob URLs: revoke old ones not in the new set, then update active set
        activeBlobUrls.forEach(url => {
            if (!newlyCreatedBlobUrls.has(url)) {
                imageStorage.revokeImageUrl(url);
            }
        });
        setActiveBlobUrls(newlyCreatedBlobUrls);

        try {
            const result = await renderMarkdownPreviewAction(contentWithBlobUrls);
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
        } finally {
            setIsPreviewLoading(false);
        }
    }, 300);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-2"
                disabled={isLoading}
            />
            <div className="mb-2 flex gap-1 border-b pb-1">
                <Button variant={currentTab === 'edit' ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentTab('edit')}>Edit</Button>
                <Button variant={currentTab === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentTab('preview')}>Preview</Button>
            </div>

            <ScrollArea className="flex-1 mb-2 min-h-[200px]">
                {currentTab === 'edit' ? (
                    <Textarea
                        placeholder="Write your note in Markdown..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[300px] resize-none h-full text-sm"
                        disabled={isLoading}
                    />
                ) : (
                    <div className="p-2 border rounded-md min-h-[300px] bg-muted/30 prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1">
                        {isPreviewLoading && <p className="text-muted-foreground">Loading preview...</p>}
                        {previewError && <p className="text-red-500">Preview error: {previewError}</p>}
                        {!isPreviewLoading && !previewError && previewHtml && (
                            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                        )}
                        {!isPreviewLoading && !previewError && !previewHtml && !content.trim() && (
                            <p className="text-muted-foreground">Start writing to see the preview.</p>
                        )}
                        {!isPreviewLoading && !previewError && !previewHtml && content.trim() && (
                            <p className="text-muted-foreground">Generating preview...</p>
                        )}
                    </div>
                )}
            </ScrollArea>

            {imageStorageError && <p className="text-sm text-red-500 mb-2">Image Storage Error: {imageStorageError}</p>}
            {pasteError && <p className="text-sm text-red-500 mb-2">Paste Error: {pasteError}</p>}
            {isPasting && <p className="text-sm text-blue-500 mb-2">Pasting image...</p>}
            {error && <p className="text-sm text-red-500 mb-2">Error saving: {error}</p>}

            <div className="flex justify-end gap-2 mt-auto">
                {onCancel && (
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                )}
                <Button onClick={handleSave} disabled={isLoading || !title.trim() || !content.trim()}>
                    {isLoading ? 'Saving...' : (noteId ? 'Update Note' : 'Save Note')}
                </Button>
            </div>
        </div>
    );
}