"use client";

import { useEffect, useState } from "react";
import type { StoreApi } from "zustand";
import { isLocalStorageAvailable } from "../stores/storage-utils";

/**
 * Custom hook to handle Zustand store hydration in Next.js
 * This hook ensures that the store is only accessed after hydration is complete
 * to avoid hydration mismatches between server and client
 */
export function useStoreHydration<T, R>(
	store: StoreApi<T>,
	selector: (state: T) => R,
): [R | null, boolean] {
	const [state, setState] = useState<R | null>(null);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		// Check if we're in a browser environment and localStorage is available
		if (typeof window !== "undefined" && isLocalStorageAvailable()) {
			// Get the initial state
			const initialState = selector(store.getState());
			setState(initialState);

			// Subscribe to store changes
			const unsubscribe = store.subscribe((newState) => {
				const selectedState = selector(newState);
				setState(selectedState);
			});

			// Mark as hydrated
			setIsHydrated(true);

			// Cleanup subscription on unmount
			return () => {
				unsubscribe();
			};
		}

		// If localStorage is not available, mark as hydrated but with null state
		setIsHydrated(true);
		setState(null);
	}, [store, selector]);

	return [state, isHydrated];
}
