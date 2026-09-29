<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import StatusPicker from '$lib/components/status/StatusPicker.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// 本地状态：提交（保存 / 上传图片等）后不会被服务端数据覆盖，避免输入框被清空。
	// 这里只取初始值，因此用 untrack 包裹。
	let title = $state(untrack(() => data.detail.title ?? ''));
	let content = $state(untrack(() => data.detail.content ?? ''));
	let selected = $state<number[]>(untrack(() => data.detail.statuses.map((s) => s.id)));

	/** 提交后不重置表单，避免未保存的输入被清空。 */
	const keepInput: SubmitFunction =
		() =>
		async ({ update }) => {
			await update({ reset: false });
		};
</script>

<svelte:head><title>编辑 {data.date} · Keep Diary</title></svelte:head>

<nav class="mb-4 flex items-center justify-between">
	<a href={resolve('/diary/[date]', { date: data.date })}>
		<Button variant="ghost" size="sm">← 返回浏览</Button>
	</a>
	{#if form?.message}
		<span class="text-sm {form.success ? 'text-emerald-600' : 'text-red-600'}">{form.message}</span>
	{/if}
</nav>

<header class="mb-4">
	<h1 class="text-2xl font-semibold text-ink-900">编辑 {data.dateLabel}</h1>
	<p class="mt-1 text-sm text-ink-500">
		农历 {data.lunar.text}
		{#if data.lunar.solarTerm}· 节气 {data.lunar.solarTerm}{/if}
	</p>
</header>

<div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
	<Card class="p-4">
		<form method="POST" action="?/save" use:enhance={keepInput}>
			<input type="hidden" name="date" value={data.date} />

			<label class="mb-1.5 block text-sm font-medium text-ink-700" for="title">标题</label>
			<Input id="title" name="title" bind:value={title} placeholder="给今天起个标题" />

			<div class="mt-4">
				<p class="mb-1.5 text-sm font-medium text-ink-700">状态</p>
				<StatusPicker statuses={data.statuses} bind:selected />
			</div>

			<div class="mt-4">
				<label class="mb-1.5 block text-sm font-medium text-ink-700" for="content">
					正文（Markdown）
				</label>
				<Textarea id="content" name="content" rows={14} bind:value={content} placeholder="今天……" />
			</div>

			<div class="mt-4 flex items-center gap-2">
				<Button type="submit">保存</Button>
				<a href={resolve('/diary/[date]', { date: data.date })}>
					<Button type="button" variant="ghost">取消</Button>
				</a>
			</div>
		</form>
	</Card>

	<div class="space-y-4">
		<Card class="p-4">
			<h2 class="mb-3 text-sm font-semibold text-ink-700">图片</h2>
			<form
				method="POST"
				action="?/uploadImage"
				enctype="multipart/form-data"
				class="mb-3 flex gap-2"
				use:enhance={keepInput}
			>
				<input type="hidden" name="date" value={data.date} />
				<input
					type="file"
					name="file"
					accept="image/*"
					required
					class="w-full rounded-md border border-ink-300 bg-white p-1.5 text-xs"
				/>
				<Button type="submit" size="sm">上传</Button>
			</form>

			{#if data.detail.images.length === 0}
				<p class="text-xs text-ink-400">还没有图片</p>
			{:else}
				<div class="grid grid-cols-2 gap-2">
					{#each data.detail.images as image (image.id)}
						<figure class="group relative overflow-hidden rounded-lg border border-ink-200">
							<img src={image.url} alt={image.originalFilename} class="h-28 w-full object-cover" />
							<form
								method="POST"
								action="?/deleteImage"
								class="absolute top-1 right-1"
								use:enhance={keepInput}
							>
								<input type="hidden" name="imageId" value={image.id} />
								<Button type="submit" variant="danger" size="sm" class="h-6 px-1.5 text-[10px]">
									删除
								</Button>
							</form>
						</figure>
					{/each}
				</div>
			{/if}
		</Card>

		<Card class="p-4">
			<h2 class="mb-2 text-sm font-semibold text-ink-700">危险操作</h2>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="date" value={data.date} />
				<Button type="submit" variant="danger" size="sm">删除这一天的日记</Button>
			</form>
		</Card>
	</div>
</div>
