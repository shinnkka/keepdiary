import { Solar } from 'lunar-typescript';

export interface LunarInfo {
	/** 农历月，闰月为负数 */
	month: number;
	/** 农历日 */
	day: number;
	/** 闰月标记 */
	isLeap: boolean;
	monthName: string;
	dayName: string;
	/** 完整农历，如 “八月十九” */
	text: string;
	/** 当天节气，没有则为 null */
	solarTerm: string | null;
}

const cache = new Map<string, LunarInfo>();

/**
 * 由公历日期计算农历与节气。
 * 公历/农历/节气全部由日期计算得出，不存数据库。
 */
export function getLunarInfo(dateKey: string): LunarInfo {
	const cached = cache.get(dateKey);
	if (cached) return cached;

	const [y, m, d] = dateKey.split('-').map(Number);
	const solar = Solar.fromYmd(y, m, d);
	const lunar = solar.getLunar();
	const jieQi = lunar.getJieQi();

	const info: LunarInfo = {
		month: lunar.getMonth(),
		day: lunar.getDay(),
		isLeap: lunar.getMonth() < 0,
		monthName: `${lunar.getMonthInChinese()}月`,
		dayName: lunar.getDayInChinese(),
		text: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
		solarTerm: jieQi ? jieQi : null
	};

	cache.set(dateKey, info);
	return info;
}

/** 日历格子上的次要文本：节气 > 初一（显示月份） > 农历日 */
export function getLunarLabel(info: LunarInfo): string {
	if (info.solarTerm) return info.solarTerm;
	if (info.day === 1) return `${info.isLeap ? '闰' : ''}${info.monthName}`;
	return info.dayName;
}
