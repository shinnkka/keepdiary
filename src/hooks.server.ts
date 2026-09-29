import type { Handle } from '@sveltejs/kit';
import { ensureMigrated } from '$lib/server/db';
import { seed } from '$lib/server/seed';

// 数据库 migration 与初始数据只在进程启动时执行一次。
ensureMigrated();
seed();

export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
