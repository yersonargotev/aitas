"use client";

import { imageStorage } from "@/lib/stores/image-storage";
import { useTaskStore } from "@/lib/stores/task-store";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseMarkdownTextareaOptions {
	taskId: string;
	value: string;
	onChange: (value: string) => void;
	onImageUpload?: (imageId: string) => void;
}

export function useMarkdownTextarea({
	taskId,
	value,
	onChange,
	onImageUpload,
}: UseMarkdownTextareaOptions) {
	const [isUploading, setIsUploading] = useState(false);
	const [isStorageReady, setIsStorageReady] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { addImageToTask } = useTaskStore();

	// Initialize image storage
	useEffect(() => {
		const initStorage = async () => {
			try {
				await imageStorage.init();
				setIsStorageReady(true);
			} catch (error) {
				console.error("Failed to initialize image storage:", error);
			}
		};
		initStorage();
	}, []);

	const insertAtCursor = useCallback(
		(text: string) => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const newValue = value.substring(0, start) + text + value.substring(end);

			onChange(newValue);

			// Restore cursor position after the inserted text
			setTimeout(() => {
				textarea.selectionStart = textarea.selectionEnd = start + text.length;
				textarea.focus();
			}, 0);
		},
		[value, onChange],
	);

	const handlePaste = useCallback(
		async (event: React.ClipboardEvent) => {
			if (!isStorageReady) return;

			const clipboardData = event.clipboardData;
			if (!clipboardData?.files.length) return;

			// Check if any files are images
			const imageFiles = Array.from(clipboardData.files).filter((file) =>
				file.type.startsWith("image/"),
			);

			if (imageFiles.length === 0) return;

			event.preventDefault();
			setIsUploading(true);

			try {
				for (const file of imageFiles) {
					// Create placeholder text
					const placeholder = `![Uploading ${file.name}...]()`;
					insertAtCursor(placeholder);

					// Add image to task store (this already handles saving to IndexedDB)
					const imageId = await addImageToTask(taskId, file);

					// Create image URL and validate it
					const imageUrl = imageStorage.createImageUrl(file);
					if (!imageUrl || imageUrl.trim() === "") {
						throw new Error("Failed to create image URL");
					}

					const markdownImage = `![${file.name}](${imageUrl})`;

					const currentValue = textareaRef.current?.value || value;
					const updatedValue = currentValue.replace(placeholder, markdownImage);
					onChange(updatedValue);

					onImageUpload?.(imageId);
				}
			} catch (error) {
				console.error("Error uploading pasted image:", error);
				// Replace placeholder with error message
				const currentValue = textareaRef.current?.value || value;
				const errorValue = currentValue.replace(
					/!\[Uploading .*?\]\(\)/g,
					"![Upload failed]()",
				);
				onChange(errorValue);
			} finally {
				setIsUploading(false);
			}
		},
		[
			taskId,
			value,
			onChange,
			insertAtCursor,
			addImageToTask,
			onImageUpload,
			isStorageReady,
		],
	);

	const handleDrop = useCallback(
		async (event: React.DragEvent) => {
			if (!isStorageReady) return;

			const files = Array.from(event.dataTransfer.files).filter((file) =>
				file.type.startsWith("image/"),
			);

			if (files.length === 0) return;

			event.preventDefault();
			setIsUploading(true);

			try {
				for (const file of files) {
					const placeholder = `![Uploading ${file.name}...]()`;
					insertAtCursor(placeholder);

					// Add image to task store (this already handles saving to IndexedDB)
					const imageId = await addImageToTask(taskId, file);

					const imageUrl = imageStorage.createImageUrl(file);
					if (!imageUrl || imageUrl.trim() === "") {
						throw new Error("Failed to create image URL");
					}

					const markdownImage = `![${file.name}](${imageUrl})`;

					const currentValue = textareaRef.current?.value || value;
					const updatedValue = currentValue.replace(placeholder, markdownImage);
					onChange(updatedValue);

					onImageUpload?.(imageId);
				}
			} catch (error) {
				console.error("Error uploading dropped image:", error);
				const currentValue = textareaRef.current?.value || value;
				const errorValue = currentValue.replace(
					/!\[Uploading .*?\]\(\)/g,
					"![Upload failed]()",
				);
				onChange(errorValue);
			} finally {
				setIsUploading(false);
			}
		},
		[
			taskId,
			value,
			onChange,
			insertAtCursor,
			addImageToTask,
			onImageUpload,
			isStorageReady,
		],
	);

	const handleDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
	}, []);

	return {
		textareaRef,
		isUploading,
		isStorageReady,
		handlePaste,
		handleDrop,
		handleDragOver,
		insertAtCursor,
	};
}
