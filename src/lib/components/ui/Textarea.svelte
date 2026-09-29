<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		value = $bindable(''),
		name = '',
		placeholder = '',
		rows = 12,
		class: className = '',
		...rest
	}: {
		value?: string;
		name?: string;
		placeholder?: string;
		rows?: number;
		class?: string;
		[key: string]: unknown;
	} = $props();
</script>

<textarea
	{name}
	{rows}
	{placeholder}
	bind:value
	class={cn(
		'w-full resize-y rounded-md border border-ink-300 bg-white p-3 font-mono text-sm leading-relaxed text-ink-800 placeholder:text-ink-400 focus:border-blue-500 focus:outline-none',
		className
	)}
	{...rest}></textarea>
