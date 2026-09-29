import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { isValidDateKey } from '$lib/calendar';
import { createEvent, deleteEvent, listEvents, updateEvent } from '$lib/server/events';

const eventSchema = z.object({
	date: z.string().refine(isValidDateKey, '日期格式需要为 YYYY-MM-DD'),
	title: z.string().trim().min(1, '名称不能为空').max(100, '名称太长'),
	description: z.string().trim().max(500).optional(),
	color: z
		.string()
		.trim()
		.regex(/^#[0-9a-fA-F]{6}$/, '颜色需要是 #RRGGBB 格式')
		.optional()
		.or(z.literal('')),
	repeatRule: z.enum(['none', 'yearly']).default('none')
});

function normalize(parsed: z.infer<typeof eventSchema>) {
	return {
		date: parsed.date,
		title: parsed.title,
		description: parsed.description && parsed.description.length > 0 ? parsed.description : null,
		color: parsed.color && parsed.color.length > 0 ? parsed.color : null,
		repeatRule: parsed.repeatRule
	};
}

export function load() {
	return { events: listEvents() };
}

export const actions = {
	create: async ({ request }: { request: Request }) => {
		const parsed = eventSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? '输入无效' });
		}
		createEvent(normalize(parsed.data));
		return { success: true, message: '特殊日期已创建' };
	},

	update: async ({ request }: { request: Request }) => {
		const form = Object.fromEntries(await request.formData());
		const id = Number(form.id);
		const parsed = eventSchema.safeParse(form);
		if (!Number.isInteger(id)) return fail(400, { message: '无效的记录' });
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? '输入无效' });
		}
		updateEvent(id, normalize(parsed.data));
		return { success: true, message: '已更新' };
	},

	delete: async ({ request }: { request: Request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isInteger(id)) return fail(400, { message: '无效的记录' });
		deleteEvent(id);
		return { success: true, message: '已删除' };
	}
};
