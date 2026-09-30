# Keep Diary

纯个人使用的日记 Web 应用原型。记录每天的状态与日记，并通过月历、状态颜色条和统计视图回顾生活。

设计文档见 [plan.md](./plan.md)。本仓库是该设计的 **MVP 原型实现**，已覆盖 plan.md 中 Phase 1–7 的核心功能。

## 技术栈

| 层次      | 技术                                                       |
| --------- | ---------------------------------------------------------- |
| UI        | Svelte 5（runes）+ SvelteKit 2                             |
| 语言      | TypeScript                                                 |
| CSS       | Tailwind CSS 4                                             |
| ORM       | Drizzle ORM                                                |
| 数据库    | SQLite（better-sqlite3）                                   |
| 日历计算  | lunar-typescript（公历 / 农历 / 节气，运行时计算，不入库） |
| 图片/视频 | 本地文件系统 `data/images/`，数据库只存 metadata           |
| Markdown  | marked                                                     |
| Emoji     | Twemoji（`@twemoji/api` + `@twemoji/svg`），资源内嵌本地   |
| 校验      | Zod                                                        |
| 部署      | @sveltejs/adapter-node，第一阶段仅 LAN                     |

## 快速开始

```sh
pnpm install          # 安装依赖（会编译 better-sqlite3）
pnpm run db:generate  # 修改 schema 后生成 migration（首次已生成，无需执行）
pnpm run dev          # 启动开发服务器 http://localhost:5173
```

首次启动会自动：

1. 创建 `data/diary.db` 并应用 `drizzle/` 下的 migration；
2. 在没有状态时写入默认状态（开心 / 工作 / 运动 / 疲惫 / 阅读）。

局域网访问：

```sh
pnpm run dev -- --host   # 开发模式 http://<服务器IP>:5173
```

## 部署（局域网）

生产运行使用 `@sveltejs/adapter-node`，在服务器上执行：

```sh
pnpm install                    # 安装依赖（编译 better-sqlite3、内嵌 twemoji）
pnpm run build                  # 构建，产物在 build/
HOST=0.0.0.0 PORT=3000 node server.js
```

然后同局域网设备访问 `http://<服务器IP>:3000`。

- `server.js` 是生产入口：它会先取消 `adapter-node` 默认的 512K 请求体限制（否则上传大图/视频会失败），再加载 `build/index.js`。
- **必须在项目根目录运行** `node server.js`：应用按当前工作目录解析 `data/diary.db` 与 `drizzle/`；换目录运行会找不到 migration。
- `HOST` 默认 `0.0.0.0`、`PORT` 默认 `3000`，可用环境变量覆盖。
- `DATABASE_PATH=/path/to/diary.db` 可自定义数据库位置，图片/视频存到该文件同级的 `images/`。
- 如需重新限制上传大小：`BODY_SIZE_LIMIT=200M node server.js`（默认 `Infinity`，即不限制）。
- 防火墙放行端口，例如 `sudo ufw allow 3000/tcp`。

长期运行可用 systemd：

```ini
# /etc/systemd/system/keepdiary.service
[Unit]
Description=Keep Diary
After=network.target

[Service]
Type=simple
User=shinka
WorkingDirectory=/home/shinka/repo/keepdiary
Environment=HOST=0.0.0.0
Environment=PORT=3000
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload && sudo systemctl enable --now keepdiary
```

> **关于 CSRF**：直接以 HTTP + IP 访问时，`adapter-node` 在未配置 `ORIGIN` 时会把协议当作 `https`，导致表单提交报 `Cross-site POST form submissions are forbidden`（开发模式不会）。本项目单用户、局域网、无登录会话，已在 `svelte.config.js` 设置 `csrf.trustedOrigins: ['*']` 以支持直连。若以后接入域名/公网，建议移除该配置并改用 `ORIGIN=http://<host:port>` 启动。

## 路由

