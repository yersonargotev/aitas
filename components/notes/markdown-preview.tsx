// Import our shared highlighter utility
import { getAppHighlighter } from '@/lib/shiki';
import type { RehypeShikiOptions } from '@shikijs/rehype';
// Use the core import for passing a custom highlighter
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import {
    transformerNotationDiff,
    transformerNotationFocus,
    transformerNotationHighlight,
} from '@shikijs/transformers';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
    markdownContent: string;
}

// Make the component async to use await for the highlighter
export async function MarkdownPreview({ markdownContent }: MarkdownPreviewProps) {
    // Get the pre-configured highlighter instance
    const highlighter = await getAppHighlighter();

    // Options for rehypeShikiFromHighlighter
    // We still pass themes here as shown in Shiki docs for rehypeShikiFromHighlighter
    const shikiOptions: RehypeShikiOptions = {
        // The `highlighter` instance is passed as a separate argument to the plugin,
        // but some options might still be relevant in this object.
        // The RehypeShikiOptions type expects themes, so we provide them.
        themes: {
            light: 'catppuccin-latte',
            dark: 'catppuccin-mocha',
        },
        transformers: [
            transformerNotationDiff(),
            transformerNotationHighlight(),
            transformerNotationFocus(),
        ],
        // No need to specify `highlighter` within this options object if it's passed directly to the .use(),
        // but RehypeShikiOptions might require it or the plugin uses it as a fallback.
        // The primary mechanism is passing the highlighter instance directly.
    };

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    // Pass the highlighter instance first, then the options
                    [rehypeShikiFromHighlighter, highlighter, shikiOptions]
                ]}
            >
                {markdownContent}
            </ReactMarkdown>
        </div>
    );
} 