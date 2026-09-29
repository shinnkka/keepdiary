import {
	fromDateKey,
	getLunarInfo,
	getLunarLabel,
	monthGrid,
	monthKey,
	monthLabel,
	parseMonthParam,
	shiftMonth,
	todayKey
} from '$lib/calendar/index';
import { getDiarySummaries } from '$lib/server/diary';
import { eventsInRange } from '$lib/server/events';
import type { CalendarDayDTO } from '$lib/types';

export function load({ url }: { url: URL }) {
	const ref = parseMonthParam(url.searchParams.get('month'));
	const cells = monthGrid(ref);
	const start = cells[0].date;
	const end = cells[cells.length - 1].date;

	const summaries = getDiarySummaries(start, end);
	const events = eventsInRange(start, end);
	const today = todayKey();

	const days: CalendarDayDTO[] = cells.map((cell) => {
		const lunar = getLunarInfo(cell.date);
		const summary = summaries.get(cell.date);
		const dow = fromDateKey(cell.date).getDay();
		return {
			date: cell.date,
			day: cell.day,
			inMonth: cell.inMonth,
			isToday: cell.date === today,
			isWeekend: dow === 0 || dow === 6,
			lunarText: getLunarLabel(lunar),
			solarTerm: lunar.solarTerm,
			statuses: (summary?.statuses ?? []).map((s) => ({
				id: s.id,
				name: s.name,
				color: s.color,
				sortOrder: s.sortOrder
			})),
			events: events.get(cell.date) ?? [],
			diary: summary
				? {
						title: summary.title,
						hasContent: summary.hasContent
					}
				: null
		};
	});

	return {
		days,
		today,
		month: {
			year: ref.year,
			month: ref.month,
			label: monthLabel(ref),
			current: monthKey(ref),
			prev: monthKey(shiftMonth(ref, -1)),
			next: monthKey(shiftMonth(ref, 1))
		}
	};
}
