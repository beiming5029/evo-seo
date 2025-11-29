# SEO 数据管理平台详细设计文档

本文档旨在为开发团队提供详尽的页面交互、数据库结构及 API 接口定义，确保前后端开发的一致性与完整性。

---

## 1. 页面交互细节 (UI/UX)

### 1.1 用户端 (Client Portal)

#### **A. 仪表盘首页 (Dashboard Home)**
*   **路由**: `/dashboard`
*   **布局**:
    *   **顶部**: 欢迎语区域。
        *   文案: "欢迎回来，查看您的流量增长大盘。当前有 **{siteCount}** 个站点正在持续获客。"
    *   **主体**: 2x2 网格布局卡片。
        1.  **本月新增询盘**
            *   标题: "本月新增询盘"
            *   内容: 大号数字展示本月所有站点询盘总和。
            *   交互: 点击卡片整体跳转至 `/dashboard/analytics`。
        2.  **文章日历（本月）**
            *   标题: "文章日历（本月）"
            *   内容: 大号数字展示本月所有站点排期文章总和。
            *   交互: 点击卡片整体跳转至 `/dashboard/calendar`。
        3.  **最新服务报告**
            *   标题: "最新服务报告"
            *   内容: 展示最新一份报告的标题及上传日期 (YYYY-MM-DD)。
            *   交互: 点击卡片整体跳转至 `/dashboard/reports`。
        4.  **24/7 专家客服**
            *   标题: "24/7 专家客服"
            *   内容: "遇到问题？我们的SEO专家团队随时为您提供服务。\n微信号：lsiy_lee"
            *   交互: 点击微信号可复制到剪贴板。

#### **B. 效果看板 (Analytics)**
*   **路由**: `/dashboard/analytics`
*   **顶部栏**: 全局网站切换下拉框 (Tenant Switcher)。
*   **内容区**:
    *   **询盘趋势**:
        *   组件: 折线图 (Line Chart)。
        *   X轴: 近6个月月份。
        *   Y轴: 询盘数量。
        *   Tooltip: 显示具体月份数值。
    *   **自然流量趋势**:
        *   组件: 折线图 (Line Chart)。
        *   X轴: 近6个月月份。
        *   Y轴: 流量数值。
    *   **核心关键词排名**:
        *   组件: 数据表格 (Table)。
        *   列: 关键词、目标网址、当前排名、变化。
        *   变化列样式:
            *   上升: 绿色向上箭头图标。
            *   下降: 红色向下箭头图标。
            *   持平: 灰色横杠。

#### **C. 内容日历 (Content Calendar)**
*   **路由**: `/dashboard/calendar`
*   **顶部栏**: 全局网站切换下拉框。
*   **内容区**:
    *   组件: 月视图日历 (FullCalendar / React-Day-Picker)。
    *   **日历单元格**:
        *   显示文章标题（单行截断）。
        *   **多站点区分**: 若用户关联多个站点，标题前加颜色圆点（如 Site A 蓝点, Site B 紫点）。
        *   **状态样式**:
            *   待发布: 浅色背景或空心圆点。
            *   已发布: 深色背景或实心圆点。
    *   **交互**:
        *   点击标题: 弹出模态框 (Modal)，展示文章详情（标题、摘要、正文预览）。
        *   切换月份: 限制只能向前翻到“合作开始时间”。

#### **D. 服务报告 (Service Reports)**
*   **路由**: `/dashboard/reports`
*   **顶部栏**: 全局网站切换下拉框。
*   **内容区**:
    *   **分组**: 两个 Tab 或 两个 Section（策略诊断报告、复盘报告）。
    *   **列表项**:
        *   左侧: PDF 图标。
        *   中间: 报告标题 + 上传日期 (灰色小字)。
        *   右侧: 下载按钮 (Download Icon)。
    *   **排序**: 按上传时间倒序。

#### **E. 设置页 (Settings)**
*   **路由**: `/dashboard/settings`
*   **顶部栏**: 全局网站切换下拉框。
*   **内容区**:
    *   **品牌知识库卡片**:
        *   展示: 品牌语调、核心产品描述、目标客户画像。
        *   样式: 只读文本块，支持多行展示。
    *   **账户信息卡片**:
        *   展示: 邮箱、公司名称、当前套餐、有效期至。

---

### 1.2 管理端 (Admin Portal)

#### **A. 数据上传中心**
*   **路由**: `/admin/upload`
*   **公共组件**:
    *   **账号选择器**: 下拉框 (Searchable Select)，选择用户。
    *   **网站选择器**: 下拉框，根据所选账号级联加载。

