个人日记 Web 应用设计文档

1. 项目概述

这是一个纯个人使用的日记 Web 应用，用于记录每天的状态和日记，并通过日历、状态颜色和统计视图回顾一段时间内的生活。

第一阶段只在局域网运行，优先完成核心功能和数据模型。

后续等应用基本稳定后，再考虑：

Tailscale
域名
HTTPS
Cloudflare Tunnel
其他远程访问方式

项目不以多用户、社交、协作等场景为目标。

2. 核心设计理念

应用围绕：

日期
│
├── 日历信息
│ ├── 公历
│ ├── 农历
│ └── 节气
│
├── 自定义特殊日期
│
├── 状态
│ ├── 状态 A
│ ├── 状态 B
│ └── 状态 C
│
└── 日记
├── 标题
├── 正文
└── 图片

建立数据模型。

其中一个重要设计是：

日期本身是核心实体，状态和日记都是日期上的附加信息。

3. 第一版功能范围
   3.1 第一版包含
   日历
   月历
   公历
   农历
   节气
   今天
   月份切换
   点击日期进入当天页面
   日记
   标题
   正文
   图片
   创建/修改
   删除

所有字段均可为空，因此可以存在：

只有状态，没有日记

或者：

只有日记，没有状态
状态
用户自定义状态
状态名称
状态颜色
状态排序
一天多个状态

例如：

开心
工作
疲惫
运动

某一天可以同时具有：

开心
工作
运动
自定义特殊日期

例如：

生日
纪念日
特殊事件
用户定义的任何日期

支持：

日期
名称
描述
颜色
重复规则

第一版可以先支持：

一次性
每年重复
统计
任意时间范围
状态出现次数
月度统计
年度统计 4. 第一版明确不包含

第一版暂时不加入：

❌ 法定节假日
❌ 调休
❌ 工作日/休息日政策数据
❌ 多用户
❌ 用户登录
❌ 权限系统
❌ 社交
❌ 评论
❌ 实时协作
❌ WebSocket
❌ Redis
❌ PostgreSQL
❌ GraphQL
❌ 微服务
❌ 公网部署

特别是节假日：

凡是不能从日期本身确定、需要维护外部数据的数据，第一版暂时不纳入。

因此：

公历 → 计算
农历 → 计算
节气 → 计算
法定节假日 → 暂不支持
调休 → 暂不支持

这样可以避免第一版引入每年更新政策数据的维护工作。

5. 技术栈

最终技术栈：

层次 技术
UI Svelte 5
Web Framework SvelteKit
语言 TypeScript
CSS Tailwind CSS
UI Components shadcn-svelte
ORM Drizzle ORM
数据库 SQLite
图片 本地文件系统
编辑器 Markdown / Textarea
部署 SvelteKit + Node.js
第一阶段网络 LAN

总体结构：

┌─────────────────────────────┐
│ SvelteKit │
│ │
│ ┌─────────┐ ┌──────────┐ │
│ │ Svelte │ │ Server │ │
│ │ UI │ │ │ │
│ └─────────┘ └────┬─────┘ │
│ │ │
│ ┌────▼────┐ │
│ │ Drizzle │ │
│ └────┬────┘ │
└────────────────────┼───────┘
│
┌────▼────┐
│ SQLite │
└─────────┘

                     +
                ┌─────────┐
                │ Images  │
                │ Files   │
                └─────────┘

6. 为什么选择 SvelteKit

SvelteKit 同时负责：

前端 UI
路由
服务端代码
数据加载
Form Actions
API
SSR/CSR
静态资源

因此不需要单独维护：

React frontend +
Express/Hono backend

项目可以保持为一个单体应用：

SvelteKit
├── Svelte
├── Server
├── Drizzle
└── SQLite

对于单用户个人应用，这种架构足够简单。

7. 项目结构

建议：

diary/
├── src/
│ ├── routes/
│ │ ├── +layout.svelte
│ │ ├── +page.svelte
│ │ │
│ │ ├── diary/
│ │ │ └── [date]/
│ │ │ ├── +page.svelte
│ │ │ └── +page.server.ts
│ │ │
│ │ ├── statistics/
│ │ │ ├── +page.svelte
│ │ │ └── +page.server.ts
│ │ │
│ │ └── settings/
│ │ ├── +page.svelte
│ │ ├── status/
│ │ └── events/
│ │
│ ├── lib/
│ │ ├── components/
│ │ │ ├── calendar/
│ │ │ ├── diary/
│ │ │ ├── status/
│ │ │ └── statistics/
│ │ │
│ │ ├── calendar/
│ │ │ ├── lunar.ts
│ │ │ └── calendar.ts
│ │ │
│ │ ├── types/
│ │ └── utils/
│ │
│ └── lib/server/
│ ├── db/
│ │ ├── index.ts
│ │ ├── schema.ts
│ │ └── migrations/
│ │
│ ├── diary/
│ ├── status/
│ └── images/
│
├── static/
│
├── data/
│ ├── diary.db
│ └── images/
│
├── drizzle.config.ts
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json 8. 核心数据模型

