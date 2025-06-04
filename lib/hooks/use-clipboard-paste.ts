"use client";

import { useCallback, useEffect, useState } from "react";

interface UseClipboardPasteOptions {
	onImagePaste: (file: File) => Promise<void> | void;
	enabled?: boolean;
	targetElement?: HTMLElement | null;
	onPasteStart?: () => void;
	onPasteComplete?: (success: boolean) => void;
}

export function useClipboardPaste({
	onImagePaste,
	enabled = true,
	targetElement,
	onPasteStart,
	onPasteComplete,
}: UseClipboardPasteOptions) {
	const [isPasting, setIsPasting] = useState(false);

	const handlePaste = useCallback(
		async (event: ClipboardEvent) => {
			if (!enabled || isPasting) return;

			const clipboardData = event.clipboardData;
			if (!clipboardData) return;

			// Buscar archivos de imagen en el clipboard
			const items = Array.from(clipboardData.items);
			const imageItems = items.filter((item) => item.type.startsWith("image/"));

			if (imageItems.length === 0) return;

			// Prevenir el comportamiento por defecto
			event.preventDefault();

			setIsPasting(true);
			onPasteStart?.();

			try {
				// Procesar cada imagen
				for (const item of imageItems) {
					const file = item.getAsFile();
					if (file) {
						// Crear un nombre descriptivo para la imagen pegada
						const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
						const extension = file.type.split("/")[1] || "png";
						const renamedFile = new File(
							[file],
							`pasted-image-${timestamp}.${extension}`,
							{
								type: file.type,
								lastModified: Date.now(),
							},
						);

						await onImagePaste(renamedFile);
					}
				}
				onPasteComplete?.(true);
			} catch (error) {
				console.error("Error pasting image:", error);
				onPasteComplete?.(false);
			} finally {
				setIsPasting(false);
			}
		},
		[onImagePaste, enabled, isPasting, onPasteStart, onPasteComplete],
	);

	// Moved pasteFromClipboard before handleKeyDown
	const pasteFromClipboard = useCallback(async () => {
		if (isPasting) return;

		try {
			setIsPasting(true);
			onPasteStart?.();

			const clipboardItems = await navigator.clipboard.read();
			let foundImage = false;

			for (const clipboardItem of clipboardItems) {
				for (const type of clipboardItem.types) {
					if (type.startsWith("image/")) {
						const blob = await clipboardItem.getType(type);
						const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
						const extension = type.split("/")[1] || "png";
						const file = new File(
							[blob],
							`pasted-image-${timestamp}.${extension}`,
							{
								type,
								lastModified: Date.now(),
							},
						);

						await onImagePaste(file);
						foundImage = true;
					}
				}
			}

			onPasteComplete?.(foundImage);
		} catch (error) {
			console.warn("Could not read from clipboard:", error);
			onPasteComplete?.(false);
		} finally {
			setIsPasting(false);
		}
	}, [onImagePaste, isPasting, onPasteStart, onPasteComplete]);

	// Detectar combinación de teclas Ctrl+V/Cmd+V
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (!enabled) return;

			if ((event.ctrlKey || event.metaKey) && event.key === "v") {
				// Si el foco está en un input o textarea, no interceptar
				const activeElement = document.activeElement;
				if (
					activeElement &&
					(activeElement.tagName === "INPUT" ||
						activeElement.tagName === "TEXTAREA" ||
						activeElement.getAttribute("contenteditable") === "true")
				) {
					return;
				}

				// Intentar pegar desde el clipboard API
				pasteFromClipboard();
			}
		},
		[enabled, pasteFromClipboard],
	);

	useEffect(() => {
		const element = targetElement || document;

		const pasteHandler = (event: Event) => handlePaste(event as ClipboardEvent);
		const keyHandler = (event: Event) => handleKeyDown(event as KeyboardEvent);

		if (enabled) {
			element.addEventListener("paste", pasteHandler);
			document.addEventListener("keydown", keyHandler);
		}

		return () => {
			element.removeEventListener("paste", pasteHandler);
			document.removeEventListener("keydown", keyHandler);
		};
	}, [handlePaste, handleKeyDown, enabled, targetElement]);

	return {
		pasteFromClipboard,
		isPasting,
	};
}
