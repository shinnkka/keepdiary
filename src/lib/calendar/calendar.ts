/** 纯日期的字符串工具，避免时区问题，全部使用本地时间。 */

export function toDateKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
	const [y, m, d] = key.split('-').map(Number);
	return new Date(y, m - 1, d);
}

export function todayKey(): string {
	return toDateKey(new Date());
}

export function isValidDateKey(key: string | null | undefined): key is string {
	if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
	const [y, m, d] = key.split('-').map(Number);
	if (m < 1 || m > 12 || d < 1 || d > 31) return false;
	const date = new Date(y, m - 1, d);
	return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export interface MonthRef {
	year: number;
	month: number; // 1-12
}

export function parseMonthParam(value: string | null | undefined): MonthRef {
	if (value && /^\d{4}-\d{2}$/.test(value)) {
		const [year, month] = value.split('-').map(Number);
		if (month >= 1 && month <= 12) return { year, month };
	}
	const now = new Date();
	return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthKey(ref: MonthRef): string {
	return `${ref.year}-${String(ref.month).padStart(2, '0')}`;
}

export function shiftMonth(ref: MonthRef, delta: number): MonthRef {
	const date = new Date(ref.year, ref.month - 1 + delta, 1);
	return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function daysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

export function monthRange(ref: MonthRef): { start: string; end: string } {
	const start = `${monthKey(ref)}-01`;
	const end = `${monthKey(ref)}-${String(daysInMonth(ref.year, ref.month)).padStart(2, '0')}`;
	return { start, end };
}

/**
 * 生成月历格子（周一为第一列）。
 * 返回至少覆盖整月的 6*7 或 5*7 个日期。
 */
export function monthGrid(ref: MonthRef): { date: string; day: number; inMonth: boolean }[] {
	const first = new Date(ref.year, ref.month - 1, 1);
	// JS: 0 = Sunday，这里转换成周一为 0
	const offset = (first.getDay() + 6) % 7;
	const cells: { date: string; day: number; inMonth: boolean }[] = [];
	const total = daysInMonth(ref.year, ref.month);
	const totalCells = Math.ceil((offset + total) / 7) * 7;

	for (let i = 0; i < totalCells; i++) {
		const date = new Date(ref.year, ref.month - 1, 1 - offset + i);
		cells.push({
			date: toDateKey(date),
			day: date.getDate(),
			inMonth: date.getMonth() === ref.month - 1
		});
	}
	return cells;
}

export const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export function formatCN(dateKey: string): string {
	const [y, m, d] = dateKey.split('-').map(Number);
	return `${y} 年 ${m} 月 ${d} 日`;
}

export function monthLabel(ref: MonthRef): string {
	return `${ref.year} 年 ${ref.month} 月`;
}

/** 在日期字符串上加减天数。 */
export function shiftDate(dateKey: string, delta: number): string {
	const date = fromDateKey(dateKey);
	return toDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta));
}

/** 两个日期之间的所有日期（含端点），字符串比较即可。 */
export function eachDate(start: string, end: string): string[] {
	const dates: string[] = [];
	let cursor = fromDateKey(start);
	const last = fromDateKey(end);
	if (cursor > last) return dates;
	while (cursor <= last) {
		dates.push(toDateKey(cursor));
		cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
	}
	return dates;
}
