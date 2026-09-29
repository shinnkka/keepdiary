<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import DateSelect from '$lib/components/ui/DateSelect.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const maxDays = $derived(Math.max(1, ...data.counts.map((c) => c.days)));
</script>

<svelte:head><title>统计 · Keep Diary</title></svelte:head>

<h1 class="mb-4 text-xl font-semibold text-ink-900">统计</h1>

<Card class="mb-4 p-4">
	<form method="GET" class="flex flex-wrap items-end gap-3">
		<div>
			<span class="mb-1 block text-xs text-ink-500">开始</span>
			<DateSelect name="from" value={data.from} />
		</div>
		<div>
			<span class="mb-1 block text-xs text-ink-500">结束</span>
			<DateSelect name="to" value={data.to} />
		</div>
		<Button type="submit">查询</Button>
	</form>
</Card>

<Card class="mb-4 p-4">
	<h2 class="mb-3 text-sm font-semibold text-ink-700">状态天数（{data.from} ～ {data.to}）</h2>
	{#if data.counts.length === 0}
		<p class="text-sm text-ink-500">还没有状态数据。</p>
	{:else}
		<div class="space-y-3">
			{#each data.counts as item (item.id)}
				<div>
					<div class="mb-1 flex items-center justify-between text-sm">
						<span class="flex items-center gap-2">
							<span class="h-3 w-3 rounded-full" style="background:{item.color}"></span>
							{item.name}
						</span>
						<span class="text-ink-500">{item.days} 天</span>
					</div>
					<div class="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
						<div
							class="h-full rounded-full"
							style="width: {(item.days / maxDays) * 100}%; background: {item.color}"
						></div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Card>

<Card class="overflow-x-auto p-4">
	<h2 class="mb-3 text-sm font-semibold text-ink-700">日期概览（{data.from} ～ {data.to}）</h2>
	<div class="inline-block min-w-full">
		<div class="mb-1 flex text-[10px] text-ink-400">
			{#each data.overview.monthLabels as label (label.year * 12 + label.month)}
				<span class="inline-block shrink-0" style="width: {label.span * 15}px">
					{label.month}月
				</span>
			{/each}
		</div>
		<div class="flex gap-[2px]">
			{#each data.overview.weeks as week, wi (wi)}
				<div class="flex flex-col gap-[2px]">
					{#each week as cell (cell.date)}
						{#if !cell.inRange}
							<div class="h-[13px] w-[13px]"></div>
						{:else}
							<div
								class="flex h-[13px] w-[13px] flex-col overflow-hidden rounded-[3px] {cell.count ===
								0
									? 'bg-ink-100'
									: ''}"
								title="{cell.date} {cell.count > 0 ? cell.names.join('、') : '无状态'}"
							>
								{#each cell.colors.slice(0, 3) as color, ci (ci)}
									<div class="w-full flex-1" style="background:{color}"></div>
								{/each}
							</div>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	</div>
</Card>
