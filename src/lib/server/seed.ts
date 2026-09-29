import { sql } from 'drizzle-orm';
import { db } from './db';
import { status } from './db/schema';

const DEFAULTS = [
	{ name: '开心', color: '#f59e0b' },
	{ name: '工作', color: '#3b82f6' },
	{ name: '运动', color: '#10b981' },
	{ name: '疲惫', color: '#8b5cf6' },
	{ name: '阅读', color: '#ec4899' }
];

let seeded = false;

/** 首次启动时写入几个默认状态，方便直接体验日历颜色条。 */
export function seed(): void {
	if (seeded) return;
	seeded = true;
	try {
		const count =
			db
				.select({ value: sql<number>`count(*)` })
				.from(status)
				.get()?.value ?? 0;
		if (count > 0) return;
		db.insert(status)
			.values(DEFAULTS.map((item, index) => ({ ...item, sortOrder: (index + 1) * 10 })))
			.run();
	} catch (err) {
		console.error('[seed] failed', err);
	}
}
