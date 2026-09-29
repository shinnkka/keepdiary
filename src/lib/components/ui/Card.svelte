<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let { class: className = '', children }: { class?: string; children?: Snippet } = $props();
</script>

<div class={cn('rounded-xl border border-ink-200 bg-white shadow-sm', className)}>
	{@render children?.()}
</div>
