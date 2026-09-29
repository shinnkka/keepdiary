<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { resolve } from '$app/paths';
</script>

<svelte:head><title>设置 · Keep Diary</title></svelte:head>

<h1 class="mb-4 text-xl font-semibold text-ink-900">设置</h1>

<div class="grid gap-4 sm:grid-cols-2">
	<a href={resolve('/settings/status')}>
		<Card class="p-5 transition-colors hover:border-blue-300 hover:bg-blue-50">
			<h2 class="font-medium text-ink-900">状态管理</h2>
			<p class="mt-1 text-sm text-ink-500">创建、编辑、排序状态标签与颜色。</p>
		</Card>
	</a>
	<a href={resolve('/settings/events')}>
		<Card class="p-5 transition-colors hover:border-blue-300 hover:bg-blue-50">
			<h2 class="font-medium text-ink-900">特殊日期</h2>
			<p class="mt-1 text-sm text-ink-500">生日、纪念日等，可每年重复。</p>
		</Card>
	</a>
</div>
