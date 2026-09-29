import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const dbPath = resolve(env.DATABASE_PATH ?? 'data/diary.db');
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { sqlite };

let migrated = false;
/** 在首个请求时应用 migration，避免每次热更新重复执行。 */
export function ensureMigrated() {
	if (migrated) return;
	migrated = true;
	try {
		migrate(db, { migrationsFolder: resolve('drizzle') });
	} catch (err) {
		console.error('[db] migration failed', err);
	}
}

/** 数据目录（图片存储在 data/images/） */
export const dataDir = dirname(dbPath);
