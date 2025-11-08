'use client';

import { renderMarkdownPreviewAction } from '@/app/actions/notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useNotesStore } from '@/hooks/use-notes';
import type { Note } from '@/types/note';
import { useEffect, useState } from 'react'; // Removed useRef
import { useDebouncedCallback } from 'use-debounce';
import { useClipboardPaste } from '@/lib/hooks/use-clipboard-paste';
import { imageStorage } from '@/lib/stores/image-storage';
import { nanoid } from 'nanoid';

interface NoteEditorProps {
    noteId?: string | null;
    onSave?: (note: Note) => void;
    onCancel?: () => void;
}

export function NoteEditor({ noteId, onSave, onCancel }: NoteEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [isImageStorageInitialized, setIsImageStorageInitialized] = useState(false);
    const [imageStorageError, setImageStorageError] = useState<string | null>(null);
    const [pasteError, setPasteError] = useState<string | null>(null);
    const [activeBlobUrls, setActiveBlobUrls] = useState<Set<string>>(new Set());
    const { addNote, updateNote, getNoteById, currentProjectId, previewPreference, setPreviewPreference, isLoading, error } = useNotesStore();

    const currentTab = previewPreference ? 'preview' : 'edit'; // Derived state

    const [tempNoteIdForImages, setTempNoteIdForImages] = useState(() => !noteId ? nanoid() : null);

    useEffect(() => {
        if (!noteId) { // If it's a new note (no noteId yet)
            setTempNoteIdForImages(nanoid());
        } else { // If an existing note is loaded, or a new note was just saved (noteId is now set)
            setTempNoteIdForImages(null);
        }
    }, [noteId]);

  // Removed - currentTab is now derived from previewPreference

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

        // Check if already initialized first (singleton pattern)
        if (imageStorage.isInitialized()) {
            setIsImageStorageInitialized(true);
            setImageStorageError(null);
        } else if (imageStorage.getInitializationStatus() === 'in-progress') {
            // Storage initialization is already in progress, wait for it
            imageStorage.init().then(() => {
                setIsImageStorageInitialized(true);
                setImageStorageError(null);
            }).catch(err => {
                console.error("Failed to initialize image storage:", err);
                setImageStorageError(err instanceof Error ? err.message : "Unknown error initializing storage");
                setIsImageStorageInitialized(false);
            });
        } else {
            initStorage();
        }
    }, []);

    // Effect for cleaning up blob URLs
    useEffect(() => {
        // This effect runs when the component unmounts or when noteId changes.
        // It cleans up URLs associated with the note that is being navigated away from.
        return () => {
            activeBlobUrls.forEach(url => imageStorage.revokeImageUrl(url));
            setActiveBlobUrls(new Set()); // Clear the set after revoking
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [noteId]); // Purposefully not including activeBlobUrls: see explanation above.

    const actualParentIdForImages = noteId || tempNoteIdForImages;

    const handleImagePaste = async (file: File) => {
        setPasteError(null);
        if (!actualParentIdForImages) {
            setPasteError("Cannot determine note ID for saving the image.");
            return;
        }
        if (!isImageStorageInitialized) {
            setPasteError("Image storage is not ready. Please try again in a moment.");
            return;
        }

        try {
            const savedImage = await imageStorage.saveImage(actualParentIdForImages, file);
            const markdownImage = `![pasted-image](indexeddb://${savedImage.id})`;
            setContent((prevContent) => prevContent + "\n" + markdownImage + "\n");
        } catch (err) {
            console.error("Failed to save pasted image:", err);
            setPasteError(err instanceof Error ? err.message : "Failed to save image.");
        }
    };

    const { isPasting } = useClipboardPaste({ // Removed pasteFromClipboard
        onImagePaste: handleImagePaste,
        enabled: !!actualParentIdForImages && isImageStorageInitialized,
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

        // Always start preview rendering immediately, regardless of storage initialization
        setIsPreviewLoading(true);
        setPreviewError(null);

        let contentWithBlobUrls = markdownContent;
        const imageRegex = /!\[.*?\]\(indexeddb:\/\/([a-zA-Z0-9_-]+)\)/g;
        const matches = Array.from(markdownContent.matchAll(imageRegex));
        const newlyCreatedBlobUrls = new Set<string>();

        if (matches.length === 0) {
            // No images to process, render immediately
            try {
                const result = await renderMarkdownPreviewAction(contentWithBlobUrls);
                if ('html' in result) {
                    setPreviewHtml(result.html);
                } else {
                    setPreviewHtml('');
                    setPreviewError(result.error + (result.details ? `: ${result.details}` : ''));
                }
            } catch (e) {
                setPreviewHtml('');
                setPreviewError('An unexpected error occurred while rendering preview.');
                console.error("Unexpected preview error:", e);
            } finally {
                setIsPreviewLoading(false);
            }
            return;
        }

        // Extract image IDs from matches
        const imageIds = matches.map(match => match[1]);

        if (imageStorage.isInitialized()) {
            // Storage is ready, use batch processing with caching
            try {
                const imageResults = await imageStorage.getImagesByIds(imageIds);
                const processingPromises = matches.map(async (match) => {
                    const imageId = match[1];
                    const record = imageResults.get(imageId);

                    if (record && record.file) {
                        // Check if we have a cached blob URL
                        const cachedUrl = imageStorage.getCachedImageUrl(imageId);
                        if (cachedUrl) {
                            newlyCreatedBlobUrls.add(cachedUrl);
                            contentWithBlobUrls = contentWithBlobUrls.replace(match[0],
                                `![${match[0].substring(2, match[0].indexOf(']'))}](${cachedUrl})`);
                        } else {
                            const blobUrl = imageStorage.createImageUrl(record.file);
                            newlyCreatedBlobUrls.add(blobUrl);
                            contentWithBlobUrls = contentWithBlobUrls.replace(match[0],
                                `![${match[0].substring(2, match[0].indexOf(']'))}](${blobUrl})`);
                        }
                    } else {
                        contentWithBlobUrls = contentWithBlobUrls.replace(match[0],
                            `![Image not found: ${imageId}](missing-image-placeholder)`);
                    }
                });
                await Promise.all(processingPromises);
            } catch (error) {
                console.error("Error processing images in batch:", error);
                // Fallback to placeholder images
                contentWithBlobUrls = markdownContent.replace(imageRegex,
                    `![Loading image...](placeholder-image)`);
            }
        } else {
            // Storage not yet initialized, show loading placeholders but still render preview
            contentWithBlobUrls = markdownContent.replace(imageRegex,
                `![Loading image...](${imageStorage.getInitializationStatus() === 'in-progress' ? 'image-loading' : 'image-initializing'})`);
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

                // If storage was not initialized but we rendered preview, try to load images asynchronously
                if (!imageStorage.isInitialized() && imageIds.length > 0) {
                    imageStorage.init().then(() => {
                        // Trigger a re-render with actual images once storage is ready
                        if (currentTab === 'preview') {
                            debouncedRenderPreview(markdownContent);
                        }
                    }).catch(error => {
                        console.error("Failed to initialize storage for async image loading:", error);
                    });
                }
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
                // Note not found or new note, reset fields
                setTitle('');
                setContent('');
                setPreviewHtml('');
            }
        } else {
            // No noteId or projectId, reset fields (e.g. when creating a new note or no project selected)
            setTitle('');
            setContent('');
            setPreviewHtml('');
        }
    }, [noteId, currentProjectId, getNoteById, currentTab, debouncedRenderPreview]);

    useEffect(() => {
        if (currentTab === 'preview') {
            // Always render preview immediately, regardless of storage initialization
            debouncedRenderPreview(content);
        }
        return () => {
            debouncedRenderPreview.cancel();
        };
    }, [content, currentTab, debouncedRenderPreview]); // Removed isImageStorageInitialized dependency

    // Removed - preview preference is now saved directly in button onClick handlers

    const handleSave = async () => {
        if (!currentProjectId) {
            console.error('Project ID not set, cannot save note.');
            return;
        }
        let savedNote: Note | null = null;
        if (noteId) { // Update existing note
            savedNote = await updateNote(noteId, title, content);
        } else { // Add new note
            if (!actualParentIdForImages) {
                 console.error("tempNoteIdForImages is not set for new note, this should not happen.");
                 setPasteError("Error: A temporary ID for handling images was not available. Please try again.");
                 return;
            }
            savedNote = await addNote(title, content, actualParentIdForImages); // Pass tempId
        }
        if (savedNote && onSave) {
            onSave(savedNote);
        } else if (savedNote) {
            setTitle('');
            setContent('');
            setPreviewHtml('');
            setPreviewPreference(false); // Reset to edit view
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            setTitle('');
            setContent('');
            setPreviewHtml('');
            setPreviewPreference(false); // Reset to edit view
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
                <Button variant={currentTab === 'edit' ? 'secondary' : 'ghost'} size="sm" onClick={() => setPreviewPreference(false)}>Edit</Button>
                <Button variant={currentTab === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setPreviewPreference(true)}>Preview</Button>
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