#### **B. 各模块表单**
1.  **SEO 数据上传**:
    *   Tab 切换: 询盘 / 流量 / 关键词。
    *   **询盘/流量**: 动态表格，列包含 [日期, 数量, 操作(删除)]。底部有“添加一行”按钮。
    *   **关键词**: 固定 10 行输入框，列包含 [关键词, URL, 排名, 趋势(下拉)]。
2.  **文章排期上传**:
    *   额外筛选: 月份选择器 (YYYY-MM)。
    *   表单: 生成该月每日的输入行。
    *   输入项: Supabase Article ID。
    *   **增强交互**: 输入 ID 后，失去焦点时自动调用 API 获取文章标题并显示在输入框下方，供管理员确认。
3.  **服务报告上传**:
    *   输入项: 报告类型 (Select), 报告名称 (Input)。
    *   上传组件: 拖拽上传区域，支持 PDF，上传后显示文件名和进度。
4.  **设置信息上传**:
    *   输入项: 品牌语调 (Textarea), 核心产品 (Textarea), 客户画像 (Textarea), 邮箱 (Input), 公司名称 (Input), 有效期 (Date Picker)。

---

## 2. 数据库详细定义 (Database Schema)

### 2.1 用户与认证体系 (User & Auth)

#### `user`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 用户唯一标识 |
| `name` | text | Not Null | 用户名 |
| `email` | text | Unique, Not Null | 登录邮箱 |
| `emailVerified` | boolean | Default false | 邮箱是否验证 |
| `image` | text | Nullable | 头像 URL |
| `role` | text | Default 'user' | 'admin' 或 'user' |
| `createdAt` | timestamp | Default Now | 注册时间 |
| `updatedAt` | timestamp | Default Now | 更新时间 |

#### `session`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 会话 ID |
| `userId` | text | FK -> user.id | 关联用户 |
| `token` | text | Unique, Not Null | 会话 Token |
| `expiresAt` | timestamp | Not Null | 过期时间 |
| `ipAddress` | text | Nullable | IP 地址 |
| `userAgent` | text | Nullable | 用户代理 |

#### `account`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 账户 ID |
| `userId` | text | FK -> user.id | 关联用户 |
| `accountId` | text | Not Null | 提供商账户 ID |
| `providerId` | text | Not Null | 提供商 (google, github) |
| `accessToken` | text | Nullable | 访问令牌 |
| `refreshToken` | text | Nullable | 刷新令牌 |
| `expiresAt` | timestamp | Nullable | 令牌过期时间 |
| `password` | text | Nullable | 密码 (若使用凭证登录) |

#### `verification`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 验证 ID |
| `identifier` | text | Not Null | 标识 (邮箱/手机) |
| `value` | text | Not Null | 验证码/Token |
| `expiresAt` | timestamp | Not Null | 过期时间 |

### 2.2 租户体系 (Multi-tenancy)

#### `tenant`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 租户/网站唯一标识 |
| `name` | text | Not Null | 网站名称/公司名称 |
| `cooperationStartDate` | date | Nullable | 合作开始日期 |
| `contactEmail` | text | Nullable | 设置页展示的联系邮箱 |
| `plan` | text | Nullable | 套餐名称 (e.g. 'Pro') |
| `validUntil` | date | Nullable | 合作有效期截止 |
| `createdAt` | timestamp | Default Now | 创建时间 |

#### `tenant_membership`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 关联 ID |
| `userId` | text | FK -> user.id | 关联用户 |
| `tenantId` | text | FK -> tenant.id | 关联租户 |
| `role` | text | Default 'member' | 租户内角色 |
| `createdAt` | timestamp | Default Now | 加入时间 |

### 2.3 业务配置

#### `wp_integration`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 配置 ID |
| `tenantId` | text | FK -> tenant.id | 关联租户 |
| `siteUrl` | text | Not Null | WordPress 站点地址 |
| `wpUsername` | text | Not Null | WP 用户名 |
| `wpAppPassword` | text | Not Null | WP 应用密码 |
| `autoPublish` | boolean | Default false | 是否开启自动推送 |
| `status` | varchar | Default 'disconnected' | 连接状态 |

#### `brand_config`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 主键 |
| `tenantId` | text | FK -> tenant.id | 关联租户 |
| `brandVoice` | text | Nullable | 品牌语调 |
| `productDesc` | text | Nullable | 核心产品描述 |
| `targetAudience` | text | Nullable | 目标客户画像 |

### 2.4 内容排期

