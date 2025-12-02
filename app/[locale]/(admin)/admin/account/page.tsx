"use client";

import { useEffect, useMemo, useState } from "react";
import { notify } from "@/lib/notify";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserOption = {
  id: string;
  name: string;
  company?: {
    name?: string | null;
    contactEmail?: string | null;
    validUntil?: string | null;
    cooperationStartDate?: string | null;
    brand?: {
      brandVoice?: string | null;
      productDesc?: string | null;
      targetAudience?: string | null;
    };
  };
};

export default function AccountUpdatePage() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brandVoice: "",
    productDesc: "",
    targetAudience: "",
    contactEmail: "",
    companyName: "",
    validUntil: "",
    cooperationStartDate: "",
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users-with-tenants");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const options = (data.users || []).map((u: any) => ({
          id: u.id,
          name: u.name || u.email || u.id,
          company: u.company,
        }));
        setUsers(options);
        if (options[0]) setSelectedUserId(options[0].id);
      } catch (err) {
        setError("加载用户列表失败");
      }
    };
    loadUsers();
  }, []);

  const currentUser = useMemo(() => users.find((u) => u.id === selectedUserId), [users, selectedUserId]);

  useEffect(() => {
    if (!currentUser) return;
    setForm({
      brandVoice: currentUser.company?.brand?.brandVoice || "",
      productDesc: currentUser.company?.brand?.productDesc || "",
      targetAudience: currentUser.company?.brand?.targetAudience || "",
      contactEmail: currentUser.company?.contactEmail || "",
      companyName: currentUser.company?.name || "",
      validUntil: currentUser.company?.validUntil || "",
      cooperationStartDate: currentUser.company?.cooperationStartDate || "",
    });
  }, [currentUser]);

  const submitSettings = async (form: HTMLFormElement) => {
    if (!selectedUserId) {
      setError("请选择用户");
      return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, ...payload }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("保存成功");
      notify.success("保存成功");
    } catch (err) {
      setError("保存失败，请检查输入");
      notify.error("保存失败，请检查输入");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 text-foreground">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">用户信息变更</h1>
        <p className="text-sm text-muted-foreground">更新公司/品牌信息</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>目标用户</Label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        <form
          className="space-y-4 rounded-xl border border-border bg-background p-6 shadow-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            await submitSettings(e.currentTarget);
          }}
        >
          <h2 className="text-lg font-semibold">设置信息上传</h2>
          <div className="space-y-1">
            <Label>品牌语调</Label>
            <Input
              name="brandVoice"
              placeholder="例如：专业、可信、务实"
              value={form.brandVoice}
              onChange={(e) => setForm((prev) => ({ ...prev, brandVoice: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>核心产品</Label>
            <Input
              name="productDesc"
              placeholder="产品/服务描述"
              value={form.productDesc}
              onChange={(e) => setForm((prev) => ({ ...prev, productDesc: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>客户画像</Label>
            <Input
              name="targetAudience"
              placeholder="目标行业/角色"
              value={form.targetAudience}
              onChange={(e) => setForm((prev) => ({ ...prev, targetAudience: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>联系邮箱</Label>
            <Input
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>公司名称</Label>
            <Input
              name="companyName"
              value={form.companyName}
              onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <Label>有效期至</Label>
              <Input
                name="validUntil"
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>合作开始时间</Label>
              <Input
                name="cooperationStartDate"
                type="date"
                value={form.cooperationStartDate}
                onChange={(e) => setForm((prev) => ({ ...prev, cooperationStartDate: e.target.value }))}
              />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "保存中..." : "保存设置"}
          </Button>
        </form>
      </div>
    </div>
  );
}
