"use client";

import { imageStorage } from "@/lib/stores/image-storage";
import type { TaskImage } from "@/lib/stores/types";
import { useEffect, useMemo, useRef, useState } from "react";

interface ImageUrlCache {
	[imageId: string]: string;
}

export function useImageUrls(images: TaskImage[] = []) {
	const urlCacheRef = useRef<ImageUrlCache>({});
	const imagesMapRef = useRef<Map<string, TaskImage>>(new Map());
	const [urlCache, setUrlCache] = useState<ImageUrlCache>({});

	// Crear mapa de imágenes por ID para acceso rápido
	const imageIds = useMemo(() => {
		const newMap = new Map<string, TaskImage>();
		for (const image of images) {
			newMap.set(image.id, image);
		}
		imagesMapRef.current = newMap;
		return images.map((img) => img.id).sort();
	}, [images]);

	// Crear/actualizar URLs cuando cambian los IDs de las imágenes
	useEffect(() => {
		const updateUrls = () => {
			const currentCache = { ...urlCacheRef.current };
			const currentImageIds = new Set(imageIds);
			let hasChanges = false;

			// Limpiar URLs de imágenes que ya no existen
			for (const cachedImageId of Object.keys(currentCache)) {
				if (!currentImageIds.has(cachedImageId)) {
					const url = currentCache[cachedImageId];
					if (url) {
						imageStorage.revokeImageUrl(url);
						delete currentCache[cachedImageId];
						hasChanges = true;
					}
				}
			}

			// Crear URLs para nuevas imágenes
			for (const imageId of imageIds) {
				if (!currentCache[imageId]) {
					const image = imagesMapRef.current.get(imageId);
					if (image?.file) {
						try {
							const url = imageStorage.createImageUrl(image.file);
							if (url && url !== "") {
								currentCache[imageId] = url;
								hasChanges = true;
							}
						} catch (error) {
							console.warn(`Failed to create URL for image ${imageId}:`, error);
						}
					}
				}
			}

			// Actualizar la referencia y el estado solo si hay cambios
			if (hasChanges) {
				urlCacheRef.current = currentCache;
				// Usar una función de callback para evitar dependencias circulares
				setUrlCache((prev) => {
					// Solo actualizar si realmente hay diferencias
					const hasRealChanges =
						Object.keys(currentCache).length !== Object.keys(prev).length ||
						Object.keys(currentCache).some(
							(key) => currentCache[key] !== prev[key],
						);

					return hasRealChanges ? { ...currentCache } : prev;
				});
			}
		};

		updateUrls();
	}, [imageIds]);

	// Limpiar todas las URLs al desmontar el componente
	useEffect(() => {
		return () => {
			const currentCache = urlCacheRef.current;
			for (const url of Object.values(currentCache)) {
				if (url) {
					imageStorage.revokeImageUrl(url);
				}
			}
			urlCacheRef.current = {};
		};
	}, []);

	return urlCache;
}

// Hook para inicializar las imágenes al cargar la aplicación
export function useImageInitializer() {
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		const initializeImages = async () => {
			try {
				await imageStorage.init();
				setIsInitialized(true);
			} catch (error) {
				console.error("Failed to initialize image storage:", error);
			}
		};

		initializeImages();
	}, []);

	return isInitialized;
}
