"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Tenant = { id: string; name: string | null; siteUrl?: string | null; role?: string };

export function TenantSwitcher({
  tenants,
  value,
  onChange,
  className,
  label = "选择站点",
}: {
  tenants: Tenant[];
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const paramValue = searchParams.get("tenantId") || "";
    const controlledValue = value ?? paramValue;
    if (controlledValue) {
      setSelected(controlledValue);
      return;
    }
    if (!controlledValue && tenants.length) {
      setSelected(tenants[0].id);
      onChange?.(tenants[0].id);
    }
  }, [value, searchParams, tenants, onChange]);

  const options = useMemo(() => tenants, [tenants]);

  const handleChange = (next: string) => {
    setSelected(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("tenantId", next);
    } else {
      params.delete("tenantId");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
    onChange?.(next);
  };

  return (
    <div className={cn("flex flex-col gap-1 text-sm", className)}>
      <label className="text-xs text-muted-foreground">{label}</label>
      <select
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        disabled={options.length === 0}
      >
        {options.length === 0 && <option>暂无站点</option>}
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {t.siteUrl ? `${t.name || "未命名"} - ${t.siteUrl}` : t.name || "未命名"}
          </option>
        ))}
      </select>
    </div>
  );
}
