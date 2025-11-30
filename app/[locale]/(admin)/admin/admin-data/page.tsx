"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TenantOption = { id: string; name: string; siteUrl?: string | null };
type UserOption = { id: string; name: string; tenants: TenantOption[] };
type InquiryRow = { date: string; count: string };
type TrafficRow = { date: string; clicks: string; impressions?: string; ctr?: string; position?: string };
type KeywordRow = { keyword: string; targetUrl: string; rank: string; trend: string };
type DailyArticleRow = { day: number; articleId: string; title?: string; loading?: boolean; error?: string };

type SectionKey = "kpi" | "posts" | "reports";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getDaysInMonth = (month: string) => {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) return 31;
  const year = Number(match[1]);
  const monthNum = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(monthNum)) return 31;
  return new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
};

const buildRowsForMonth = (month: string, prev?: DailyArticleRow[]) => {
  const days = getDaysInMonth(month);
  const prevMap = new Map((prev || []).map((row) => [row.day, row]));
  return Array.from({ length: days }, (_, idx) => {
    const day = idx + 1;
    const existing = prevMap.get(day);
    return existing
      ? { ...existing, loading: false }
      : { day, articleId: "" };
  });
};

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
  const initialMonthRef = useRef(getCurrentMonth());
  const [selectedMonth, setSelectedMonth] = useState(initialMonthRef.current);
  const [articleRows, setArticleRows] = useState<DailyArticleRow[]>(() =>
    buildRowsForMonth(initialMonthRef.current)
  );
  const [saving, setSaving] = useState(false);
  const fetchedOnce = useRef(false);
  const articleTitleCache = useRef<Record<string, string>>({});

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

  useEffect(() => {
    setArticleRows((prev) => buildRowsForMonth(selectedMonth, prev));
  }, [selectedMonth]);

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

  const updateArticleRow = (day: number, updater: (row: DailyArticleRow) => DailyArticleRow) => {
    setArticleRows((prev) => prev.map((row) => (row.day === day ? updater(row) : row)));
  };

  const handleArticleIdChange = (day: number, value: string) => {
    updateArticleRow(day, (row) => ({
      ...row,
      articleId: value,
      error: undefined,
      title: value !== row.articleId ? undefined : row.title,
    }));
  };

  const previewArticle = async (day: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      updateArticleRow(day, (row) => ({ ...row, title: undefined, error: undefined, loading: false }));
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      updateArticleRow(day, (row) => ({ ...row, title: undefined, error: "请输入数字 ID", loading: false }));
      return;
    }
    const cached = articleTitleCache.current[trimmed];
    if (cached) {
      updateArticleRow(day, (row) => ({ ...row, title: cached, error: undefined, loading: false }));
      return;
    }
    updateArticleRow(day, (row) => ({ ...row, loading: true, error: undefined }));
    try {
      const res = await fetch(`/api/admin/dashboard/posts?articleId=${Number(trimmed)}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "校验失败");
      }
      const data = await res.json();
      const title = data?.article?.title || `文章 ${trimmed}`;
      articleTitleCache.current[trimmed] = title;
      updateArticleRow(day, (row) => ({ ...row, loading: false, title, error: undefined }));
    } catch (err: any) {
      updateArticleRow(day, (row) => ({
        ...row,
        loading: false,
        title: undefined,
        error: err?.message || "校验失败，请稍后再试",
      }));
    }
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

  const submitMonthlyPosts = async () => {
    const tenantId = ensureTenantSelected();
    if (!tenantId) {
      setError("请选择关联站点");
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
      setError("请选择有效月份");
      return;
    }
    const filled = articleRows
      .map((row) => ({ ...row, numericId: Number(row.articleId.trim()) }))
      .filter((row) => row.articleId.trim().length > 0);
    if (!filled.length) {
      setError("请至少填写一个文章 ID");
      return;
    }
    const invalid = filled.filter((row) => !Number.isFinite(row.numericId));
    if (invalid.length) {
      setError("文章 ID 需为数字");
      return;
    }
    try {
      setSaving(true);
      clearAlerts();
      const res = await fetch("/api/admin/dashboard/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          month: selectedMonth,
          articles: filled.map((row) => ({
            day: row.day,
            articleId: row.numericId,
          })),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "提交失败");
      }
      const data = await res.json();
      setMessage(`已保存当月排期（${data?.daysHandled ?? filled.length} 天）`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err?.message || "提交失败，请检查文章 ID");
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
        <p className="text-sm text-muted-foreground">录入 询盘、流量、关键词、文章排期、服务报告信息</p>
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
        <TabButton value="posts" label="文章上传表单" />
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
                  <Button variant="simple" onClick={() => setInquiryRows([{ date: "", count: "" }])}>
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
                    <Button variant="simple" onClick={() => setTrafficRows([{ date: "", clicks: "" }])}>
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
                    <Button
                      variant="simple"
                      onClick={() => setKeywordRows([{ keyword: "", targetUrl: "", rank: "", trend: "stable" }])}
                    >
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
            className="space-y-5 rounded-xl border border-border bg-white p-6 shadow-sm"
            onSubmit={async (e) => {
              e.preventDefault();
              await submitMonthlyPosts();
            }}
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">文章上传表单</h2>
              <p className="text-sm text-muted-foreground">
                选择月份后为当月每天填写文章 ID（Supabase），系统将自动读取标题便于核对，建议一次填满 28~31 条。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>月份</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">自动生成当月 {articleRows.length} 天的上传列表</p>
              </div>
              <div className="space-y-1">
                <Label>账号/网站</Label>
                <p className="text-xs text-muted-foreground">
                  目标用户与关联站点已在顶部选择，提交时将写入对应站点的排期。
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/30 p-3 md:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium text-foreground">当月文章 ID 列表（共 {articleRows.length} 天）</div>
                <Button
                  type="button"
                  variant="simple"
                  onClick={() => {
                    articleTitleCache.current = {};
                    setArticleRows(buildRowsForMonth(selectedMonth));
                  }}
                >
                  清空当月填写
                </Button>
              </div>

              <div className="grid gap-2">
                {articleRows.map((row) => (
                  <div
                    key={row.day}
                    className="grid grid-cols-[72px_1fr] items-start gap-3 rounded-md border border-border/70 bg-white px-3 py-2 shadow-sm md:px-4 md:py-3"
                  >
                    <div className="flex flex-col justify-center text-sm font-semibold text-muted-foreground">
                      <span>{row.day} 号</span>
                    </div>
                    <div className="space-y-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={row.articleId}
                        onChange={(e) => handleArticleIdChange(row.day, e.target.value)}
                        onBlur={(e) => previewArticle(row.day, e.target.value)}
                        placeholder="输入文章 ID（数字）"
                      />
                      {row.loading && <p className="text-xs text-muted-foreground">校验中...</p>}
                      {row.title && !row.loading && (
                        <p className="text-xs text-foreground">
                          标题：{row.title}
                        </p>
                      )}
                      {row.error && !row.loading && (
                        <p className="text-xs text-destructive">{row.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              保存当月文章排期
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
