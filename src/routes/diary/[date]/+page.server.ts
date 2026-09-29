import { error } from '@sveltejs/kit';
import { formatCN, getLunarInfo, isValidDateKey } from '$lib/calendar';
import { getDiaryDetail } from '$lib/server/diary';

export function load({ params }: { params: { date: string } }) {
	const date = params.date;
	if (!isValidDateKey(date)) error(404, '无效的日期');

	return {
		date,
		dateLabel: formatCN(date),
		lunar: getLunarInfo(date),
		detail: getDiaryDetail(date)
	};
}
