import { and, asc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { db } from './db';
import { diary, diaryStatus, image, status } from './db/schema';
import type { DiaryRow, StatusRow } from './db/schema';
import { deleteImageFile } from './images';

export interface DiaryDetail {
	date: string;
	title: string | null;
	content: string | null;
	statuses: StatusRow[];
	images: {
		id: number;
		url: string;
		originalFilename: string;
		mimeType: string;
		width: number | null;
		height: number | null;
		size: number;
	}[];
}

export function getDiaryRow(date: string): DiaryRow | undefined {
	return db.select().from(diary).where(eq(diary.date, date)).get();
}

export function getDiaryDetail(date: string): DiaryDetail {
	const row = getDiaryRow(date);
	if (!row) {
		return { date, title: null, content: null, statuses: [], images: [] };
	}
	const statuses = db
		.select({
			id: status.id,
			name: status.name,
			color: status.color,
			sortOrder: status.sortOrder,
			createdAt: status.createdAt,
			updatedAt: status.updatedAt
		})
		.from(diaryStatus)
		.innerJoin(status, eq(status.id, diaryStatus.statusId))
		.where(eq(diaryStatus.diaryId, row.id))
		.orderBy(asc(status.sortOrder), asc(status.id))
		.all();

	const images = db
		.select()
		.from(image)
		.where(eq(image.diaryId, row.id))
		.orderBy(asc(image.id))
		.all()
		.map((img) => ({
			id: img.id,
			url: `/images/${img.id}`,
			originalFilename: img.originalFilename,
			mimeType: img.mimeType,
			width: img.width,
			height: img.height,
			size: img.size
		}));

	return { date, title: row.title, content: row.content, statuses, images };
}

/** 确保某天存在 diary 行（即使没有标题和正文），用于挂载状态与图片。 */
export function ensureDiary(date: string): DiaryRow {
	const existing = getDiaryRow(date);
	if (existing) return existing;
	return db.insert(diary).values({ date }).returning().get();
}

export function saveDiary(input: {
	date: string;
	title: string | null;
	content: string | null;
	statusIds: number[];
}): DiaryRow {
	const { date, title, content, statusIds } = input;
	const row = db.transaction((tx) => {
		const existing = tx.select().from(diary).where(eq(diary.date, date)).get();
		const saved = existing
			? tx
					.update(diary)
					.set({ title, content, updatedAt: new Date() })
					.where(eq(diary.id, existing.id))
					.returning()
					.get()
			: tx.insert(diary).values({ date, title, content }).returning().get();

		tx.delete(diaryStatus).where(eq(diaryStatus.diaryId, saved.id)).run();

		if (statusIds.length > 0) {
			const valid = tx
				.select({ id: status.id })
				.from(status)
				.where(inArray(status.id, statusIds))
				.all()
				.map((s) => s.id);
			const unique = [...new Set(valid)];
			if (unique.length > 0) {
				tx.insert(diaryStatus)
					.values(unique.map((statusId) => ({ diaryId: saved.id, statusId })))
					.run();
			}
		}

		// 如果一天既没有内容、没有状态、也没有图片，则删除空日记行
		if (!title && !content && statusIds.length === 0) {
			const imageCount =
				tx
					.select({ value: sql<number>`count(*)` })
					.from(image)
					.where(eq(image.diaryId, saved.id))
					.get()?.value ?? 0;
			if (imageCount === 0) {
				tx.delete(diary).where(eq(diary.id, saved.id)).run();
			}
		}

		return saved;
	});
	return row;
}

/** 删除某天的日记，包括状态关联、图片记录与实际图片文件。 */
export function deleteDiary(date: string): boolean {
	const row = getDiaryRow(date);
	if (!row) return false;
	const images = db.select().from(image).where(eq(image.diaryId, row.id)).all();
	for (const img of images) deleteImageFile(img.path);
	db.delete(diary).where(eq(diary.id, row.id)).run();
	return true;
}

export interface DiarySummary {
	date: string;
	title: string | null;
	hasContent: boolean;
	statuses: StatusRow[];
}

/** 日历与概览用：一次取出时间范围内的日记摘要与状态。 */
export function getDiarySummaries(start: string, end: string): Map<string, DiarySummary> {
	const rows = db
		.select({ date: diary.date, title: diary.title, content: diary.content })
		.from(diary)
		.where(and(gte(diary.date, start), lte(diary.date, end)))
		.all();

	const result = new Map<string, DiarySummary>();
	for (const row of rows) {
		result.set(row.date, {
			date: row.date,
			title: row.title,
			hasContent: !!(row.content && row.content.trim().length > 0),
			statuses: []
		});
	}

	const statusRows = db
		.select({
			date: diary.date,
			id: status.id,
			name: status.name,
			color: status.color,
			sortOrder: status.sortOrder
		})
		.from(diary)
		.innerJoin(diaryStatus, eq(diaryStatus.diaryId, diary.id))
		.innerJoin(status, eq(status.id, diaryStatus.statusId))
		.where(and(gte(diary.date, start), lte(diary.date, end)))
		.orderBy(asc(status.sortOrder), asc(status.id))
		.all();

	for (const row of statusRows) {
		const summary = result.get(row.date);
		if (summary) {
			summary.statuses.push({
				id: row.id,
				name: row.name,
				color: row.color,
				sortOrder: row.sortOrder,
				createdAt: new Date(0),
				updatedAt: new Date(0)
			});
		}
	}

	return result;
}
