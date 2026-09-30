// 生产启动入口。
//
// adapter-node 默认把单个请求体限制为 512K（BODY_SIZE_LIMIT=512K），
// 上传大图或视频时会直接失败。这里默认取消该限制（Infinity），
// 先设置环境变量再加载构建产物，确保在 handler 初始化前生效。
//
// 如需限制，可在启动前自行设置 BODY_SIZE_LIMIT，例如：
//   BODY_SIZE_LIMIT=200M node server.js
process.env.BODY_SIZE_LIMIT ??= 'Infinity';

await import('./build/index.js');
