<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg' | 'icon';

	let {
		variant = 'default',
		size = 'md',
		type = 'button',
		class: className = '',
		disabled = false,
		children,
		...rest
	}: {
		variant?: Variant;
		size?: Size;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		disabled?: boolean;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	const base =
		'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:opacity-50';

	const variants: Record<Variant, string> = {
		default: 'bg-ink-900 text-white hover:bg-ink-700',
		secondary: 'bg-ink-200 text-ink-800 hover:bg-ink-300',
		outline: 'border border-ink-300 bg-white text-ink-700 hover:bg-ink-100',
		ghost: 'text-ink-600 hover:bg-ink-200',
		danger: 'bg-red-600 text-white hover:bg-red-500'
	};

	const sizes: Record<Size, string> = {
		sm: 'h-8 px-2.5 text-xs',
		md: 'h-9 px-3.5 text-sm',
		lg: 'h-10 px-5 text-sm',
		icon: 'h-9 w-9'
	};
</script>

<button {type} class={cn(base, variants[variant], sizes[size], className)} {disabled} {...rest}>
	{@render children?.()}
</button>
