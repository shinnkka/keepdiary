<script lang="ts">
	import { marked } from 'marked';
	import { renderEmojiInHtml } from '$lib/emoji';

	let { content = '' }: { content: string } = $props();
	const html = $derived(
		renderEmojiInHtml(marked.parse(content, { async: false, breaks: true }) as string)
	);
</script>

{#if content.trim().length > 0}
	<div class="markdown-body text-sm leading-relaxed text-ink-800">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- 内容来自用户自己的日记，个人应用内渲染 Markdown -->
		{@html html}
	</div>
{/if}

<style>
	.markdown-body :global(h1),
	.markdown-body :global(h2),
	.markdown-body :global(h3) {
		font-weight: 600;
		margin: 0.8em 0 0.4em;
	}
	.markdown-body :global(h1) {
		font-size: 1.35rem;
	}
	.markdown-body :global(h2) {
		font-size: 1.15rem;
	}
	.markdown-body :global(h3) {
		font-size: 1rem;
	}
	.markdown-body :global(p) {
		margin: 0.5em 0;
	}
	.markdown-body :global(ul),
	.markdown-body :global(ol) {
		margin: 0.5em 0;
		padding-left: 1.4em;
		list-style: disc;
	}
	.markdown-body :global(ol) {
		list-style: decimal;
	}
	.markdown-body :global(a) {
		color: var(--color-blue-600);
		text-decoration: underline;
	}
	.markdown-body :global(code) {
		background: var(--color-ink-100);
		padding: 0.1em 0.3em;
		border-radius: 4px;
	}
	.markdown-body :global(blockquote) {
		border-left: 3px solid var(--color-ink-300);
		padding-left: 0.8em;
		color: var(--color-ink-500);
	}
	.markdown-body :global(img) {
		max-width: 100%;
		border-radius: 8px;
	}
	.markdown-body :global(img.twemoji-emoji) {
		display: inline-block;
		width: 1.15em;
		height: 1.15em;
		margin: 0;
		border-radius: 0;
		vertical-align: -0.2em;
	}
</style>
