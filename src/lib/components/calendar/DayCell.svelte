<script lang="ts">
	import type { CalendarDayDTO } from '$lib/types';
	import StatusBars from '$lib/components/status/StatusBars.svelte';
	import { resolve } from '$app/paths';

	let { day }: { day: CalendarDayDTO } = $props();

	const hasDiary = $derived(!!day.diary && (!!day.diary.title || day.diary.hasContent));
</script>

<a
	href={resolve('/diary/[date]', { date: day.date })}
	class="group relative flex min-h-24 flex-col gap-1 border border-ink-200 p-1.5 transition-colors hover:bg-blue-50 {day.inMonth
		? 'bg-white'
		: 'bg-ink-50 text-ink-400'}"
>
	<div class="flex items-start justify-between">
		<span
			class="flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold {day.isToday
				? 'bg-blue-600 text-white'
				: day.isWeekend && day.inMonth
					? 'text-red-500'
					: ''}"
		>
			{day.day}
		</span>
		<div class="flex items-center gap-1 pt-0.5">
			{#if hasDiary}
				<span class="h-1.5 w-1.5 rounded-full bg-ink-400" title="有日记"></span>
			{/if}
		</div>
	</div>

	<div
		class="text-[11px] leading-tight {day.solarTerm
			? 'text-emerald-600 font-medium'
			: 'text-ink-400'}"
	>
		{day.lunarText}
	</div>

	{#if day.events.length > 0}
		<div class="flex flex-col gap-0.5">
			{#each day.events.slice(0, 2) as ev (ev.id)}
				<div class="flex items-center gap-1 truncate text-[10px] leading-tight">
					<span class="h-1.5 w-1.5 shrink-0 rounded-full" style="background:{ev.color ?? '#64748b'}"
					></span>
					<span class="truncate" title={ev.title}>{ev.title}</span>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-auto">
		<StatusBars statuses={day.statuses} />
	</div>
</a>
