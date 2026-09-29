<script lang="ts">
	import { todayKey } from '$lib/calendar';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const today = todayKey();
</script>

<svelte:head><title>特殊日期 · Keep Diary</title></svelte:head>

<div class="mb-4 flex items-center justify-between">
	<h1 class="text-xl font-semibold text-ink-900">特殊日期</h1>
	<a href={resolve('/settings')}><Button variant="ghost" size="sm">← 设置</Button></a>
</div>

{#if form?.message}
	<p class="mb-3 text-sm {form.success ? 'text-emerald-600' : 'text-red-600'}">{form.message}</p>
{/if}

<Card class="mb-4 p-4">
	<h2 class="mb-3 text-sm font-semibold text-ink-700">新增特殊日期</h2>
	<form method="POST" action="?/create" class="flex flex-wrap items-end gap-2">
		<div>
			<label class="mb-1 block text-xs text-ink-500" for="date">日期</label>
			<Input id="date" name="date" type="date" value={today} required class="w-40" />
		</div>
		<div>
			<label class="mb-1 block text-xs text-ink-500" for="title">名称</label>
			<Input id="title" name="title" placeholder="例如：生日" required class="w-40" />
		</div>
		<div>
			<label class="mb-1 block text-xs text-ink-500" for="repeatRule">重复</label>
			<select
				id="repeatRule"
				name="repeatRule"
				class="h-9 rounded-md border border-ink-300 bg-white px-2 text-sm"
			>
				<option value="none">一次性</option>
				<option value="yearly">每年重复</option>
			</select>
		</div>
		<div>
			<label class="mb-1 block text-xs text-ink-500" for="color">颜色</label>
			<input
				id="color"
				type="color"
				name="color"
				value="#ef4444"
				class="h-9 w-16 cursor-pointer rounded-md border border-ink-300 bg-white"
			/>
		</div>
		<div class="flex-1">
			<label class="mb-1 block text-xs text-ink-500" for="description">描述</label>
			<Input id="description" name="description" placeholder="可选" />
		</div>
		<Button type="submit">添加</Button>
	</form>
</Card>

<Card class="divide-y divide-ink-200">
	{#each data.events as event (event.id)}
		<div class="flex flex-wrap items-center gap-2 p-3">
			<form method="POST" action="?/update" class="flex flex-1 flex-wrap items-center gap-2">
				<input type="hidden" name="id" value={event.id} />
				<span class="h-4 w-4 rounded-full" style="background:{event.color ?? '#64748b'}"></span>
				<Input name="date" type="date" value={event.date} required class="w-40" />
				<Input name="title" value={event.title} required class="w-36" />
				<select
					name="repeatRule"
					value={event.repeatRule}
					class="h-9 rounded-md border border-ink-300 bg-white px-2 text-sm"
				>
					<option value="none">一次性</option>
					<option value="yearly">每年重复</option>
				</select>
				<input
					type="color"
					name="color"
					value={event.color ?? '#64748b'}
					class="h-9 w-16 cursor-pointer rounded-md border border-ink-300 bg-white"
				/>
				<Input
					name="description"
					value={event.description ?? ''}
					placeholder="描述"
					class="flex-1"
				/>
				<Button type="submit" variant="outline" size="sm">保存</Button>
			</form>
			<form method="POST" action="?/delete">
				<input type="hidden" name="id" value={event.id} />
				<Button type="submit" variant="danger" size="sm">删除</Button>
			</form>
		</div>
	{/each}
	{#if data.events.length === 0}
		<p class="p-4 text-sm text-ink-500">还没有特殊日期。</p>
	{/if}
</Card>
