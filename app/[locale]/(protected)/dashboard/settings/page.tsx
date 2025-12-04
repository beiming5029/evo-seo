"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LoadingIndicator } from "@/components/loading-indicator";

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
  const t = useTranslations("dashboard.settingsPage");
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
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedDate = (date?: string | null) => {
    if (!date) return t("notSet");
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toISOString().slice(0, 10);
  };

  const brandVoice = brand?.brandVoice || t("notSet");
  const productDesc = brand?.productDesc || t("notSet");
  const targetAudience = brand?.targetAudience || t("notSet");

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("brandDesc")}</p>
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
            <h2 className="text-xl font-semibold text-foreground">{t("brandTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("brandDesc")}</p>
          </div>
          {loading ? (
           <div className="py-1">
              <LoadingIndicator label={t("loading")} className="border-0 bg-transparent px-0 shadow-none" rounded={false} />
            </div>
          ) : (
            <div className="mt-4 space-y-4 text-sm text-foreground">
              <div>
                <p className="text-muted-foreground">{t("brandVoice")}</p>
                <p className="mt-1 text-base">{brandVoice}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("productDesc")}</p>
                <p className="mt-1 text-base">{productDesc}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("targetAudience")}</p>
                <p className="mt-1 text-base">{targetAudience}</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-background p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">{t("accountTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("accountDesc")}</p>
          </div>
          {loading ? (
           <div className="py-1">
              <LoadingIndicator label={t("loading")} className="border-0 bg-transparent px-0 shadow-none" rounded={false} />
            </div>
          ) : (
            <div className="mt-4 grid gap-3 text-sm text-foreground md:grid-cols-2">
              <div>
                <p className="text-muted-foreground">{t("email")}</p>
                <p className="mt-1 text-base">{account?.contactEmail || t("notSet")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("company")}</p>
                <p className="mt-1 text-base">{account?.companyName || t("notSet")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("site")}</p>
                <p className="mt-1 text-base">{account?.siteUrl || t("notSet")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("validUntil")}</p>
                <p className="mt-1 text-base">{formattedDate(account?.validUntil)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
