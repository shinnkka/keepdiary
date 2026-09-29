<script lang="ts">
	import { untrack } from 'svelte';
	import { cn } from '$lib/utils';

	/**
	 * 显式的 年 / 月 / 日 选择器。
	 * 原生 <input type="date"> 的分段顺序由浏览器 / 系统语言决定，
	 * 有的浏览器在选完年后会直接跳到日，这里改为固定「年 → 月 → 日」。
	 */
	let {
		value = '',
		name = '',
		minYear = 2000,
		maxYear = new Date().getFullYear() + 1,
		class: className = ''
	}: {
		value?: string;
		name?: string;
		minYear?: number;
		maxYear?: number;
		class?: string;
	} = $props();

	function parse(input: string) {
		const [y, m, d] = (input || '').split('-').map(Number);
		if (!y || !m || !d || m < 1 || m > 12) return null;
		return { year: y, month: m, day: d };
	}

	const fallback = untrack(() => {
		const now = new Date();
		return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
	});
	const start = parse(untrack(() => value)) ?? fallback;

	let year = $state(start.year);
	let month = $state(start.month);
	let day = $state(start.day);

	const years = $derived.by(() => {
		const list: number[] = [];
		for (let y = maxYear; y >= minYear; y--) list.push(y);
		return list;
	});
	const months = $derived(Array.from({ length: 12 }, (_, i) => i + 1));
	const daysInMonth = $derived(new Date(year, month, 0).getDate());
	const days = $derived(Array.from({ length: daysInMonth }, (_, i) => i + 1));

	const iso = $derived(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

	// 外部 value 变化（例如查询后 URL 更新）时同步回显；不依赖内部的年月日，避免互相覆盖。
	$effect(() => {
		const next = value;
		untrack(() => {
			const parsed = parse(next);
			if (!parsed) return;
			year = parsed.year;
			month = parsed.month;
			day = Math.min(parsed.day, new Date(parsed.year, parsed.month, 0).getDate());
		});
	});

	function clampDay() {
		if (day > daysInMonth) day = daysInMonth;
	}

	const selectClass =
		'h-9 rounded-md border border-ink-300 bg-white px-2 text-sm text-ink-800 focus:border-blue-500 focus:outline-none';
</script>

<div class={cn('flex items-center gap-1', className)}>
	<select class={cn(selectClass, 'w-24')} bind:value={year} onchange={clampDay} aria-label="年">
		{#each years as y (y)}
			<option value={y}>{y} 年</option>
		{/each}
	</select>
	<select class={cn(selectClass, 'w-20')} bind:value={month} onchange={clampDay} aria-label="月">
		{#each months as m (m)}
			<option value={m}>{m} 月</option>
		{/each}
	</select>
	<select class={cn(selectClass, 'w-20')} bind:value={day} aria-label="日">
		{#each days as d (d)}
			<option value={d}>{d} 日</option>
		{/each}
	</select>
	<input type="hidden" {name} value={iso} />
</div>
