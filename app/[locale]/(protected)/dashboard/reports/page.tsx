"use client";

import { useMemo, useState, useEffect } from "react";
import { TenantSwitcher } from "@/components/tenant-switcher";
import { FileDown, FileText } from "lucide-react";

type Report = {
  id: string;
  title: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  fileUrl: string;
  createdAt: string;
};

export default function ReportsPage() {
  const [tenantId, setTenantId] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (tenant: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/evo/reports?tenantId=${tenant}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setReports(data.reports || []);
      setError(null);
    } catch (err: any) {
      setError("加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantId) return;
    load(tenantId);
  }, [tenantId]);

  const grouped = useMemo(() => {
    return {
      diagnosis: reports.filter((r) => r.type === "diagnosis"),
      review: reports.filter((r) => r.type === "review"),
    };
  }, [reports]);

  const renderList = (items: Report[]) => {
    if (loading) return <p className="text-sm text-muted-foreground">加载中...</p>;
    if (!items.length)
      return (
        <div className="flex min-h-[80px] items-center rounded-xl bg-background/70 px-4 py-3 text-sm text-muted-foreground shadow-sm">
          暂无报告
        </div>
      );
    return (
      <div className="mt-3 space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="flex min-h-[86px] items-center justify-between rounded-xl bg-background/70 px-4 py-3 text-sm shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.periodStart}</p>
              </div>
            </div>
            <a
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <FileDown className="h-5 w-5" />
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">服务报告</h1>
          <p className="text-sm text-muted-foreground">
            这里是您的 evoSEO 专家团队为您出具的深度报告。
          </p>
        </div>
        <div className="w-72">
          <TenantSwitcher value={tenantId} onChange={setTenantId} />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <section className="rounded-2xl bg-muted/40 p-4">
          <h3 className="text-lg font-semibold text-foreground">策略诊断报告</h3>
          <div className="mt-3">{renderList(grouped.diagnosis)}</div>
        </section>

        <section className="rounded-2xl bg-muted/40 p-4">
          <h3 className="text-lg font-semibold text-foreground">双月度复盘报告</h3>
          <div className="mt-3">{renderList(grouped.review)}</div>
        </section>
      </div>
    </div>
  );
}
