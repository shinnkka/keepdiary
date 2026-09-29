import { asc, eq, sql } from 'drizzle-orm';
import { db } from './db';
import { diaryStatus, status, type StatusRow } from './db/schema';

export function listStatuses(): StatusRow[] {
	return db.select().from(status).orderBy(asc(status.sortOrder), asc(status.id)).all();
}

export function getStatus(id: number): StatusRow | undefined {
	return db.select().from(status).where(eq(status.id, id)).get();
}

export function createStatus(input: { name: string; color: string }): StatusRow {
	const max = db
		.select({ value: sql<number>`coalesce(max(${status.sortOrder}), 0)` })
		.from(status)
		.get();
	const row = db
		.insert(status)
		.values({
			name: input.name,
			color: input.color,
			sortOrder: (max?.value ?? 0) + 10
		})
		.returning()
		.get();
	return row;
}

export function updateStatus(
	id: number,
	input: { name?: string; color?: string; sortOrder?: number }
): StatusRow | undefined {
	const patch: Record<string, unknown> = { updatedAt: new Date() };
	if (input.name !== undefined) patch.name = input.name;
	if (input.color !== undefined) patch.color = input.color;
	if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;
	return db.update(status).set(patch).where(eq(status.id, id)).returning().get();
}

export function deleteStatus(id: number): void {
	db.transaction((tx) => {
		tx.delete(diaryStatus).where(eq(diaryStatus.statusId, id)).run();
		tx.delete(status).where(eq(status.id, id)).run();
	});
}

/** 交换两个状态的 sort_order，用于上下移动排序。 */
export function swapStatusOrder(aId: number, bId: number): void {
	const a = getStatus(aId);
	const b = getStatus(bId);
	if (!a || !b) return;
	db.transaction((tx) => {
		tx.update(status).set({ sortOrder: b.sortOrder }).where(eq(status.id, a.id)).run();
		tx.update(status).set({ sortOrder: a.sortOrder }).where(eq(status.id, b.id)).run();
	});
}
