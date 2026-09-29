import twemoji from '@twemoji/api';

/**
 * 全站固定使用内嵌在 static/twemoji/ 的 Twemoji SVG，
 * 避免系统 emoji 字体在不同平台上的差异。
 */
const PARSE_OPTIONS = {
	callback: (icon: string) => `/twemoji/${icon}.svg`,
	className: 'twemoji-emoji',
	attributes: () => ({ draggable: 'false', loading: 'lazy', 'aria-hidden': 'true' })
};

/** 把纯文本中的 emoji 替换为 Twemoji <img>。 */
export function renderEmoji(text: string): string {
	return twemoji.parse(text, PARSE_OPTIONS);
}

const TAG_OR_TEXT = /(<[^>]*>)|([^<]+)/g;

/**
 * 只在 HTML 的文本节点中替换 emoji，跳过标签属性，
 * 并避免改动 <code> / <pre> 内的内容。
 */
export function renderEmojiInHtml(html: string): string {
	let skipDepth = 0;
	return html.replace(TAG_OR_TEXT, (match, tag: string | undefined, text: string | undefined) => {
		if (tag) {
			const name = /^<\s*\/?\s*([a-zA-Z0-9]+)/.exec(tag)?.[1]?.toLowerCase();
			if (name === 'code' || name === 'pre') {
				if (/^<\s*\//.test(tag)) skipDepth = Math.max(0, skipDepth - 1);
				else skipDepth++;
			}
			return tag;
		}
		if (skipDepth > 0 || !text) return match;
		return renderEmoji(text);
	});
}
