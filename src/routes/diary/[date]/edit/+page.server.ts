import { error, fail, redirect } from '@sveltejs/kit';
import { formatCN, getLunarInfo, isValidDateKey } from '$lib/calendar';
import { deleteDiary, ensureDiary, getDiaryDetail, saveDiary } from '$lib/server/diary';
import { deleteImage, isSupportedImage, saveImage } from '$lib/server/images';
import { listStatuses } from '$lib/server/status';

export function load({ params }: { params: { date: string } }) {
	const date = params.date;
	if (!isValidDateKey(date)) error(404, '无效的日期');

	return {
		date,
		dateLabel: formatCN(date),
		lunar: getLunarInfo(date),
		detail: getDiaryDetail(date),
		statuses: listStatuses()
	};
}

function readStatusIds(form: FormData, key = 'statusIds'): number[] {
	return form
		.getAll(key)
		.map((value) => Number(value))
		.filter((value) => Number.isInteger(value) && value > 0);
}

export const actions = {
	save: async ({ request }: { request: Request }) => {
		const form = await request.formData();
		const date = String(form.get('date') ?? '');
		if (!isValidDateKey(date)) return fail(400, { message: '无效的日期' });

		const title = String(form.get('title') ?? '').trim();
		const content = String(form.get('content') ?? '');
		const statusIds = readStatusIds(form);

		saveDiary({
			date,
			title: title.length > 0 ? title : null,
			content: content.trim().length > 0 ? content : null,
			statusIds
		});

		// 保存后回到浏览页
		redirect(303, `/diary/${date}`);
	},

	delete: async ({ request }: { request: Request }) => {
		const form = await request.formData();
		const date = String(form.get('date') ?? '');
		if (!isValidDateKey(date)) return fail(400, { message: '无效的日期' });
		deleteDiary(date);
		redirect(303, '/');
	},

	uploadImage: async ({ request }: { request: Request }) => {
		const form = await request.formData();
		const date = String(form.get('date') ?? '');
		if (!isValidDateKey(date)) return fail(400, { message: '无效的日期' });

		const file = form.get('file');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { message: '请选择图片文件' });
		}
		const mimeType = file.type || 'application/octet-stream';
		if (!isSupportedImage(mimeType)) {
			return fail(400, { message: '只支持图片文件' });
		}

		const diaryRow = ensureDiary(date);
		const data = Buffer.from(await file.arrayBuffer());
		saveImage({
			diaryId: diaryRow.id,
			originalFilename: file.name || 'image',
			mimeType,
			data
		});
		return { success: true, message: '图片已上传' };
	},

	deleteImage: async ({ request }: { request: Request }) => {
		const form = await request.formData();
		const id = Number(form.get('imageId'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { message: '无效的图片' });
		deleteImage(id);
		return { success: true, message: '图片已删除' };
	}
};
