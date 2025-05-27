"use client";

import { imageStorage } from "@/lib/stores/image-storage";
import type { TaskImage } from "@/lib/stores/types";
import { useEffect, useMemo, useRef } from "react";

interface ImageUrlCache {
	[imageId: string]: string;
}

export function useImageUrls(images: TaskImage[] = []) {
	const urlCacheRef = useRef<ImageUrlCache>({});
	const imagesMapRef = useRef<Map<string, TaskImage>>(new Map());

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
	const urlCache = useMemo(() => {
		const currentCache = { ...urlCacheRef.current };
		const currentImageIds = new Set(imageIds);

		// Limpiar URLs de imágenes que ya no existen
		for (const cachedImageId of Object.keys(currentCache)) {
			if (!currentImageIds.has(cachedImageId)) {
				const url = currentCache[cachedImageId];
				if (url) {
					imageStorage.revokeImageUrl(url);
					delete currentCache[cachedImageId];
				}
			}
		}

		// Crear URLs para nuevas imágenes
		for (const imageId of imageIds) {
			if (!currentCache[imageId]) {
				const image = imagesMapRef.current.get(imageId);
				if (image) {
					currentCache[imageId] = imageStorage.createImageUrl(image.file);
				}
			}
		}

		// Actualizar la referencia
		urlCacheRef.current = currentCache;
		return currentCache;
	}, [imageIds]);

	// Limpiar todas las URLs al desmontar el componente
	useEffect(() => {
		return () => {
			const currentCache = urlCacheRef.current;
			for (const url of Object.values(currentCache)) {
				imageStorage.revokeImageUrl(url);
			}
		};
	}, []);

	return urlCache;
}
