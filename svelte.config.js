import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		// 局域网单用户、无登录/会话，直接按 IP 或主机名 HTTP 访问。
		// adapter-node 在未配置 ORIGIN 时会把协议当作 https，导致表单提交被 CSRF 检查拦截
		// （Cross-site POST form submissions are forbidden），这里信任所有来源以支持 LAN 直连。
		csrf: {
			trustedOrigins: ['*']
		}
	}
};

export default config;
