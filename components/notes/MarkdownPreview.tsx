import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
    markdownContent: string;
}

export function MarkdownPreview({ markdownContent }: MarkdownPreviewProps) {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdownContent}
            </ReactMarkdown>
        </div>
    );
} 