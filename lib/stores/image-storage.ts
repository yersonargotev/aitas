"use client";

import { nanoid } from "nanoid";

export interface ImageRecord {
	id: string;
	parentId: string;
	file: File;
	name: string;
	size: number;
	type: string;
	createdAt: Date;
}

class ImageStorageService {
	private dbName = "TaskImagesDB";
	private dbVersion = 1;
	private storeName = "images";
	public db: IDBDatabase | null = null;
	private initPromise: Promise<void> | null = null;
	private memoryCache = new Map<string, { record: ImageRecord; blobUrl: string; lastAccessed: number }>();
	private readonly maxCacheSize = 50;
	private readonly cacheExpiryTime = 5 * 60 * 1000; // 5 minutes

	async init(): Promise<void> {
		// Singleton pattern: return existing promise if initialization is in progress
		if (this.initPromise) {
			return this.initPromise;
		}

		// If already initialized, return immediately
		if (this.db) {
			return Promise.resolve();
		}

		this.initPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = () => {
				this.initPromise = null; // Reset on error
				reject(request.error);
			};
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				if (!db.objectStoreNames.contains(this.storeName)) {
					const store = db.createObjectStore(this.storeName, { keyPath: "id" });
					// Index by parentId for efficient queries
					store.createIndex("parentId", "parentId", { unique: false });
					// Index by createdAt for sorting
					store.createIndex("createdAt", "createdAt", { unique: false });
				}
			};
		});

		return this.initPromise;
	}

	// New method to check if storage is initialized
	isInitialized(): boolean {
		return this.db !== null;
	}

	// New method to get initialization status
	getInitializationStatus(): 'not-started' | 'in-progress' | 'initialized' {
		if (this.db) return 'initialized';
		if (this.initPromise) return 'in-progress';
		return 'not-started';
	}

	async saveImage(parentId: string, file: File): Promise<ImageRecord> {
		if (!this.db) throw new Error("Database not initialized");

		const imageRecord: ImageRecord = {
			id: nanoid(),
			parentId,
			file,
			name: file.name,
			size: file.size,
			type: file.type,
			createdAt: new Date(),
		};

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("Database not initialized"));
				return;
			}

			const transaction = this.db.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.add(imageRecord);

			request.onsuccess = () => resolve(imageRecord);
			request.onerror = () => reject(request.error);
		});
	}

	async getImagesByParentId(parentId: string): Promise<ImageRecord[]> {
		if (!this.db) throw new Error("Database not initialized");

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("Database not initialized"));
				return;
			}

			const transaction = this.db.transaction([this.storeName], "readonly");
			const store = transaction.objectStore(this.storeName);
			const index = store.index("parentId");
			const request = index.getAll(parentId);

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async getImageById(imageId: string): Promise<ImageRecord | null> {
		// Check memory cache first
		const cached = this.memoryCache.get(imageId);
		if (cached && Date.now() - cached.lastAccessed < this.cacheExpiryTime) {
			cached.lastAccessed = Date.now();
			return cached.record;
		}

		if (!this.db) {
			console.error("Database not initialized. Call init() first.");
			return null;
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], "readonly");
			const store = transaction.objectStore(this.storeName);
			const request = store.get(imageId);

			request.onsuccess = () => {
				const record = request.result || null;
				if (record) {
					// Cache the result
					this.cacheImage(imageId, record);
				}
				resolve(record);
			};
			request.onerror = () => {
				console.error(`Error fetching image by ID ${imageId}:`, request.error);
				reject(request.error);
			};
		});
	}

	// New method: Batch image retrieval for performance
	async getImagesByIds(imageIds: string[]): Promise<Map<string, ImageRecord | null>> {
		const results = new Map<string, ImageRecord | null>();
		const uncachedIds: string[] = [];

		// Check cache first for all requested IDs
		for (const id of imageIds) {
			const cached = this.memoryCache.get(id);
			if (cached && Date.now() - cached.lastAccessed < this.cacheExpiryTime) {
				cached.lastAccessed = Date.now();
				results.set(id, cached.record);
			} else {
				uncachedIds.push(id);
			}
		}

		// If all images were cached, return immediately
		if (uncachedIds.length === 0) {
			return results;
		}

		// Batch fetch uncached images from IndexedDB
		if (!this.db) {
			console.error("Database not initialized. Call init() first.");
			// Set null for all uncached IDs
			for (const id of uncachedIds) {
				results.set(id, null);
			}
			return results;
		}

		return new Promise((resolve) => {
			const transaction = this.db!.transaction([this.storeName], "readonly");
			const store = transaction.objectStore(this.storeName);

			let completed = 0;
			const total = uncachedIds.length;

			for (const id of uncachedIds) {
				const request = store.get(id);

				request.onsuccess = () => {
					const record = request.result || null;
					if (record) {
						this.cacheImage(id, record);
					}
					results.set(id, record);

					completed++;
					if (completed === total) {
						resolve(results);
					}
				};

				request.onerror = () => {
					console.error(`Error fetching image by ID ${id}:`, request.error);
					results.set(id, null);
					completed++;
					if (completed === total) {
						resolve(results);
					}
				};
			}
		});
	}

	// Cache management methods
	private cacheImage(imageId: string, record: ImageRecord): void {
		// Clean up expired entries
		this.cleanupCache();

		// If cache is full, remove least recently used items
		if (this.memoryCache.size >= this.maxCacheSize) {
			const oldestKey = Array.from(this.memoryCache.entries())
				.sort(([,a], [,b]) => a.lastAccessed - b.lastAccessed)[0][0];
			this.memoryCache.delete(oldestKey);
		}

		// Cache the new image with a blob URL
		const blobUrl = this.createImageUrl(record.file);
		this.memoryCache.set(imageId, {
			record,
			blobUrl,
			lastAccessed: Date.now()
		});
	}

	private cleanupCache(): void {
		const now = Date.now();
		for (const [key, value] of this.memoryCache.entries()) {
			if (now - value.lastAccessed > this.cacheExpiryTime) {
				// Revoke the blob URL before removing from cache
				this.revokeImageUrl(value.blobUrl);
				this.memoryCache.delete(key);
			}
		}
	}

	// Get cached blob URL for image
	getCachedImageUrl(imageId: string): string | null {
		const cached = this.memoryCache.get(imageId);
		if (cached && Date.now() - cached.lastAccessed < this.cacheExpiryTime) {
			cached.lastAccessed = Date.now();
			return cached.blobUrl;
		}
		return null;
	}

	// Clear cache (useful for cleanup)
	clearCache(): void {
		for (const [, value] of this.memoryCache.entries()) {
			this.revokeImageUrl(value.blobUrl);
		}
		this.memoryCache.clear();
	}

	async deleteImage(imageId: string): Promise<void> {
		if (!this.db) throw new Error("Database not initialized");

		// Remove from cache first
		const cached = this.memoryCache.get(imageId);
		if (cached) {
			this.revokeImageUrl(cached.blobUrl);
			this.memoryCache.delete(imageId);
		}

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("Database not initialized"));
				return;
			}

			const transaction = this.db.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);
			const request = store.delete(imageId);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async deleteImagesByParentId(parentId: string): Promise<void> {
		const images = await this.getImagesByParentId(parentId);
		const deletePromises = images.map((image) => this.deleteImage(image.id));
		await Promise.all(deletePromises);
	}

	async transferImages(fromParentId: string, toParentId: string): Promise<void> {
		if (!this.db) throw new Error("Database not initialized");

		const images = await this.getImagesByParentId(fromParentId);

		if (images.length === 0) return;

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("Database not initialized"));
				return;
			}

			const transaction = this.db.transaction([this.storeName], "readwrite");
			const store = transaction.objectStore(this.storeName);

			let completed = 0;
			const total = images.length;

			const checkComplete = () => {
				completed++;
				if (completed === total) {
					resolve();
				}
			};

			// Update each image's parentId
			for (const image of images) {
				const updatedImage = { ...image, parentId: toParentId };
				const request = store.put(updatedImage);

				request.onsuccess = () => checkComplete();
				request.onerror = () => reject(request.error);
			}

			transaction.onerror = () => reject(transaction.error);
		});
	}

	async getAllImages(): Promise<ImageRecord[]> {
		if (!this.db) throw new Error("Database not initialized");

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("Database not initialized"));
				return;
			}

			const transaction = this.db.transaction([this.storeName], "readonly");
			const store = transaction.objectStore(this.storeName);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async getStorageUsage(): Promise<{ count: number; totalSize: number }> {
		const images = await this.getAllImages();
		return {
			count: images.length,
			totalSize: images.reduce((total, image) => total + image.size, 0),
		};
	}

	createImageUrl(file: File): string {
		return URL.createObjectURL(file);
	}

	revokeImageUrl(url: string): void {
		URL.revokeObjectURL(url);
	}

	formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
}

export const imageStorage = new ImageStorageService();
