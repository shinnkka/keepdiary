import { error } from '@sveltejs/kit';
import { createReadStream, statSync } from 'node:fs';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { getImage, imagesDir } from '$lib/server/images';

/**
 * 提供 data/images/ 下的图片与视频。
 * 支持 HTTP Range，视频才能拖动进度/边下边播。
 */
export function GET({ params, request }: { params: { id: string }; request: Request }) {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) error(404, 'Not found');

	const row = getImage(id);
	if (!row) error(404, 'Not found');

	const absolute = join(imagesDir, row.path);
	let size: number;
	try {
		size = statSync(absolute).size;
	} catch {
		error(404, 'Not found');
	}

	const headers: Record<string, string> = {
		'content-type': row.mimeType,
		'accept-ranges': 'bytes',
		'cache-control': 'private, max-age=31536000, immutable'
	};

	const range = request.headers.get('range');
	if (range) {
		const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
		if (match) {
			let start = match[1] ? Number(match[1]) : 0;
			let end = match[2] ? Number(match[2]) : size - 1;

			// bytes=-N 表示最后 N 字节
			if (!match[1] && match[2]) {
				start = Math.max(0, size - Number(match[2]));
				end = size - 1;
			}

			if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
				return new Response(null, {
					status: 416,
					headers: { 'content-range': `bytes */${size}` }
				});
			}

			end = Math.min(end, size - 1);
			const stream = createReadStream(absolute, { start, end });
			return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
				status: 206,
				headers: {
					...headers,
					'content-range': `bytes ${start}-${end}/${size}`,
					'content-length': String(end - start + 1)
				}
			});
		}
	}

	const stream = createReadStream(absolute);
	return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
		headers: { ...headers, 'content-length': String(size) }
	});
}
