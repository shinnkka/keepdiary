<script lang="ts">
	import MonthCalendar from '$lib/components/calendar/MonthCalendar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.month.label} · Keep Diary</title></svelte:head>

<div class="mb-4 flex items-center justify-between">
	<div class="flex items-center gap-2">
		<a href={resolve(`/?month=${data.month.prev}` as '/')} aria-label="上个月">
			<Button variant="outline" size="icon">‹</Button>
		</a>
		<h1 class="min-w-36 text-center text-xl font-semibold text-ink-900">{data.month.label}</h1>
		<a href={resolve(`/?month=${data.month.next}` as '/')} aria-label="下个月">
			<Button variant="outline" size="icon">›</Button>
		</a>
	</div>
	<a href={resolve('/')}><Button variant="secondary">回到本月</Button></a>
</div>

<MonthCalendar days={data.days} />
