/** 应用内共享的前端类型 */

export interface StatusDTO {
	id: number;
	name: string;
	color: string;
	sortOrder: number;
}

export interface EventDTO {
	id: number;
	date: string;
	title: string;
	description: string | null;
	color: string | null;
	repeatRule: 'none' | 'yearly';
}

export interface DiarySummaryDTO {
	date: string;
	title: string | null;
	hasContent: boolean;
	statuses: StatusDTO[];
}

export interface CalendarDayDTO {
	/** YYYY-MM-DD */
	date: string;
	day: number;
	/** 是否属于当前月份（月历补位格子为 false） */
	inMonth: boolean;
	isToday: boolean;
	isWeekend: boolean;
	/** 农历显示文本，如 “八月十九”、节气或 “初一” */
	lunarText: string;
	solarTerm: string | null;
	statuses: StatusDTO[];
	events: EventDTO[];
	diary: { title: string | null; hasContent: boolean } | null;
}

export interface CalendarMonth {
	year: number;
	month: number;
	label: string;
	prev: string;
	next: string;
}
