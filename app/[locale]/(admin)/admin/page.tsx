"use client";

import Link from "next/link";
import { IconDatabaseImport, IconUpload, IconUsers } from "@tabler/icons-react";

export default function AdminHomePage() {
  return (
    <div className="bg-white p-6 md:p-8 text-foreground">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">管理后台</h1>
        <p className="text-sm text-muted-foreground mt-2">数据导入与管理员上传入口</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/users"
          className="flex items-start gap-3 rounded-xl border border-border bg-card/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <IconUsers className="mt-1 h-5 w-5 text-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">用户管理</p>
            <p className="text-sm text-muted-foreground mt-1">搜索用户，查看关联站点，绑定新网站</p>
          </div>
        </Link>

        <Link
          href="/admin/import"
          className="flex items-start gap-3 rounded-xl border border-border bg-card/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <IconDatabaseImport className="mt-1 h-5 w-5 text-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">数据导入</p>
            <p className="text-sm text-muted-foreground mt-1">导入询盘、流量、关键词、KPI 的 CSV/JSON</p>
          </div>
        </Link>

        <Link
          href="/admin/admin-data"
          className="flex items-start gap-3 rounded-xl border border-border bg-card/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <IconUpload className="mt-1 h-5 w-5 text-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">管理员上传</p>
            <p className="text-sm text-muted-foreground mt-1">录入 KPI、文章排期、报告与品牌/账户信息</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
