<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>状态管理 · Keep Diary</title></svelte:head>

<div class="mb-4 flex items-center justify-between">
	<h1 class="text-xl font-semibold text-ink-900">状态管理</h1>
	<a href={resolve('/settings')}><Button variant="ghost" size="sm">← 设置</Button></a>
</div>

{#if form?.message}
	<p class="mb-3 text-sm {form.success ? 'text-emerald-600' : 'text-red-600'}">{form.message}</p>
{/if}

<Card class="mb-4 p-4">
	<h2 class="mb-3 text-sm font-semibold text-ink-700">新增状态</h2>
	<form method="POST" action="?/create" class="flex flex-wrap items-end gap-2">
		<div>
			<label class="mb-1 block text-xs text-ink-500" for="new-name">名称</label>
			<Input id="new-name" name="name" placeholder="例如：阅读" required class="w-40" />
		</div>
		<div>
			<label class="mb-1 block text-xs text-ink-500" for="new-color">颜色</label>
			<input
				id="new-color"
				type="color"
				name="color"
				value="#3b82f6"
				class="h-9 w-16 cursor-pointer rounded-md border border-ink-300 bg-white"
			/>
		</div>
		<Button type="submit">添加</Button>
	</form>
</Card>

<Card class="divide-y divide-ink-200">
	{#each data.statuses as status, i (status.id)}
		<div class="flex flex-wrap items-center gap-2 p-3">
			<div class="flex flex-col">
				<form method="POST" action="?/move">
					<input type="hidden" name="id" value={status.id} />
					<input type="hidden" name="direction" value="up" />
					<button
						type="submit"
						disabled={i === 0}
						class="px-1 text-xs text-ink-400 hover:text-ink-700 disabled:opacity-30">▲</button
					>
				</form>
				<form method="POST" action="?/move">
					<input type="hidden" name="id" value={status.id} />
					<input type="hidden" name="direction" value="down" />
					<button
						type="submit"
						disabled={i === data.statuses.length - 1}
						class="px-1 text-xs text-ink-400 hover:text-ink-700 disabled:opacity-30">▼</button
					>
				</form>
			</div>

			<form method="POST" action="?/update" class="flex flex-1 flex-wrap items-center gap-2">
				<input type="hidden" name="id" value={status.id} />
				<span class="h-4 w-4 rounded-full" style="background:{status.color}"></span>
				<Input name="name" value={status.name} required class="w-36" />
				<input
					type="color"
					name="color"
					value={status.color}
					class="h-9 w-16 cursor-pointer rounded-md border border-ink-300 bg-white"
				/>
				<Button type="submit" variant="outline" size="sm">保存</Button>
			</form>

			<form method="POST" action="?/delete">
				<input type="hidden" name="id" value={status.id} />
				<Button type="submit" variant="danger" size="sm">删除</Button>
			</form>
		</div>
	{:else}
		<p class="p-4 text-sm text-ink-500">还没有状态。</p>
	{/each}
</Card>
