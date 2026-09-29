import { randomUUID } from 'node:crypto';
import { mkdirSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { imageSize } from 'image-size';
import { eq } from 'drizzle-orm';
import { dataDir, db } from './db';
import { image, type ImageRow } from './db/schema';

export const imagesDir = join(dataDir, 'images');

const EXT_BY_MIME: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/avif': 'avif',
	'image/svg+xml': 'svg'
};

export function isSupportedImage(mimeType: string): boolean {
	return mimeType.startsWith('image/');
}

export interface NewImage {
	diaryId: number;
	originalFilename: string;
	mimeType: string;
	data: Buffer;
}

/** 保存图片文件到 data/images/YYYY/MM/，并在数据库写入 metadata。 */
export function saveImage(input: NewImage): ImageRow {
	const now = new Date();
	const year = String(now.getFullYear());
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const ext =
		EXT_BY_MIME[input.mimeType] ??
		(input.originalFilename.split('.').pop() ?? 'bin').toLowerCase().slice(0, 8);
	const relativePath = join(year, month, `${randomUUID()}.${ext}`);
	const absolutePath = join(imagesDir, relativePath);
	mkdirSync(join(imagesDir, year, month), { recursive: true });
	writeFileSync(absolutePath, input.data);

	let width: number | null = null;
	let height: number | null = null;
	try {
		const dims = imageSize(input.data);
		width = dims.width ?? null;
		height = dims.height ?? null;
	} catch {
		// 无法解析尺寸时忽略（例如 svg）
	}

	return db
		.insert(image)
		.values({
			diaryId: input.diaryId,
			path: relativePath,
			originalFilename: input.originalFilename,
			mimeType: input.mimeType,
			width,
			height,
			size: input.data.byteLength
		})
		.returning()
		.get();
}

export function getImage(id: number): ImageRow | undefined {
	return db.select().from(image).where(eq(image.id, id)).get();
}

export function deleteImageFile(path: string): void {
	if (!path) return;
	const absolute = join(imagesDir, path);
	if (existsSync(absolute)) {
		try {
			unlinkSync(absolute);
		} catch (err) {
			console.error('[images] failed to delete file', absolute, err);
		}
	}
}

export function deleteImage(id: number): boolean {
	const row = getImage(id);
	if (!row) return false;
	deleteImageFile(row.path);
	db.delete(image).where(eq(image.id, id)).run();
	return true;
}
