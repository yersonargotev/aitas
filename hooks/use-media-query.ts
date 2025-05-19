"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQueryList = window.matchMedia(query);
		const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

		// Set initial state
		setMatches(mediaQueryList.matches);

		// Deprecated `addListener` and `removeListener` for older browser compatibility if needed
		// but modern browsers support addEventListener/removeEventListener
		try {
			mediaQueryList.addEventListener("change", listener);
		} catch (e) {
			// Fallback for older browsers
			mediaQueryList.addListener(listener);
		}

		return () => {
			try {
				mediaQueryList.removeEventListener("change", listener);
			} catch (e) {
				// Fallback for older browsers
				mediaQueryList.removeListener(listener);
			}
		};
	}, [query]);

	return matches;
}
