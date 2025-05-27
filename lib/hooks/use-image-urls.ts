"use client";

import { imageStorage } from "@/lib/stores/image-storage";
import type { TaskImage } from "@/lib/stores/types";
import { useEffect, useMemo, useState } from "react";

interface ImageUrlCache {
	[imageId: string]: string;
}

export function useImageUrls(images: TaskImage[] = []) {
	const [urlCache, setUrlCache] = useState<ImageUrlCache>({});

	// Crear URLs para imágenes que no las tienen
	const imageUrls = useMemo(() => {
		const urls: ImageUrlCache = { ...urlCache };
		let hasNewUrls = false;

		for (const image of images) {
			if (!urls[image.id]) {
				urls[image.id] = imageStorage.createImageUrl(image.file);
				hasNewUrls = true;
			}
		}

		// Solo actualizar el estado si hay nuevas URLs
		if (hasNewUrls) {
			setUrlCache(urls);
		}

		return urls;
	}, [images, urlCache]);

	// Limpiar URLs cuando las imágenes cambian
	useEffect(() => {
		const currentImageIds = new Set(images.map((img) => img.id));
		const cachedImageIds = Object.keys(urlCache);

		// Revocar URLs de imágenes que ya no existen
		for (const imageId of cachedImageIds) {
			if (!currentImageIds.has(imageId)) {
				const url = urlCache[imageId];
				if (url) {
					imageStorage.revokeImageUrl(url);
				}
			}
		}

		// Actualizar cache removiendo URLs revocadas
		const updatedCache = Object.fromEntries(
			Object.entries(urlCache).filter(([imageId]) =>
				currentImageIds.has(imageId),
			),
		);

		if (Object.keys(updatedCache).length !== Object.keys(urlCache).length) {
			setUrlCache(updatedCache);
		}
	}, [images, urlCache]);

	// Limpiar todas las URLs al desmontar
	useEffect(() => {
		return () => {
			for (const url of Object.values(urlCache)) {
				imageStorage.revokeImageUrl(url);
			}
		};
	}, [urlCache]);

	return imageUrls;
}