数据库核心实体：

status
diary
diary_status
image
custom_event

其中最重要的变化是：

Diary 和 Status 是多对多关系。

9. Status

状态定义：

status
├── id
├── name
├── color
├── sort_order
├── created_at
└── updated_at

例如：

id name color
1 开心 #xxxxxx
2 工作 #xxxxxx
3 疲惫 #xxxxxx
4 运动 #xxxxxx

状态本身不属于某一天。

它是一个可重复使用的标签。

10. Diary

日记：

diary
├── id
├── date
├── title
├── content
├── created_at
└── updated_at

其中：

date

表示日记所属日期。

第一版仍然采用：

一天最多一篇日记。

因此：

date UNIQUE

例如：

2026-09-29

最多对应一条 diary。

11. DiaryStatus

由于一天允许多个状态，需要中间表：

diary_status
├── diary_id
└── status_id

关系：

Diary N ←→ N Status

例如：

Diary
2026-09-29
│
├── 开心
├── 工作
└── 运动

数据库：

diary
┌────┬────────────┐
│ id │ date │
├────┼────────────┤
│ 42 │ 2026-09-29 │
└────┴────────────┘

diary_status
┌──────────┬───────────┐
│ diary_id │ status_id │
├──────────┼───────────┤
│ 42 │ 1 │
│ 42 │ 2 │
│ 42 │ 4 │
└──────────┴───────────┘

这样以后统计非常自然。

12. 日历中的多状态显示

这是新的核心 UI 设计。

如果某一天：

开心
工作
运动

则日期格可以显示：

┌────────────┐
│ 29 │
│ 十九 │
│ │
│ ███ 开心 │
│ ███ 工作 │
│ ███ 运动 │
│ │
└────────────┘

或者更紧凑：

┌────────────┐
│ 29 │
│ 十九 │
│ █ █ █ │
└────────────┘

每个状态对应一个颜色。

13. 状态条带设计

建议不要简单把整个日期格背景设置成多个颜色。

而是采用：

日期
────────────
状态条 1
状态条 2
状态条 3

例如：

┌──────────────┐
│ 29 │
│ 十九 │
│ ████████████ │
│ ████████████ │
│ ████████████ │
└──────────────┘

优点：

多状态可以同时表达
不会让日期文字难以阅读
状态数量增加时仍然容易扩展
状态颜色不会影响整个日期格的可读性 14. 状态数量过多

如果一天有很多状态，不能无限增加条带高度。

建议设置：

最多显示 N 条

例如：

████
████
████
+2

点击日期后显示完整状态列表：

2026-09-29

状态：

● 开心
● 工作
● 运动
● 学习
● 阅读

具体 N 值可以等 UI 实现时确定。

15. 状态排序

因为一天可能存在多个状态，需要定义状态顺序。

默认可以使用：

status.sort_order

例如：

开心
工作
运动
阅读

日历中按照 sort_order 显示。

以后也可以允许用户拖动调整。

16. 统计设计

多状态之后，统计的含义需要明确：

统计某状态被应用于多少天，而不是统计日记数量。

例如：

9 月

开心 15 天
工作 18 天
运动 8 天
阅读 5 天

如果：

2026-09-29
状态：开心、工作、运动

那么这一天：

开心 +1
工作 +1
运动 +1

而不是：

状态总数 +1

这样统计更符合状态标签的语义。

17. Calendar Day 数据结构

日历本身不存数据库。

运行时组合：

CalendarDay
├── date
├── lunar
├── solarTerm
├── customEvents[]
├── diary?
└── statuses[]

例如：

{
date: "2026-09-29",

    lunar: {
        month: 8,
        day: 19
    },

    solarTerm: null,

    customEvents: [],

    diary: {
        title: "今天完成了……"
    },

    statuses: [
        {
            name: "开心",
            color: "#..."
        },
        {
            name: "工作",
            color: "#..."
        }
    ]

}

这可以作为前端 Calendar Component 的输入。

