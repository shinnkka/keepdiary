import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import {
	createStatus,
	deleteStatus,
	listStatuses,
	swapStatusOrder,
	updateStatus
} from '$lib/server/status';

const colorSchema = z
	.string()
	.trim()
	.regex(/^#[0-9a-fA-F]{6}$/, '颜色需要是 #RRGGBB 格式');

const statusSchema = z.object({
	name: z.string().trim().min(1, '名称不能为空').max(50, '名称太长'),
	color: colorSchema
});

export function load() {
	return { statuses: listStatuses() };
}

export const actions = {
	create: async ({ request }: { request: Request }) => {
		const parsed = statusSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? '输入无效' });
		}
		createStatus(parsed.data);
		return { success: true, message: '状态已创建' };
	},

	update: async ({ request }: { request: Request }) => {
		const form = Object.fromEntries(await request.formData());
		const id = Number(form.id);
		const parsed = statusSchema.safeParse(form);
		if (!Number.isInteger(id)) return fail(400, { message: '无效的状态' });
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? '输入无效' });
		}
		updateStatus(id, parsed.data);
		return { success: true, message: '已更新' };
	},

	delete: async ({ request }: { request: Request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isInteger(id)) return fail(400, { message: '无效的状态' });
		deleteStatus(id);
		return { success: true, message: '已删除' };
	},

	move: async ({ request }: { request: Request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		const direction = String(form.get('direction'));
		const statuses = listStatuses();
		const index = statuses.findIndex((s) => s.id === id);
		if (index < 0) return fail(400, { message: '无效的状态' });
		const target = direction === 'up' ? index - 1 : index + 1;
		if (target < 0 || target >= statuses.length) return { success: true };
		swapStatusOrder(statuses[index].id, statuses[target].id);
		return { success: true };
	}
};
