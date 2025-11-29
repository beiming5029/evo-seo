"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TenantOption = { id: string; name: string };
type UserOption = { id: string; name: string; tenants: TenantOption[] };
type InquiryRow = { date: string; count: string };
type TrafficRow = { date: string; clicks: string };
type KeywordRow = { keyword: string; targetUrl: string; rank: string; trend: string };

type SectionKey = "kpi" | "posts" | "reports";

export default function AdminDataPage() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<SectionKey>("kpi");
  const [seoType, setSeoType] = useState<"inquiries" | "traffic" | "keywords">("inquiries");
  const [inquiryRows, setInquiryRows] = useState<InquiryRow[]>([{ date: "", count: "" }]);
  const [trafficRows, setTrafficRows] = useState<TrafficRow[]>([{ date: "", clicks: "" }]);
  const [keywordRows, setKeywordRows] = useState<KeywordRow[]>([
    { keyword: "", targetUrl: "", rank: "", trend: "stable" },
  ]);
  const [saving, setSaving] = useState(false);
  const fetchedOnce = useRef(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users-with-tenants");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUsers(data.users || []);
        if (data.users?.[0]) {
          setSelectedUserId(data.users[0].id);
          if (data.users[0].tenants?.[0]) setSelectedTenantId(data.users[0].tenants[0].id);
        }
      } catch (err) {
        setError("加载用户列表失败");
      }
    };
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    loadUsers();
  }, []);

  const tenantOptions = useMemo(
    () =>
      (users.find((u) => u.id === selectedUserId)?.tenants || []).map((t) => ({
        id: t.id,
        name: t.siteUrl ? `${t.name} - ${t.siteUrl}` : t.name,
      })),
    [users, selectedUserId]
  );

  const ensureTenantSelected = () => {
    if (!selectedTenantId && tenantOptions[0]) {
      setSelectedTenantId(tenantOptions[0].id);
      return tenantOptions[0].id;
    }
    return selectedTenantId;
  };

  const clearAlerts = () => {
    setMessage(null);
    setError(null);
  };

  const submitSeo = async () => {
    const tenantId = ensureTenantSelected();
    if (!tenantId) {
      setError("请选择关联站点");
      return;
    }
    try {
      setSaving(true);
      clearAlerts();
      if (seoType === "inquiries") {
        const res = await fetch("/api/admin/dashboard/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            data: inquiryRows
              .filter((r) => r.date)
              .map((r) => ({ date: r.date, count: Number(r.count || 0) })),
          }),
        });
        if (!res.ok) throw new Error(await res.text());
      } else if (seoType === "traffic") {
        const res = await fetch("/api/admin/dashboard/traffic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            data: trafficRows
              .filter((r) => r.date)
              .map((r) => ({
                date: r.date,
                clicks: Number(r.clicks || 0),
                impressions: Number(r.impressions || 0),
                ctr: Number(r.ctr || 0),
                position: Number(r.position || 0),
              })),
          }),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch("/api/admin/dashboard/keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            keywords: keywordRows
              .filter((r) => r.keyword)
              .map((r) => ({
                keyword: r.keyword,
                targetUrl: r.targetUrl || undefined,
                rank: r.rank ? Number(r.rank) : null,
                trend: r.trend || "stable",
              })),
          }),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      setMessage("提交成功");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError("提交失败，请检查输入");
    } finally {
      setSaving(false);
    }
  };

  const submitPost = async (form: HTMLFormElement) => {
    const tenantId = ensureTenantSelected();
    if (!tenantId) {
      setError("请选择关联站点");
      return;
    }
    const payload = {
      tenantId,
      title: (form.elements.namedItem("postTitle") as HTMLInputElement).value,
      summary: (form.elements.namedItem("postSummary") as HTMLInputElement).value,
      contentUrl: (form.elements.namedItem("postContentUrl") as HTMLInputElement).value,
      publishDate: (form.elements.namedItem("postDate") as HTMLInputElement).value,
      status: (form.elements.namedItem("postStatus") as HTMLSelectElement).value,
    };
    try {
      setSaving(true);
      clearAlerts();
      const res = await fetch("/api/admin/dashboard/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("文章已创建/排期");
      setTimeout(() => setMessage(null), 3000);
      form.reset();
    } catch (err) {
      setError("提交失败，请检查必填项");
    } finally {
      setSaving(false);
    }
  };

  const submitReport = async (form: HTMLFormElement) => {
    const tenantId = ensureTenantSelected();
    if (!tenantId) {
      setError("请选择关联站点");
      return;
    }
    const formData = new FormData(form);
    formData.append("tenantId", tenantId);
    try {
      setSaving(true);
      clearAlerts();
      const res = await fetch("/api/admin/reports", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      setMessage("报告上传成功");
      setTimeout(() => setMessage(null), 3000);
      form.reset();
    } catch (err) {
      setError("报告上传失败，请检查文件大小与必填项");
    } finally {
      setSaving(false);
    }
  };

  const submitSettings = async (form: HTMLFormElement) => {
    // 公司信息按用户所属的公司（首个关联站点）保存，无需手选
    const tenantId = ensureTenantSelected();
    if (!tenantId) {
      setError("当前用户未关联公司/站点，无法保存");
      return;
    }
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      setSaving(true);
      clearAlerts();
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, ...payload }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("设置已保存");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError("保存失败，请检查输入");
    } finally {
      setSaving(false);
    }
  };

  const TabButton = ({ value, label }: { value: SectionKey; label: string }) => (
    <Button size="sm" variant={section === value ? "primary" : "outline"} onClick={() => setSection(value)}>
      {label}
    </Button>
  );

  return (
    <div className="space-y-6 p-6 text-foreground">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">管理员上传</h1>
        <p className="text-sm text-muted-foreground">录入 KPI、文章排期、报告与品牌/账户信息</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>目标用户</Label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              const next = users.find((u) => u.id === e.target.value);
              setSelectedTenantId(next?.tenants?.[0]?.id || "");
            }}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>关联站点</Label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
          >
            {tenantOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-sm">
        <TabButton value="kpi" label="数据录入" />
        <TabButton value="posts" label="文章排期上传" />
        <TabButton value="reports" label="服务报告上传" />
      </div>

      {message && (
        <div className="rounded-md border border-green-500/60 bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {section === "kpi" && (
        <div className="grid gap-6">
          <div className="w-full space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="grid gap-3 md:grid-cols-3"></div>
            <div className="flex items-center gap-2">
              {["inquiries", "traffic", "keywords"].map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    seoType === key ? "bg-foreground text-background" : "border border-border"
                  }`}
                  onClick={() => setSeoType(key as any)}
                >
                  {key === "inquiries" && "询盘"}
                  {key === "traffic" && "流量"}
                  {key === "keywords" && "关键词"}
                </button>
              ))}
            </div>

            {seoType === "inquiries" && (
              <div className="space-y-3">
                {inquiryRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[minmax(200px,1fr)_minmax(180px,1fr)_auto] items-center gap-3"
                  >
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        setInquiryRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, date: e.target.value } : r))
                        )
                      }
                      placeholder="日期"
                    />
                    <Input
                      type="number"
                      value={row.count}
                      onChange={(e) =>
                        setInquiryRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, count: e.target.value } : r))
                        )
                      }
                      placeholder="数量"
                    />
                    {inquiryRows.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInquiryRows((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setInquiryRows((prev) => [...prev, { date: "", count: "" }])}>
                    添加一行
                  </Button>
                  {inquiryRows.length > 1 && (
                    <Button variant="ghost" onClick={() => setInquiryRows([{ date: "", count: "" }])}>
                      重置列表
                    </Button>
                  )}
                </div>
              </div>
            )}

            {seoType === "traffic" && (
              <div className="space-y-3">
                {trafficRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[repeat(2,minmax(200px,1fr))_auto] items-center gap-3"
                  >
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        setTrafficRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, date: e.target.value } : r))
                        )
                      }
                      placeholder="日期"
                    />
                    <Input
                      type="number"
                      value={row.clicks}
                      onChange={(e) =>
                        setTrafficRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, clicks: e.target.value } : r))
                        )
                      }
                      placeholder="询盘量"
                    />
                    {trafficRows.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setTrafficRows((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setTrafficRows((prev) => [...prev, { date: "", clicks: "" }])}
                  >
                    添加一行
                  </Button>
                  {trafficRows.length > 1 && (
                    <Button variant="ghost" onClick={() => setTrafficRows([{ date: "", clicks: "" }])}>
                      重置列表
                    </Button>
                  )}
                </div>
              </div>
            )}

            {seoType === "keywords" && (
              <div className="space-y-3">
                {keywordRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[repeat(4,minmax(170px,1fr))_auto] items-center gap-3"
                  >
                    <Input
                      value={row.keyword}
                      onChange={(e) =>
                        setKeywordRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, keyword: e.target.value } : r))
                        )
                      }
                      placeholder="关键词"
                    />
                    <Input
                      value={row.targetUrl}
                      onChange={(e) =>
                        setKeywordRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, targetUrl: e.target.value } : r))
                        )
                      }
                      placeholder="目标网址"
                    />
                    <Input
                      type="number"
                      value={row.rank}
                      onChange={(e) =>
                        setKeywordRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, rank: e.target.value } : r))
                        )
                      }
                      placeholder="排名"
                    />
                    <select
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={row.trend}
                      onChange={(e) =>
                        setKeywordRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, trend: e.target.value } : r))
                        )
                      }
                    >
                      <option value="up">上升</option>
                      <option value="down">下降</option>
                      <option value="stable">持平</option>
                    </select>
                    {keywordRows.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setKeywordRows((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setKeywordRows((prev) => [...prev, { keyword: "", targetUrl: "", rank: "", trend: "stable" }])
                    }
                  >
                    添加一行
                  </Button>
                  {keywordRows.length > 1 && (
                    <Button variant="ghost" onClick={() => setKeywordRows([{ keyword: "", targetUrl: "", rank: "", trend: "stable" }])}>
                      重置列表
                    </Button>
                  )}
                </div>
              </div>
            )}

            <Button onClick={submitSeo} disabled={saving} className="w-full">
              保存数据
            </Button>
          </div>
        </div>
      )}

      {section === "posts" && (
        <div className="grid gap-6">
          <form
            className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm"
            onSubmit={async (e) => {
              e.preventDefault();
              await submitPost(e.currentTarget);
            }}
          >
            <h2 className="text-lg font-semibold">文章排期上传</h2>
            <div className="grid gap-3 md:grid-cols-3"></div>
            <div className="space-y-1">
              <Label>标题</Label>
              <Input name="postTitle" required />
            </div>
            <div className="space-y-1">
              <Label>摘要</Label>
              <Input name="postSummary" />
            </div>
            <div className="space-y-1">
              <Label>内容链接 / 文章 ID</Label>
              <Input name="postContentUrl" required />
            </div>
            <div className="space-y-1">
              <Label>发布日期</Label>
              <Input name="postDate" type="date" required />
            </div>
            <div className="space-y-1">
              <Label>状态</Label>
              <select
                name="postStatus"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                defaultValue="scheduled"
              >
                <option value="scheduled">待发布</option>
                <option value="published">已发布</option>
                <option value="paused">已暂停</option>
              </select>
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              保存文章
            </Button>
          </form>
        </div>
      )}

      {section === "reports" && (
        <div className="grid gap-6">
          <form
            className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm"
            onSubmit={async (e) => {
              e.preventDefault();
              await submitReport(e.currentTarget);
            }}
          >
            <h2 className="text-lg font-semibold">服务报告上传</h2>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <Label>报告名称</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-1">
                <Label>类型</Label>
                <select name="type" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="diagnosis">策略诊断</option>
                  <option value="review">复盘</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>开始日期</Label>
                <Input type="date" name="periodStart" required />
              </div>
              <div className="space-y-1">
                <Label>结束日期</Label>
                <Input type="date" name="periodEnd" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label>上传 PDF（≤10MB）</Label>
              <Input type="file" name="file" accept=".pdf" required />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              上传报告
            </Button>
          </form>
        </div>
      )}

    </div>
  );
}