18. 自定义特殊日期

保留：

custom_event

结构：

custom_event
├── id
├── date
├── title
├── description
├── color
├── repeat_rule
├── created_at
└── updated_at

例如：

2026-09-29
生日

或者：

每年 09-29
某个纪念日 19. 自定义日期与日记的关系

自定义日期不应该与 diary 强绑定。

例如：

2026-09-29
│
├── Custom Event: 纪念日
│
├── Status:
│ ├── 开心
│ └── 旅行
│
└── Diary:
└── 今天去了……

它们都是日期的附属信息。

20. 日历数据来源

第一版：

                 Calendar
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
      公历         农历          节气
      计算         计算          计算

以及：

                    │
                    ▼
             Custom Events
               SQLite

不包括：

法定节假日
调休
工作日政策

这样第一版完全不需要维护外部政策数据。

21. 日记编辑器

第一版使用简单 Markdown 编辑器：

┌───────────────────────────────┐
│ 标题 │
├───────────────────────────────┤
│ 状态： │
│ [开心] [工作] [运动] [+] │
├───────────────────────────────┤
│ │
│ 今天…… │
│ │
│ │
├───────────────────────────────┤
│ 图片 │
│ [添加图片] │
└───────────────────────────────┘

状态可以通过多选：

☑ 开心
☑ 工作
☐ 疲惫
☑ 运动
☐ 阅读 22. 图片存储

图片不存 SQLite BLOB。

数据库：

image
├── id
├── diary_id
├── path
├── original_filename
├── mime_type
├── width
├── height
├── size
└── created_at

实际文件：

data/images/
├── 2026/
│ └── 09/
│ ├── 8f31....webp
│ ├── 3a82....jpg
│ └── ... 23. 页面设计

第一版：

/

首页：

月历
当前月份
今天
状态颜色
日记标题
自定义日期提示
/diary/[date]

某一天：

2026-09-29

农历 八月十九

状态：
[开心] [工作] [运动]

标题：
今天……

正文：
……

图片：
[……]
/statistics

统计：

时间范围：[2026-01-01] ～ [2026-09-29]

开心 87 天
工作 126 天
运动 43 天
阅读 31 天

以及年度热力图。

/settings

包括：

状态管理
特殊日期管理 24. 路由

最终：

/
/diary/[date]
/statistics

/settings
/settings/status
/settings/events

暂时不需要单独的 /calendar。

因为：

首页本身就是日历 Dashboard。

以后如果首页变复杂，再拆分。

25. Server / Client 边界

数据库和文件系统全部属于 Server：

src/lib/server/

例如：

src/lib/server/db/
src/lib/server/images/

浏览器只能通过：

+page.server.ts
form actions
load functions

与 Server 交互。

26. 数据校验

服务器端对所有输入进行验证。

例如：

DiaryInput
├── date
├── title?
├── content?
└── statuses[]

状态：

StatusInput
├── name
└── color

特殊日期：

CustomEventInput
├── date
├── title
├── description?
├── color?
└── repeat_rule

可以使用 Zod 做 schema validation。

27. API 设计

第一版不需要刻意设计 REST API。

例如保存日记：

Browser
│
▼
Form Action
│
├── Validate
├── Update diary
├── Update diary_status
└── Save images

直接使用 SvelteKit 的 Server Actions。

以后如果需要原生 App 或第三方 API，再抽象 API 层。

28. 数据库关系

整体关系：

                     ┌──────────┐
                     │  Status  │
                     └────┬─────┘
                          │
                          │ N
                          │
                     ┌────▼─────┐
                     │  Diary   │
                     └────┬─────┘
                          │
                          │ 1
                          │
                     ┌────▼─────┐
                     │  Image   │
                     └──────────┘

Status N ←──── DiaryStatus ────→ N Diary

CustomEvent
│
│
▼
Date 29. SQLite

数据库：

data/diary.db

使用 Drizzle ORM。

SQLite 负责：

状态
日记
状态关联
图片 metadata
自定义日期

不负责：

公历
农历
节气
图片 binary 30. 备份

完整数据由两部分组成：

data/
├── diary.db
└── images/

因此备份整个：

data/

即可。

未来可以增加：

diary-backup-2026-09-29.tar.zst

第一版不实现自动备份也可以。

31. 第一阶段部署

开发期间：

Browser
│
│ LAN
▼
Linux PC
│
▼
SvelteKit
│
├── SQLite
└── Images

例如：

http://192.168.x.x:3000

暂时不考虑：

