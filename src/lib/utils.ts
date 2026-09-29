import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** 把 0-255 的 hsl 色值转为可读前景色，用于状态标签文字。 */
export function readableTextColor(hex: string): string {
	const normalized = hex.replace('#', '');
	const full =
		normalized.length === 3
			? normalized
					.split('')
					.map((c) => c + c)
					.join('')
			: normalized;
	const r = parseInt(full.slice(0, 2), 16) || 0;
	const g = parseInt(full.slice(2, 4), 16) || 0;
	const b = parseInt(full.slice(4, 6), 16) || 0;
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6 ? '#0f172a' : '#ffffff';
}
