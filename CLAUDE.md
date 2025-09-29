# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这是一个基于 Next.js 14 构建的 AI SaaS 启动模板项目，专为 Sistine AI 工具设计。

### 技术栈

- **前端框架**: Next.js 14.2.3 (App Router)
- **样式**: Tailwind CSS + CSS-in-JS
- **UI 组件**: 自定义组件库 + Radix UI + Framer Motion 动画
- **身份认证**: Better Auth (支持邮箱密码和 Google OAuth)
- **数据库**: PostgreSQL + Drizzle ORM
- **类型安全**: TypeScript
- **表单处理**: React Hook Form + Zod 验证
- **MDX 支持**: 用于博客和文档
- **主题**: 支持深色/浅色模式切换 (next-themes)

## 项目结构

### 核心目录说明

- **app/**: Next.js App Router 页面和路由
  - `(auth)/`: 认证相关页面（登录、注册）
  - `(marketing)/`: 营销页面（主页、定价、博客、联系）
  - `(protected)/`: 需要认证的页面（仪表板、个人资料）
  - `api/auth/[...all]/`: Better Auth API 路由

- **components/**: 可重用的 React 组件
  - UI 组件（按钮、表单、动画等）
  - 业务组件（Hero、Features、Pricing 等）

- **features/**: 功能模块化组织
  - `auth/`: 认证相关组件和逻辑
  - `forms/`: 表单组件封装
  - `marketing/`: 营销页面组件
  - `navigation/`: 导航栏和菜单组件

- **lib/**: 核心工具和配置
  - `auth.ts`: Better Auth 服务端配置
  - `auth-client.ts`: Better Auth 客户端配置
  - `db/`: 数据库连接和 Schema 定义
  - `blog.ts`: 博客文章处理逻辑

- **constants/**: 常量定义（如定价计划）
- **context/**: React Context（主题提供器等）
- **layouts/**: 布局组件

## 常用开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行 lint 检查
pnpm lint

# 数据库操作
pnpm db:generate    # 生成 Drizzle 迁移文件
pnpm db:migrate     # 执行数据库迁移
pnpm db:push        # 推送 schema 到数据库（开发环境）
pnpm db:studio      # 启动 Drizzle Studio 数据库管理界面
```

## 环境变量配置

创建 `.env.local` 文件，包含以下必需的环境变量：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@host/db?sslmode=require"

# Better Auth 配置
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"  # 生产环境改为实际域名

# Google OAuth（可选）
AUTH_GOOGLE_ID="google-client-id"
AUTH_GOOGLE_SECRET="google-client-secret"

# 应用 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 认证系统架构

项目使用 Better Auth 实现认证，支持：
- 邮箱密码注册/登录
- Google OAuth 登录
- Session 管理
- 受保护路由

认证流程通过 `/app/api/auth/[...all]/route.ts` 处理所有认证相关的 API 请求。

## 数据库架构

使用 Drizzle ORM 定义的主要表：
- `user`: 用户信息
- `session`: 会话管理
- `account`: OAuth 账户关联
- `verification`: 验证令牌

## 路由保护

受保护的路由位于 `app/(protected)/` 目录下，通过 `features/auth/components/session-guard.tsx` 组件实现访问控制。

## 主题系统

支持深色和浅色模式，通过 `next-themes` 实现，主题切换组件位于 `components/mode-toggle.tsx`。

## MDX 博客支持

博客文章支持 MDX 格式，配置包含：
- Remark GFM（GitHub 风格 Markdown）
- Rehype Prism（代码高亮）
- 自动生成阅读时间

## TypeScript 配置

- 严格模式启用（strict: true）
- 路径别名：`@/*` 映射到项目根目录
- 目标：ES2017

## 部署注意事项

1. 确保所有环境变量在生产环境中正确配置
2. 数据库需要支持 PostgreSQL
3. Better Auth 的 `BETTER_AUTH_URL` 必须设置为生产域名
4. 如果使用 Google OAuth，需要在 Google Console 中配置回调 URL