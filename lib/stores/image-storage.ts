"use client";

export interface ImageRecord {
	id: string;
	taskId: string;
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
					// Index by taskId for efficient queries
					store.createIndex("taskId", "taskId", { unique: false });
					// Index by createdAt for sorting
					store.createIndex("createdAt", "createdAt", { unique: false });
				}
			};
		});
	}

	async saveImage(taskId: string, file: File): Promise<ImageRecord> {
		if (!this.db) throw new Error("Database not initialized");

		const imageRecord: ImageRecord = {
			id: `${taskId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			taskId,
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

	async getImagesByTaskId(taskId: string): Promise<ImageRecord[]> {
		if (!this.db) throw new Error("Database not initialized");

		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error("Database not initialized"));
				return;
			}

			const transaction = this.db.transaction([this.storeName], "readonly");
			const store = transaction.objectStore(this.storeName);
			const index = store.index("taskId");
			const request = index.getAll(taskId);

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
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

	async deleteImagesByTaskId(taskId: string): Promise<void> {
		const images = await this.getImagesByTaskId(taskId);
		const deletePromises = images.map((image) => this.deleteImage(image.id));
		await Promise.all(deletePromises);
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
