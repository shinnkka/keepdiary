import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from './db';
import { diary, diaryStatus, status } from './db/schema';

export interface StatusDayCount {
	id: number;
	name: string;
	color: string;
	sortOrder: number;
	/** 该状态在时间范围内覆盖了多少天 */
	days: number;
}

/**
 * 统计每个状态在时间范围内被应用于多少天（去重到日期）。
 * 一天多个状态则各自 +1，而不是状态总数 +1。
 */
export function statusDayCounts(start: string, end: string): StatusDayCount[] {
	return db
		.select({
			id: status.id,
			name: status.name,
			color: status.color,
			sortOrder: status.sortOrder,
			days: sql<number>`count(distinct ${diary.date})`
		})
		.from(status)
		.leftJoin(diaryStatus, eq(diaryStatus.statusId, status.id))
		.leftJoin(
			diary,
			and(eq(diary.id, diaryStatus.diaryId), gte(diary.date, start), lte(diary.date, end))
		)
		.groupBy(status.id)
		.orderBy(desc(sql`count(distinct ${diary.date})`), status.sortOrder)
		.all();
}
