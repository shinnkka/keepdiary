<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		value = $bindable(''),
		type = 'text',
		name = '',
		placeholder = '',
		required = false,
		class: className = '',
		...rest
	}: {
		value?: string | number;
		type?: string;
		name?: string;
		placeholder?: string;
		required?: boolean;
		class?: string;
		[key: string]: unknown;
	} = $props();
</script>

<input
	{type}
	{name}
	{placeholder}
	{required}
	bind:value
	class={cn(
		'h-9 w-full rounded-md border border-ink-300 bg-white px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-blue-500 focus:outline-none',
		className
	)}
	{...rest}
/>
