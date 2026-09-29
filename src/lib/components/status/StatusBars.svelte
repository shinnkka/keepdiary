<script lang="ts">
	import type { StatusDTO } from '$lib/types';

	let { statuses = [], max = 3 }: { statuses: StatusDTO[]; max?: number } = $props();

	const shown = $derived(statuses.slice(0, max));
	const extra = $derived(Math.max(0, statuses.length - max));
</script>

<div class="flex flex-col gap-[3px]">
	{#each shown as s (s.id)}
		<div class="h-1.5 w-full rounded-full" style="background:{s.color}" title={s.name}></div>
	{/each}
	{#if extra > 0}
		<div class="text-[10px] leading-none text-ink-500">+{extra}</div>
	{/if}
</div>
