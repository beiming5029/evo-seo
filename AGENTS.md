# Repository Guidelines

## 项目结构与模块组织
- `app/` 承载 Next.js App Router，使用 `(auth)`、`(protected)` 分组隔离登录前后流程；营销内容集中在 `app/[locale]/(marketing)`。
- `components/` 提供可复用的 UI 原子组件；各功能域的组件、hooks 与服务应置于 `features/<feature>/` 并在该目录的 `__tests__/` 中就近放置测试。
- 共享逻辑放入 `lib/`，全局状态放入 `context/`，通用常量存于 `constants/`；静态资源位于 `public/`，数据库配置集中在 `drizzle.config.ts`。

## 构建、测试与开发命令
- `npm run dev` 在配置好 `.env.local` 后启动带热重载的本地开发服务。
- `npm run build` 生成生产构建，`npm run start` 用于本地冒烟测试发布包。
- `npm run lint` 执行 `eslint-config-next` 规则，所有告警需在提交前解决。
- `npm run db:generate | db:migrate | db:push` 同步 Drizzle schema 并输出 SQL，记得将生成文件纳入版本控制。
- `npm run db:studio` 打开 Drizzle Studio 以检查数据库状态。

## 编码风格与命名约定
- 全仓库使用 TypeScript，统一两格缩进；导出的函数与 server action 需显式类型标注。
- 组件与布局使用 PascalCase，普通变量与工具函数使用 camelCase，路由段以及 `app/` 下的文件倾向 kebab-case。
- UI 采用函数式组件结合 Tailwind 工具类，可配合 `clsx` 或 `tailwind-merge`；Markdown/MDX 内容保持在营销目录。

## 测试指引
- 优先使用 React Testing Library 或 Playwright，在 `features/<feature>/__tests__` 中创建 `*.test.ts(x)` 文件。
- 外部服务通过 `lib/__mocks__/` 里的夹具模拟；补充关键流程的手动 QA 说明。
- 在提交 PR 前至少执行 `npm run lint`，并使用 `npm run dev` 验证核心路径。

## 提交与 PR 规范
- 保持简短的现在时提交信息，允许使用 `feat:` 等约定式前缀；避免一次提交涉及多个功能域。
- PR 需说明改动范围、数据库或鉴权配置变化、关联的 issue，并为 UI 变更附上截图或 GIF。
- 标注后续任务并确认本地已运行必要的迁移或脚本。

## 安全与配置提示
- 复制 `.env.example` 为 `.env.local` 并填入密钥，勿将实际凭据提交仓库。
- 一旦凭据出现在日志或截图中立即轮换；Drizzle 与 Better Auth 的配置更新需同步维护相关密钥。
