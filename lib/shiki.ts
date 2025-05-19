import { type Highlighter, createHighlighter } from "shiki";

let highlighterInstancePromise: Promise<Highlighter> | undefined = undefined;

// Define the themes and languages you want to support
// Catppuccin themes are not built-in for Shiki by default with just theme names.
// You might need to load them from JSON if they are not part of the 'shiki' package's bundled themes.
// For now, let's assume they are available or discoverable by these names.
// If not, `getHighlighter` will throw an error for unknown themes.
const themesToLoad: string[] = ["catppuccin-latte", "catppuccin-mocha"];

// Add common languages you expect to highlight
const languagesToLoad: string[] = [
	"javascript",
	"typescript",
	"jsx",
	"tsx",
	"json",
	"yaml",
	"markdown",
	"python",
	"java",
	"csharp",
	"cpp",
	"go",
	"rust",
	"html",
	"css",
	"scss",
	"less",
	"shell",
	"bash",
	"sql",
];

export function getAppHighlighter(): Promise<Highlighter> {
	if (highlighterInstancePromise === undefined) {
		highlighterInstancePromise = createHighlighter({
			themes: themesToLoad,
			langs: languagesToLoad,
		});
	}
	return highlighterInstancePromise;
}
