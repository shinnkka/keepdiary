import { asc, eq } from 'drizzle-orm';
import { db } from './db';
import { customEvent, type CustomEventRow } from './db/schema';

export function listEvents(): CustomEventRow[] {
	return db.select().from(customEvent).orderBy(asc(customEvent.date), asc(customEvent.id)).all();
}

export function getEvent(id: number): CustomEventRow | undefined {
	return db.select().from(customEvent).where(eq(customEvent.id, id)).get();
}

export interface EventInput {
	date: string;
	title: string;
	description: string | null;
	color: string | null;
	repeatRule: 'none' | 'yearly';
}

export function createEvent(input: EventInput): CustomEventRow {
	return db.insert(customEvent).values(input).returning().get();
}

export function updateEvent(id: number, input: EventInput): CustomEventRow | undefined {
	return db
		.update(customEvent)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(customEvent.id, id))
		.returning()
		.get();
}

export function deleteEvent(id: number): void {
	db.delete(customEvent).where(eq(customEvent.id, id)).run();
}

/** 把重复规则展开到 [start, end] 区间内的具体日期。 */
export function eventsInRange(start: string, end: string): Map<string, CustomEventRow[]> {
	const startYear = Number(start.slice(0, 4));
	const endYear = Number(end.slice(0, 4));
	const map = new Map<string, CustomEventRow[]>();
	for (const event of listEvents()) {
		const add = (date: string) => {
			if (date < start || date > end) return;
			const list = map.get(date);
			if (list) list.push(event);
			else map.set(date, [event]);
		};
		if (event.repeatRule === 'yearly') {
			const mmdd = event.date.slice(5);
			for (let year = startYear; year <= endYear; year++) {
				add(`${year}-${mmdd}`);
			}
		} else {
			add(event.date);
		}
	}
	return map;
}
