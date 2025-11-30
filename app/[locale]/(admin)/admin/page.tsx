"use client";

import Link from "next/link";
import { IconDatabaseImport, IconUpload, IconUsers } from "@tabler/icons-react";

export default function AdminHomePage() {
  return (
    <div className="bg-background min-h-screen p-6 md:p-8 text-foreground">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">管理后台</h1>
        <p className="text-sm text-muted-foreground mt-2">数据导入与录入</p>
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
          href="/admin/account"
          className="flex items-start gap-3 rounded-xl border border-border bg-card/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <IconDatabaseImport className="mt-1 h-5 w-5 text-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">用户信息变更</p>
            <p className="text-sm text-muted-foreground mt-1">更新公司/品牌信息</p>
          </div>
        </Link>

        <Link
          href="/admin/admin-data"
          className="flex items-start gap-3 rounded-xl border border-border bg-card/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <IconUpload className="mt-1 h-5 w-5 text-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">管理员上传</p>
            <p className="text-sm text-muted-foreground mt-1">录入 询盘、流量、关键词、文章排期、服务报告信息</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
