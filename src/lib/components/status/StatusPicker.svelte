<script lang="ts">
	import type { StatusDTO } from '$lib/types';
	import { resolve } from '$app/paths';

	let { statuses = [], selected = [] }: { statuses: StatusDTO[]; selected: (number | string)[] } =
		$props();

	const selectedIds = $derived(selected.map((id) => Number(id)));
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
				checked={selectedIds.includes(s.id)}
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
