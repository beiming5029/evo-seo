"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Tenant = { id: string; name: string; siteUrl?: string | null; role?: string };

export function TenantSwitcher({
  value,
  onChange,
  className,
  label = "选择站点",
}: {
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
  label?: string;
}) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/evo/tenants");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setTenants(data.tenants || []);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  useEffect(() => {
    if (!selected && tenants.length) {
      const firstId = tenants[0].id;
      setSelected(firstId);
      onChange?.(firstId);
    }
  }, [selected, tenants, onChange]);

  const options = useMemo(() => tenants, [tenants]);

  return (
    <div className={cn("flex flex-col gap-1 text-sm", className)}>
      <label className="text-xs text-muted-foreground">{label}</label>
      <select
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          onChange?.(e.target.value);
        }}
        disabled={loading || options.length === 0}
      >
        {loading && <option>加载中...</option>}
        {!loading && options.length === 0 && <option>暂无站点</option>}
        {!loading &&
          options.map((t) => (
            <option key={t.id} value={t.id}>
              {t.siteUrl ? `${t.name} - ${t.siteUrl}` : t.name}
            </option>
          ))}
      </select>
    </div>
  );
}
