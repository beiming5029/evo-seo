"use client";

import { useEffect, useRef, useState } from "react";

type BrandConfig = {
  brandVoice?: string | null;
  productDesc?: string | null;
  targetAudience?: string | null;
};

type AccountInfo = {
  companyName?: string | null;
  contactEmail?: string | null;
  siteUrl?: string | null;
  validUntil?: string | null;
};

export default function SettingsPage() {
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedOnce = useRef(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/evo/settings`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBrand(data.brand || null);
      setAccount(data.account || null);
      setError(null);
    } catch (err) {
      setError("加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    load();
  }, []);

  const formattedDate = (date?: string | null) => {
    if (!date) return "未配置";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toISOString().slice(0, 10);
  };

  const brandVoice = brand?.brandVoice || "未填写";
  const productDesc = brand?.productDesc || "未填写";
  const targetAudience = brand?.targetAudience || "未填写";

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">设置</h1>
          <p className="text-sm text-muted-foreground">查看您的账户和品牌信息</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-background p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">品牌知识库</h2>
            <p className="text-sm text-muted-foreground">AI 根据以下信息理解您的品牌和业务</p>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">加载中...</p>
          ) : (
            <div className="mt-4 space-y-4 text-sm text-foreground">
              <div>
                <p className="text-muted-foreground">品牌语调</p>
                <p className="mt-1 text-base">{brandVoice}</p>
              </div>
              <div>
                <p className="text-muted-foreground">核心产品描述</p>
                <p className="mt-1 text-base">{productDesc}</p>
              </div>
              <div>
                <p className="text-muted-foreground">目标客户画像</p>
                <p className="mt-1 text-base">{targetAudience}</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-background p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">账户信息</h2>
            <p className="text-sm text-muted-foreground">您的账户基本信息</p>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">加载中...</p>
          ) : (
            <div className="mt-4 grid gap-3 text-sm text-foreground md:grid-cols-2">
              <div>
                <p className="text-muted-foreground">邮箱</p>
                <p className="mt-1 text-base">{account?.contactEmail || "未配置"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">公司名称</p>
                <p className="mt-1 text-base">{account?.companyName || "未配置"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">站点 URL</p>
                <p className="mt-1 text-base">{account?.siteUrl || "未配置"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">有效期至</p>
                <p className="mt-1 text-base font-semibold">{formattedDate(account?.validUntil)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
