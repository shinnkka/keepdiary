import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';

/**
 * 状态标签，可重复使用，本身不属于某一天。
 * 一天可以拥有多个状态（通过 diary_status 关联）。
 */
export const status = sqliteTable('status', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	color: text('color').notNull(),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date())
});

/**
 * 日记。date 唯一，一天最多一篇。
 * title / content 均可为空，因此可以存在“只有状态没有日记”的情况。
 */
export const diary = sqliteTable('diary', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	date: text('date').notNull().unique(),
	title: text('title'),
	content: text('content'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date())
});

/** Diary N <-> N Status 中间表 */
export const diaryStatus = sqliteTable(
	'diary_status',
	{
		diaryId: integer('diary_id')
			.notNull()
			.references(() => diary.id, { onDelete: 'cascade' }),
		statusId: integer('status_id')
			.notNull()
			.references(() => status.id, { onDelete: 'cascade' })
	},
	(t) => [
		primaryKey({ columns: [t.diaryId, t.statusId] }),
		index('diary_status_status_idx').on(t.statusId)
	]
);

/** 图片只保存 metadata，实际文件在 data/images/ */
export const image = sqliteTable(
	'image',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		diaryId: integer('diary_id')
			.notNull()
			.references(() => diary.id, { onDelete: 'cascade' }),
		path: text('path').notNull(),
		originalFilename: text('original_filename').notNull(),
		mimeType: text('mime_type').notNull(),
		width: integer('width'),
		height: integer('height'),
		size: integer('size').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(t) => [index('image_diary_idx').on(t.diaryId)]
);

/** 自定义特殊日期，独立于日记与状态。 */
export const customEvent = sqliteTable('custom_event', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	date: text('date').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	color: text('color'),
	/** 'none' 一次性 | 'yearly' 每年重复 */
	repeatRule: text('repeat_rule', { enum: ['none', 'yearly'] })
		.notNull()
		.default('none'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date())
});

export type StatusRow = typeof status.$inferSelect;
export type DiaryRow = typeof diary.$inferSelect;
export type ImageRow = typeof image.$inferSelect;
export type CustomEventRow = typeof customEvent.$inferSelect;
