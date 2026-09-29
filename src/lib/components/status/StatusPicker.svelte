<script lang="ts">
	import type { StatusDTO } from '$lib/types';
	import { resolve } from '$app/paths';

	let {
		statuses = [],
		selected = $bindable<number[]>([])
	}: { statuses: StatusDTO[]; selected: number[] } = $props();

	function toggle(id: number, checked: boolean) {
		if (checked) {
			if (!selected.includes(id)) selected = [...selected, id];
		} else {
			selected = selected.filter((value) => value !== id);
		}
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each statuses as s (s.id)}
		<label
			class="cursor-pointer select-none rounded-full border bg-white px-3 py-1 text-sm transition-all has-[:checked]:font-medium has-[:checked]:shadow-sm has-[:checked]:ring-2 has-[:checked]:ring-offset-1"
			style="border-color: {s.color}; color: {s.color}; --tw-ring-color: {s.color};"
		>
			<input
				type="checkbox"
				name="statusIds"
				value={s.id}
				checked={selected.includes(s.id)}
				onchange={(event) => toggle(s.id, event.currentTarget.checked)}
				class="sr-only"
			/>
			{s.name}
		</label>
	{/each}
	{#if statuses.length === 0}
		<p class="text-sm text-ink-500">
			还没有状态，去 <a class="text-blue-600 underline" href={resolve('/settings/status')}>设置</a> 添加。
		</p>
	{/if}
</div>
