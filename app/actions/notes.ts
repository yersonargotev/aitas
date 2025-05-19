"use server";

import { getAppHighlighter } from "@/lib/shiki";
import type { RehypeShikiOptions } from "@shikijs/rehype"; // For options type safety
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import {
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
} from "@shikijs/transformers";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

export async function renderMarkdownPreviewAction(
	markdownContent: string,
): Promise<{ html: string } | { error: string; details?: string }> {
	try {
		const highlighter = await getAppHighlighter();

		// Ensure RehypeShikiOptions is used correctly or define a local interface if import is problematic in actions
		const shikiOptions: RehypeShikiOptions = {
			themes: {
				light: "catppuccin-latte",
				dark: "catppuccin-mocha",
			},
			transformers: [
				transformerNotationDiff(),
				transformerNotationHighlight(),
				transformerNotationFocus(),
			],
			// Add other shiki options if necessary, e.g. langAliases
		};

		const file = await remark()
			.use(remarkGfm)
			.use(remarkRehype, { allowDangerousHtml: true }) // allowDangerousHtml for Shiki output
			.use(rehypeShikiFromHighlighter, highlighter, shikiOptions)
			.use(rehypeStringify, { allowDangerousHtml: true })
			.process(markdownContent);

		return { html: String(file) };
	} catch (e) {
		let errorMessage = "Failed to render preview.";
		if (e instanceof Error) {
			errorMessage = e.message;
		}
		console.error("Error rendering markdown preview:", e);
		return { error: "Failed to render preview.", details: errorMessage };
	}
}

// You might want to add other note-related server actions here in the future
// e.g., for saving/updating notes if not already handled by useNotesStore with its own actions.