公网 IPv6
域名
HTTPS
Tailscale
Cloudflare
VPS

这些属于部署问题，而不是应用本身的问题。

32. 后期访问方式

应用开发完成后，可以直接在外面增加访问层。

Tailscale
Phone
│
Laptop
│
Desktop
│
└── Tailscale ── Home Server
Domain + IPv6
Browser
│
Domain
│
IPv6
│
Home Server
│
SvelteKit
Cloudflare Tunnel
Browser
│
Cloudflare
│
Tunnel
│
Home Server
│
SvelteKit

应用内部不需要因为这些部署方式改变而修改。

33. MVP 开发阶段
    Phase 1：项目初始化
    SvelteKit
    TypeScript
    Tailwind
    shadcn-svelte
    Drizzle
    SQLite

完成：

项目结构
数据库
migration
基础 layout
Phase 2：Status

实现：

创建状态
删除状态
修改状态
修改颜色
排序
Phase 3：Calendar

实现：

月历
月份切换
今天
公历
农历
节气
多状态颜色条
Phase 4：Diary

实现：

创建
编辑
删除
标题
Markdown
多状态选择
Phase 5：Images

实现：

上传
显示
删除
多图
Phase 6：Custom Events

实现：

添加特殊日期
编辑
删除
颜色
每年重复
Phase 7：Statistics

实现：

月度状态统计
年度状态统计
自定义时间范围
年度状态热力图 34. MVP 完成后的整体结构
Personal Diary
│
┌───────────────┼────────────────┐
│ │ │
▼ ▼ ▼
Calendar Diary Statistics
│ │ │
┌──────┼──────┐ ┌───┼────┐ │
│ │ │ │ │ │ │
公历 农历 节气 标题 正文 图片 状态统计
│
▼
Custom Events

              │
              ▼
         Multiple Status
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
      ● A    ● B    ● C

35. 未来扩展

MVP 完成后，根据实际使用体验再考虑：

日记搜索

SQLite FTS5：

标题 + 正文
更好的编辑器

例如：

Tiptap
多篇日记

当前：

一天 → 一篇 Diary

未来可以变成：

一天
├── Entry 1
├── Entry 2
└── Entry 3
更多附件
图片
视频
音频
PDF
数据导入导出
JSON
Markdown
ZIP
自动备份
SQLite backup +
Images backup
节假日

如果以后确实需要，再增加独立的 holiday 数据源：

Holiday
├── date
├── name
└── type

不会影响现有核心模型。

36. 核心设计原则

整个项目遵循以下原则：

日期是核心实体。
一天最多一篇日记。
一天可以拥有多个状态。
状态是独立实体，通过中间表关联 Diary。
日历颜色条表示当天的多个状态。
公历、农历、节气等可计算信息不存数据库。
第一版不处理法定节假日和调休等外部政策数据。
自定义特殊日期独立于日记和状态。
图片使用文件系统，SQLite 只保存 metadata。
统计实时从数据库计算，不保存冗余统计结果。
SQLite 是唯一数据库。
Server-only 代码与客户端严格分离。
第一版只在 LAN 运行。
应用逻辑与网络部署解耦。
优先保持简单，需求出现后再增加复杂度。37. 最终架构

最终第一版可以非常简单：

                         LAN
                          │
                          ▼
                   ┌─────────────┐
                   │   Browser   │
                   └──────┬──────┘
                          │
                          ▼
              ┌───────────────────────┐
              │       SvelteKit       │
              │                       │
              │  ┌─────────────────┐  │
              │  │     Svelte     │  │
              │  │       UI       │  │
              │  └────────┬────────┘  │
              │           │           │
              │  ┌────────▼────────┐  │
              │  │ Server / Actions │  │
              │  └────────┬────────┘  │
              │           │           │
              │      ┌────▼────┐      │
              │      │ Drizzle │      │
              │      └────┬────┘      │
              └───────────┼───────────┘
                          │
                    ┌─────▼─────┐
                    │  SQLite   │
                    └───────────┘

                          +

                    data/images/

数据模型则是整个应用最核心的部分：

                    ┌─────────────┐
                    │    Date     │
                    └──────┬──────┘
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
    Calendar Info      Custom Events       Diary
    ├─ 公历               │              ├─ Title
    ├─ 农历               │              ├─ Content
    └─ 节气               │              └─ Images
                                           │
                                      ┌────┴────┐
                                      │         │
                                  Status 1   Status 2
                                      │         │
                                      └────┬────┘
                                           │
                                      Status N
