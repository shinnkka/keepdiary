import { error } from '@sveltejs/kit';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getImage, imagesDir } from '$lib/server/images';

export function GET({ params }: { params: { id: string } }) {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) error(404, 'Not found');

	const row = getImage(id);
	if (!row) error(404, 'Not found');

	let buffer: Buffer;
	try {
		buffer = readFileSync(join(imagesDir, row.path));
	} catch {
		error(404, 'Not found');
	}

	return new Response(new Uint8Array(buffer), {
		headers: {
			'content-type': row.mimeType,
			'cache-control': 'private, max-age=31536000, immutable'
		}
	});
}
