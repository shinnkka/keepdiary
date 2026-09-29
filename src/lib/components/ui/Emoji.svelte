<script lang="ts">
	import { asset } from '$app/paths';
	import { cn } from '$lib/utils';

	let {
		emoji,
		size = 16,
		label = '',
		class: className = ''
	}: {
		emoji: string;
		/** 像素尺寸，宽高一致 */
		size?: number;
		/** 无障碍文本；省略时视为纯装饰 */
		label?: string;
		class?: string;
	} = $props();

	/** emoji -> Twemoji 文件名：小写十六进制码点，用 `-` 连接，去掉变体选择符。 */
	function toCodePoints(input: string): string {
		const points: string[] = [];
		for (const char of input) {
			const cp = char.codePointAt(0);
			if (cp === undefined) continue;
			if (cp === 0xfe0f || cp === 0xfe0e) continue;
			points.push(cp.toString(16));
		}
		return points.join('-');
	}

	const src = $derived(asset(`/twemoji/${toCodePoints(emoji)}.svg`));
</script>

<img
	{src}
	width={size}
	height={size}
	alt={label}
	draggable="false"
	class={cn('inline-block shrink-0 select-none align-[-0.125em]', className)}
/>
