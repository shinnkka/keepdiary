<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let { children } = $props();

	const nav = [
		{ href: '/', label: '日历' },
		{ href: '/statistics', label: '统计' },
		{ href: '/settings', label: '设置' }
	].map((item) => ({ ...item, resolved: resolve(item.href as '/') }));

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="min-h-screen">
	<header class="sticky top-0 z-10 border-b border-ink-200 bg-white/90 backdrop-blur">
		<div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
			<a href={resolve('/')} class="flex items-center font-semibold text-ink-900">
				<span>Keep Diary</span>
			</a>
			<nav class="flex items-center gap-1">
				{#each nav as item (item.href)}
					<a
						href={item.resolved}
						class="rounded-md px-3 py-1.5 text-sm transition-colors {isActive(item.href)
							? 'bg-ink-900 text-white'
							: 'text-ink-600 hover:bg-ink-200'}"
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>
	</header>
	<main class="mx-auto max-w-5xl px-4 py-6">
		{@render children()}
	</main>
</div>
