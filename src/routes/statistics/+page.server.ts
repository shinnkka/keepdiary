import { fromDateKey, isValidDateKey, toDateKey, todayKey } from '$lib/calendar';
import { getDiarySummaries } from '$lib/server/diary';
import { statusDayCounts } from '$lib/server/stats';

function resolveRange(url: URL) {
	const today = todayKey();
	const year = today.slice(0, 4);
	let from = url.searchParams.get('from') ?? `${year}-01-01`;
	let to = url.searchParams.get('to') ?? today;
	if (!isValidDateKey(from)) from = `${year}-01-01`;
	if (!isValidDateKey(to)) to = today;
	if (from > to) [from, to] = [to, from];
	return { from, to };
}

/** 把日期对齐到所在周的周一。 */
function startOfWeek(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
}

/**
 * 按划定的日期范围生成概览网格（周一开头，按周分列）。
 * 范围之外的补位格子不显示颜色。
 */
function buildRangeOverview(from: string, to: string) {
	const summaries = getDiarySummaries(from, to);
	const fromDate = fromDateKey(from);
	const toDate = fromDateKey(to);
	const gridStart = startOfWeek(fromDate);
	const gridEnd = new Date(
		toDate.getFullYear(),
		toDate.getMonth(),
		toDate.getDate() + (6 - ((toDate.getDay() + 6) % 7))
	);
	const weekCount = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000 / 7) + 1;

	const weeks: {
		date: string;
		inRange: boolean;
		count: number;
		names: string[];
		colors: string[];
	}[][] = [];

	let cursor = new Date(gridStart);
	for (let w = 0; w < weekCount; w++) {
		const week = [];
		for (let d = 0; d < 7; d++) {
			const key = toDateKey(cursor);
			const inRange = key >= from && key <= to;
			const statuses = inRange ? (summaries.get(key)?.statuses ?? []) : [];
			week.push({
				date: key,
				inRange,
				count: statuses.length,
				names: statuses.map((s) => s.name),
				colors: statuses.map((s) => s.color)
			});
			cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
		}
		weeks.push(week);
	}

	// 范围内每个月份所在列，用于月份标签
	const monthLabels: { year: number; month: number; column: number; span: number }[] = [];
	let year = fromDate.getFullYear();
	let month = fromDate.getMonth();
	const endYear = toDate.getFullYear();
	const endMonth = toDate.getMonth();
	while (year < endYear || (year === endYear && month <= endMonth)) {
		const monthStart = new Date(year, month, 1);
		const effective = monthStart < fromDate ? fromDate : monthStart;
		const diffDays = Math.round((effective.getTime() - gridStart.getTime()) / 86400000);
		monthLabels.push({ year, month: month + 1, column: Math.floor(diffDays / 7), span: 0 });
		month++;
		if (month > 11) {
			month = 0;
			year++;
		}
	}
	for (let i = 0; i < monthLabels.length; i++) {
		const next = i === monthLabels.length - 1 ? weekCount : monthLabels[i + 1].column;
		monthLabels[i].span = Math.max(1, next - monthLabels[i].column);
	}

	return { weeks, monthLabels, from, to };
}

export function load({ url }: { url: URL }) {
	const { from, to } = resolveRange(url);
	const counts = statusDayCounts(from, to);
	const overview = buildRangeOverview(from, to);
	return { from, to, counts, overview };
}
