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

	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = () => reject(request.error);
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
		if (!this.db) {
			console.error("Database not initialized. Call init() first.");
			return null;
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([this.storeName], "readonly");
			const store = transaction.objectStore(this.storeName);
			const request = store.get(imageId);

			request.onsuccess = () => {
				resolve(request.result || null); // request.result is undefined if not found
			};
			request.onerror = () => {
				console.error(`Error fetching image by ID ${imageId}:`, request.error);
				reject(request.error);
			};
		});
	}

	async deleteImage(imageId: string): Promise<void> {
		if (!this.db) throw new Error("Database not initialized");

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
