<script lang="ts">
	import type { CalendarDayDTO } from '$lib/types';
	import { WEEKDAYS } from '$lib/calendar/calendar';
	import DayCell from './DayCell.svelte';

	let { days }: { days: CalendarDayDTO[] } = $props();
</script>

<div class="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
	<div class="grid grid-cols-7 border-b border-ink-200 bg-ink-50">
		{#each WEEKDAYS as label, i (label)}
			<div class="py-2 text-center text-xs font-medium {i >= 5 ? 'text-red-500' : 'text-ink-500'}">
				{label}
			</div>
		{/each}
	</div>
	<div class="grid grid-cols-7 gap-px bg-ink-200">
		{#each days as day (day.date)}
			<DayCell {day} />
		{/each}
	</div>
	<div
		class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink-200 px-3 py-2 text-xs text-ink-500"
	></div>
</div>
