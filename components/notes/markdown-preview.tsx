// Import our shared highlighter utility
import { getAppHighlighter } from '@/lib/shiki';
import type { RehypeShikiOptions } from '@shikijs/rehype';
import { imageStorage } from '@/lib/stores/image-storage';
// Use the core import for passing a custom highlighter
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import type { Highlighter } from '@shikijs/core';
import {
    transformerNotationDiff,
    transformerNotationFocus,
    transformerNotationHighlight,
} from '@shikijs/transformers';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
    markdownContent: string;
}

export function MarkdownPreview({ markdownContent }: MarkdownPreviewProps) {
    const [processedMarkdown, setProcessedMarkdown] = useState<string>(markdownContent);
    const [activeBlobUrls, setActiveBlobUrls] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isImageStorageInitialized, setIsImageStorageInitialized] = useState<boolean>(false);
    const [imageStorageError, setImageStorageError] = useState<string | null>(null);
    const [highlighterState, setHighlighterState] = useState<Highlighter | null>(null);

    // Options for rehypeShikiFromHighlighter - can be defined outside if static
    const shikiOptions: RehypeShikiOptions = {
        themes: {
            light: 'catppuccin-latte',
            dark: 'catppuccin-mocha',
        },
        transformers: [
            transformerNotationDiff(),
            transformerNotationHighlight(),
            transformerNotationFocus(),
        ],
    };

    // Effect to initialize imageStorage
    useEffect(() => {
        const initImageStorage = async () => {
            try {
                await imageStorage.init();
                setIsImageStorageInitialized(true);
            } catch (error) {
                console.error("Failed to initialize image storage:", error);
                setImageStorageError(error instanceof Error ? error.message : "Unknown error");
            }
        };
        initImageStorage();
    }, []);

    // Effect to load highlighter
    useEffect(() => {
        let isMounted = true;
        const loadHighlighter = async () => {
            try {
                const hl = await getAppHighlighter();
                if (isMounted) {
                    setHighlighterState(hl);
                }
            } catch (error) {
                console.error("Failed to load highlighter:", error);
                // Optionally set an error state for highlighter
            }
        };
        loadHighlighter();
        return () => {
            isMounted = false;
        };
    }, []);

    // Main effect to process markdownContent for images
    useEffect(() => {
        if (!isImageStorageInitialized || !highlighterState) {
            // Wait for dependencies to be ready
            setIsLoading(true);
            return;
        }

        setIsLoading(true);
        let didCancel = false; // Flag to prevent state updates if component unmounts or content changes quickly

        const processContent = async () => {
            let currentContent = markdownContent;
            const imageRegex = /!\[.*?\]\(indexeddb:\/\/([a-zA-Z0-9_-]+)\)/g;
            const matches = Array.from(markdownContent.matchAll(imageRegex));
            const newlyCreatedBlobUrls = new Set<string>();

            if (matches.length > 0) {
                const processingPromises = matches.map(async (match) => {
                    const imageId = match[1];
                    try {
                        const record = await imageStorage.getImageById(imageId);
                        if (record && record.file) {
                            const blobUrl = imageStorage.createImageUrl(record.file);
                            newlyCreatedBlobUrls.add(blobUrl);
                            currentContent = currentContent.replace(match[0], `![${match[0].substring(2, match[0].indexOf(']'))}](${blobUrl})`);
                        } else {
                            currentContent = currentContent.replace(match[0], `![Image not found: ${imageId}](missing-image-placeholder)`);
                        }
                    } catch (error) {
                        console.error(`Error processing image ${imageId} for preview:`, error);
                        currentContent = currentContent.replace(match[0], `![Error loading image: ${imageId}](error-loading-image)`);
                    }
                });
                await Promise.all(processingPromises);
            }

            if (didCancel) return;

            // Manage blob URLs: revoke old ones not in the new set, then update active set
            activeBlobUrls.forEach(url => {
                if (!newlyCreatedBlobUrls.has(url)) {
                    imageStorage.revokeImageUrl(url);
                }
            });

            setActiveBlobUrls(newlyCreatedBlobUrls);
            setProcessedMarkdown(currentContent);
            setIsLoading(false);
        };

        processContent();

        return () => {
            didCancel = true;
            // Potentially revoke URLs from newlyCreatedBlobUrls if processing was interrupted
            // and not yet moved to activeBlobUrls. However, the main cleanup effect
            // based on activeBlobUrls changing or unmount should handle most cases.
        };
    }, [markdownContent, isImageStorageInitialized, highlighterState, activeBlobUrls]); // Added activeBlobUrls to dependencies

    // Effect for cleaning up blob URLs when they change or on unmount
    useEffect(() => {
        return () => {
            // This cleans up all URLs currently in activeBlobUrls when the component unmounts
            // or if activeBlobUrls itself is reset (though direct reset is not typical).
            activeBlobUrls.forEach(url => imageStorage.revokeImageUrl(url));
        };
    }, [activeBlobUrls]);


    if (isLoading || !highlighterState) {
        return <div className="p-4 text-muted-foreground">Loading preview...</div>;
    }

    if (imageStorageError) {
        return <div className="p-4 text-red-500">Error initializing image storage: {imageStorageError}</div>;
    }

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    [rehypeShikiFromHighlighter, highlighterState, shikiOptions]
                ]}
            >
                {processedMarkdown}
            </ReactMarkdown>
        </div>
    );
} 