| 路径                 | 说明                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| `/`                  | 月历 Dashboard，`?month=YYYY-MM` 切换月份                            |
| `/diary/[date]`      | 某一天的内容浏览页：标题、状态、Markdown 正文、图片 / 视频           |
| `/diary/[date]/edit` | 编辑页：标题、状态多选、Markdown 正文、图片 / 视频上传删除、删除日记 |
| `/statistics`        | 任意时间范围的状态天数统计 + 日期概览                                |
| `/settings`          | 设置入口                                                             |
| `/settings/status`   | 状态管理：创建、编辑、改色、排序、删除                               |
| `/settings/events`   | 特殊日期：一次性 / 每年重复                                          |
| `/images/[id]`       | 读取 `data/images/` 中的图片 / 视频（支持 HTTP Range）               |

## 目录结构

```
src/
├── routes/                     # 页面与 Form Actions
│   ├── +page.server.ts         # 月历数据组装
│   ├── diary/[date]/           # 日记浏览页 + edit/ 编辑页
│   ├── statistics/             # 统计
│   ├── settings/               # 状态 / 特殊日期管理
│   └── images/[id]/            # 图片 / 视频文件服务（HTTP Range）
├── lib/
│   ├── calendar/               # 公历工具 + 农历/节气计算
│   ├── emoji.ts                # Twemoji 渲染（正文 emoji）
│   ├── components/             # calendar / diary / status / ui 组件
│   ├── types.ts                # 前后端共享类型
│   └── server/                 # 仅服务端
│       ├── db/                 # schema、连接、migration
│       ├── diary.ts status.ts events.ts images.ts stats.ts
│       └── seed.ts
scripts/sync-twemoji.mjs        # 内嵌 Twemoji SVG 到 static/twemoji/
server.js                       # 生产入口（取消 BODY_SIZE_LIMIT 后加载 build/）
data/                           # SQLite + 图片/视频（已 gitignore）
static/twemoji/                 # 生成的 Twemoji 资源（已 gitignore）
drizzle/                        # 生成的 migration
```

## 数据模型

- `status`：状态标签，可重复使用，含 `sort_order`。
- `diary`：一天最多一篇，`date` UNIQUE；`title`/`content` 可为空。
- `diary_status`：Diary ↔ Status 中间表，一天可有多个状态。
- `image`：图片 / 视频 metadata，文件保存在 `data/images/YYYY/MM/`（`mime_type` 区分类型）。
- `custom_event`：独立于日记与状态，`repeat_rule` 支持 `none` / `yearly`。

公历、农历、节气**不入库**，由 `src/lib/calendar/lunar.ts` 在运行时根据日期计算；统计也是实时查询，不保存冗余结果。

## Emoji / Twemoji

全站固定使用 Twemoji，避免不同系统 emoji 字体差异：

- 内嵌资源：`scripts/sync-twemoji.mjs` 把 `@twemoji/svg` 的全部 SVG 复制到 `static/twemoji/`（该目录由脚本生成，已 gitignore）。`pnpm install` 的 `prepare` 与 `pnpm build` 的 `prebuild` 会自动执行，也可手动 `pnpm run twemoji:sync`。
- UI 中的 emoji 用 `Emoji.svelte` 渲染，日记正文中的 emoji 由 `src/lib/emoji.ts`（`@twemoji/api`）在 Markdown 渲染时替换为本地 Twemoji 图片。

## 备份

备份整个 `data/` 目录即可（数据库 + 图片 / 视频）。

## 原型范围说明

已实现 plan.md 的第一版功能：月历（公历/农历/节气/今天/月份切换）、多状态颜色条、日记 CRUD、Markdown 与图片/视频、特殊日期、自定义时间范围的状态天数统计与日期概览。

暂未实现（与 plan.md 一致）：法定节假日、调休、多用户、登录、权限、社交、搜索、自动备份等。UI 组件参考 shadcn-svelte 的样式风格手写实现（未引入其 CLI），后续可平滑替换。
