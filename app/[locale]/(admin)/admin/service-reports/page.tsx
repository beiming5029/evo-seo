"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notify";

type UserOption = { id: string; name?: string | null; email?: string | null };

export default function ServiceReportUploadPage() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users-with-tenants");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const list =
          data.users?.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
          })) || [];
        setUsers(list);
        if (list[0]) setSelectedUserId(list[0].id);
      } catch {
        setError("加载用户列表失败");
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (form: HTMLFormElement) => {
    if (!selectedUserId) {
      setError("请选择目标账号");
      return;
    }
    const formData = new FormData(form);
    formData.append("userId", selectedUserId);
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      const res = await fetch("/api/admin/reports", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      notify.success("上传成功");
      setMessage("上传成功");
      form.reset();
    } catch (err) {
      notify.error("上传失败，请检查文件与必填项");
      setError("上传失败，请检查文件与必填项");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 text-foreground">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">服务报告上传</h1>
        <p className="text-sm text-muted-foreground">
          报告按公司维度存储，自动记录上传时间，避免跨站点查询性能问题。
        </p>
      </div>

      <form
        className="space-y-4 rounded-xl border border-border bg-background p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmit(e.currentTarget);
        }}
      >
        <div className="space-y-1">
          <Label>目标账号</Label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email || "未命名账号"}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-1">
            <Label>报告名称</Label>
            <Input name="title" required />
          </div>
          <div className="space-y-1">
            <Label>报告类型</Label>
            <select name="type" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              <option value="diagnosis">策略诊断</option>
              <option value="review">复盘</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>上传 PDF（≤10MB）</Label>
          <Input type="file" name="file" accept=".pdf" required />
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "上传中..." : "上传报告"}
        </Button>
      </form>
    </div>
  );
}
