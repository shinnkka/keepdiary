<script lang="ts">
	import Markdown from '$lib/components/diary/Markdown.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { shiftDate } from '$lib/calendar';
	import { readableTextColor } from '$lib/utils';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const prevDate = $derived(shiftDate(data.date, -1));
	const nextDate = $derived(shiftDate(data.date, 1));
	const hasStatuses = $derived(data.detail.statuses.length > 0);
	const isEmpty = $derived(
		!data.detail.title &&
			!data.detail.content?.trim() &&
			!hasStatuses &&
			data.detail.images.length === 0
	);
</script>

<svelte:head><title>{data.date} · Keep Diary</title></svelte:head>

<nav class="mb-4 flex items-center justify-between">
	<div class="flex items-center gap-2">
		<a href={resolve('/')}><Button variant="ghost" size="sm">← 日历</Button></a>
		<a href={resolve('/diary/[date]', { date: prevDate })}>
			<Button variant="outline" size="sm">前一天</Button>
		</a>
		<a href={resolve('/diary/[date]', { date: nextDate })}>
			<Button variant="outline" size="sm">后一天</Button>
		</a>
	</div>
	<a href={resolve('/diary/[date]/edit', { date: data.date })}>
		<Button size="sm">编辑</Button>
	</a>
</nav>

<header class="mb-4">
	<h1 class="text-2xl font-semibold text-ink-900">{data.dateLabel}</h1>
	<p class="mt-1 text-sm text-ink-500">
		农历 {data.lunar.text}
		{#if data.lunar.solarTerm}· 节气 {data.lunar.solarTerm}{/if}
	</p>
</header>

{#if isEmpty}
	<Card class="p-10 text-center">
		<p class="text-sm text-ink-500">这一天还没有记录。</p>
		<a href={resolve('/diary/[date]/edit', { date: data.date })} class="mt-4 inline-block">
			<Button>写点什么</Button>
		</a>
	</Card>
{:else}
	<Card class="p-5">
		{#if hasStatuses}
			<div class="mb-3 flex flex-wrap gap-2">
				{#each data.detail.statuses as status (status.id)}
					<span
						class="rounded-full px-2.5 py-0.5 text-xs font-medium"
						style="background: {status.color}; color: {readableTextColor(status.color)}"
					>
						{status.name}
					</span>
				{/each}
			</div>
		{/if}

		{#if data.detail.title}
			<h2 class="mb-3 text-lg font-semibold text-ink-900">{data.detail.title}</h2>
		{/if}

		<Markdown content={data.detail.content ?? ''} />
	</Card>

	{#if data.detail.images.length > 0}
		<Card class="mt-4 p-4">
			<h2 class="mb-3 text-sm font-semibold text-ink-700">图片</h2>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{#each data.detail.images as image (image.id)}
					<figure class="overflow-hidden rounded-lg border border-ink-200">
						<img
							src={image.url}
							alt={image.originalFilename}
							class="h-36 w-full bg-ink-50 object-cover"
							loading="lazy"
						/>
					</figure>
				{/each}
			</div>
		</Card>
	{/if}
{/if}