#### `content_schedule` (原 post 表重构)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 主键 |
| `tenantId` | text | FK -> tenant.id | 关联租户 |
| `title` | text | Not Null | 文章标题 (冗余存储用于列表展示) |
| `externalId` | text | Nullable | 关联 Supabase 的文章 ID |
| `platform` | varchar | Default 'wordpress' | 'wordpress' 或 'manual' |
| `status` | varchar | Default 'scheduled' | 'scheduled' 或 'published' |
| `publishDate` | date | Not Null | 计划发布日期 |
| `createdAt` | timestamp | Default Now | 创建时间 |

### 2.5 SEO 数据

#### `inquiry_stat`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 主键 |
| `tenantId` | text | FK -> tenant.id | 关联租户 |
| `period` | date | Not Null | 统计日期 |
| `count` | integer | Default 0 | 询盘数量 |
| `createdAt` | timestamp | Default Now | 创建时间 |

#### `traffic_stat`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 主键 |
| `tenantId` | text | FK -> tenant.id | 关联租户 |
| `period` | date | Not Null | 统计日期 |
| `clicks` | integer | Default 0 | 自然流量值 |
| `createdAt` | timestamp | Default Now | 创建时间 |

#### `keyword_ranking`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 主键 |
| `tenantId` | text | FK -> tenant.id | 关联租户 |
| `keyword` | text | Not Null | 关键词 |
| `targetUrl` | text | Nullable | 目标网址 |
| `rank` | integer | Nullable | 当前排名 |
| `trend` | varchar | Nullable | 'up', 'down', 'stable' |
| `capturedAt` | timestamp | Default Now | 数据录入时间 |

### 2.6 服务报告

#### `report`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | text | PK | 主键 |
| `tenantId` | text | FK -> tenant.id | 关联租户 |
| `type` | varchar | Not Null | 'diagnosis' 或 'review' |
| `title` | text | Not Null | 报告名称 |
| `fileUrl` | text | Not Null | PDF 下载地址 |
| `createdAt` | timestamp | Default Now | 创建时间 |

---

## 3. API 接口定义

### 3.1 用户端接口 (User API)

#### 仪表盘
*   **GET** `/api/evo/dashboard/overview`
    *   **Response**: `{ siteCount: number, currentMonthInquiries: number, currentMonthArticles: number, latestReport: { title, date } }`

#### 效果看板
*   **GET** `/api/evo/kpi/overview`
    *   **Query**: `tenantId`
    *   **Response**: `{ inquiries: [], traffic: [], keywords: [] }`

#### 内容日历
*   **GET** `/api/evo/posts`
    *   **Query**: `tenantId`, `start` (YYYY-MM-DD), `end` (YYYY-MM-DD)
    *   **Response**: `[{ id, title, publishDate, status, externalId }]`
*   **GET** `/api/evo/posts/preview/{externalId}`
    *   **Response**: `{ title, content, summary }` (Proxy to Supabase)

#### 服务报告
*   **GET** `/api/evo/reports`
    *   **Query**: `tenantId`
    *   **Response**: `{ diagnosis: [], review: [] }`

#### 设置
*   **GET** `/api/evo/settings`
    *   **Query**: `tenantId`
    *   **Response**: `{ account: {...}, brand: {...} }`

### 3.2 管理端接口 (Admin API)

#### 基础数据
*   **GET** `/api/admin/users-with-tenants`
    *   **Response**: `[{ id, name, tenants: [{ id, name }] }]`

#### 数据上传
*   **POST** `/api/admin/dashboard/inquiries`
    *   **Body**: `{ tenantId, data: [{ date, count }] }`
*   **POST** `/api/admin/dashboard/traffic`
    *   **Body**: `{ tenantId, data: [{ date, count }] }`
*   **POST** `/api/admin/dashboard/keywords`
    *   **Body**: `{ tenantId, keywords: [{ keyword, rank, trend... }] }`

#### 排期管理
*   **POST** `/api/admin/calendar/batch-schedule`
    *   **Body**: `{ tenantId, month, schedule: { "01": "supa_id_1" } }`

#### 报告管理
*   **GET** `/api/admin/upload/presign`
    *   **Query**: `filename`, `contentType`
    *   **Response**: `{ url, fields }` (S3 Presigned URL)
*   **POST** `/api/admin/reports`
    *   **Body**: `{ tenantId, type, title, fileUrl }`

#### 设置管理
*   **PUT** `/api/admin/settings`
    *   **Body**: `{ tenantId, companyName, contactEmail, validUntil, brandVoice, ... }`

### 3.3 系统接口 (System API)

*   **GET** `/api/cron/publish`
    *   **Trigger**: Vercel Cron / External Scheduler
    *   **Logic**: Check `content_schedule` -> if `autoPublish` -> Push to WP -> Update Status.
