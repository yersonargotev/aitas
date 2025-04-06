"use client";

/**
 * Utility functions for handling localStorage operations safely
 */

/**
 * Safely get an item from localStorage with error handling
 */
export function safeGetItem(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch (error) {
		console.error(`Error getting item from localStorage: ${error}`);
		return null;
	}
}

/**
 * Safely set an item in localStorage with error handling
 */
export function safeSetItem(key: string, value: string): boolean {
	try {
		localStorage.setItem(key, value);
		return true;
	} catch (error) {
		console.error(`Error setting item in localStorage: ${error}`);

		// Check if the error is due to quota exceeded
		if (error instanceof DOMException && error.name === "QuotaExceededError") {
			console.warn("localStorage quota exceeded, attempting to free up space");
			return handleQuotaExceeded(key, value);
		}

		return false;
	}
}

/**
 * Handle localStorage quota exceeded error by removing older items
 */
function handleQuotaExceeded(key: string, value: string): boolean {
	try {
		// Get all keys from localStorage
		const keys = Object.keys(localStorage);

		// Sort keys by their last modified time (if available)
		// This is a simple approach - in a real app, you might want to store
		// timestamps with each item to make better decisions about what to remove
		const sortedKeys = keys.sort((a, b) => {
			// Try to get the last modified time from the item itself
			const aValue = localStorage.getItem(a);
			const bValue = localStorage.getItem(b);

			try {
				const aData = aValue ? JSON.parse(aValue) : null;
				const bData = bValue ? JSON.parse(bValue) : null;

				const aTime = aData?.updatedAt
					? new Date(aData.updatedAt).getTime()
					: 0;
				const bTime = bData?.updatedAt
					? new Date(bData.updatedAt).getTime()
					: 0;

				return aTime - bTime;
			} catch {
				// If parsing fails, just use the key names
				return a.localeCompare(b);
			}
		});

		// Remove items until we have enough space
		// Start with the oldest 20% of items
		const itemsToRemove = Math.max(1, Math.floor(sortedKeys.length * 0.2));

		for (let i = 0; i < itemsToRemove; i++) {
			localStorage.removeItem(sortedKeys[i]);
		}

		// Try to set the item again
		localStorage.setItem(key, value);
		return true;
	} catch (error) {
		console.error(`Failed to handle quota exceeded: ${error}`);
		return false;
	}
}

/**
 * Check if localStorage is available and working
 */
export function isLocalStorageAvailable(): boolean {
	try {
		const testKey = "__storage_test__";
		localStorage.setItem(testKey, testKey);
		localStorage.removeItem(testKey);
		return true;
	} catch (e) {
		console.error(`Error checking localStorage availability: ${e}`);
		return false;
	}
}

/**
 * Get the size of localStorage in bytes
 */
export function getLocalStorageSize(): number {
	let total = 0;
	for (const key in localStorage) {
		if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
			total += localStorage[key].length + key.length;
		}
	}
	return total;
}

/**
 * Estimate if an item will fit in localStorage
 */
export function willItemFit(key: string, value: string): boolean {
	const itemSize = key.length + value.length;
	const currentSize = getLocalStorageSize();
	const maxSize = 5 * 1024 * 1024; // 5MB is a common limit

	return currentSize + itemSize < maxSize;
}
