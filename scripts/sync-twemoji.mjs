// 把 Twemoji 的 SVG 资源内嵌到 static/twemoji/，应用运行时无需访问外网。
// 资源来源：devDependency `@twemoji/svg`（全量 emoji），可重复执行。
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'node_modules', '@twemoji', 'svg');
const target = join(root, 'static', 'twemoji');

if (!existsSync(source)) {
	console.warn(`[twemoji] ${source} 不存在，跳过（请先安装依赖）`);
	process.exit(0);
}

mkdirSync(target, { recursive: true });

let count = 0;
for (const file of readdirSync(source)) {
	if (!file.endsWith('.svg')) continue;
	copyFileSync(join(source, file), join(target, file));
	count++;
}

console.log(`[twemoji] 已内嵌 ${count} 个 SVG 到 static/twemoji/`);
