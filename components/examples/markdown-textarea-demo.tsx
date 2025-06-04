"use client";

import Image from "next/image";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MarkdownTextarea } from "../ui/markdown-textarea";

export function MarkdownTextareaDemo() {
    const [description, setDescription] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [taskId] = useState(() => `demo-task-${Date.now()}`);

    const handleImageUpload = (imageId: string) => {
        console.log("Image uploaded:", imageId);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Enhanced Markdown Textarea Demo</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Try pasting images directly into the textarea or drag & drop them!
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <MarkdownTextarea
                        taskId={taskId}
                        value={description}
                        onChange={setDescription}
                        onImageUpload={handleImageUpload}
                        placeholder="Type your markdown here... You can paste images directly!"
                        className="min-h-[200px]"
                        showImagePreview={true}
                        compactPreview={false}
                    />

                    <div className="text-sm text-muted-foreground">
                        <p><strong>Task ID:</strong> {taskId}</p>
                        <p><strong>Instructions:</strong></p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>Paste images directly with Ctrl+V or Cmd+V</li>
                            <li>Drag and drop image files onto the textarea</li>
                            <li>Click on image thumbnails to open full preview</li>
                            <li>Images are automatically saved to IndexedDB</li>
                        </ul>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            {showPreview ? "Hide" : "Show"} Markdown Preview
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDescription("")}
                        >
                            Clear
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {showPreview && description && (
                <Card>
                    <CardHeader>
                        <CardTitle>Markdown Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    img: ({ src, alt }) => {
                                        // Using Next/Image in Markdown can be tricky due to required width/height
                                        // and potential layout shifts if dimensions are unknown.
                                        // This is a placeholder implementation.
                                        // Consider a custom component or further refinement for production.
                                        if (!src) { // Handle cases where src might be undefined or empty
                                            return (
                                                <span className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                                                    <span>{alt || 'Image loading error'}</span>
                                                </span>
                                            );
                                        }
                                        const finalSrc = typeof src === 'string' ? src : URL.createObjectURL(src as Blob);
                                        return (
                                            <div style={{ position: 'relative', maxWidth: '100%', margin: '0.5rem 0' }}>
                                                <Image
                                                    src={finalSrc}
                                                    alt={alt || 'Image'}
                                                    width={500} // Placeholder width
                                                    height={300} // Placeholder height
                                                    layout="responsive"
                                                    objectFit="contain"
                                                    className="rounded border"
                                                    unoptimized={true} // Assuming these might be blob URLs or external
                                                    onError={() => {
                                                        console.error("Failed to load image in markdown demo:", finalSrc);
                                                    }}
                                                />
                                            </div>
                                        );
                                    },
                                }}
                            >
                                {description}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li>✅ <strong>Paste images directly</strong> - Ctrl+V or Cmd+V with images in clipboard</li>
                        <li>✅ <strong>Drag & drop images</strong> - Drop image files directly onto the textarea</li>
                        <li>✅ <strong>Image preview</strong> - See thumbnails of uploaded images below the textarea</li>
                        <li>✅ <strong>Click to preview</strong> - Click any thumbnail to open full preview dialog</li>
                        <li>✅ <strong>Markdown support</strong> - Full markdown syntax with image references</li>
                        <li>✅ <strong>Compact mode</strong> - Use compactPreview prop for smaller preview grids</li>
                        <li>✅ <strong>Image management</strong> - Images are stored in IndexedDB and synced with tasks</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
} 