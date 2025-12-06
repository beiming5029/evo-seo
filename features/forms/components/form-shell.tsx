"use client";

import * as React from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { useTranslations } from 'next-intl';

import { Form } from "@/components/ui/form";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

interface FormShellProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  title: string;
  description?: string;
  onSubmit: (values: TFieldValues) => Promise<void> | void;
  children: React.ReactNode;
  submitText: string;
  submitLoadingText?: string;
  isLoading?: boolean;
  error?: string | null;
  footer?: React.ReactNode;
  className?: string;
  headerSlot?: React.ReactNode;
  socialSlot?: React.ReactNode;
}

export function FormShell<TFieldValues extends FieldValues>({
  form,
  title,
  description,
  onSubmit,
  children,
  submitText,
  submitLoadingText,
  isLoading,
  error,
  footer,
  className,
  headerSlot,
  socialSlot,
}: FormShellProps<TFieldValues>) {
  const t = useTranslations('auth.social');
  const headerContent = headerSlot !== undefined ? headerSlot : <Logo />;

  return (
    <Form {...form}>
      <div
        className={cn(
          "relative flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:flex-none lg:px-10 xl:px-12",
          className
        )}
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/60 dark:shadow-black/30">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-white/20 to-white/5 dark:from-white/10 dark:via-white/5 dark:to-slate-900/30" />
          <div className="pointer-events-none absolute -left-16 -top-12 h-32 w-32 rounded-full bg-blue-500/20 blur-[90px]" />
          <div className="pointer-events-none absolute -right-12 bottom-0 h-28 w-28 rounded-full bg-indigo-500/20 blur-[100px]" />
          <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.08]" />

          <div className="relative z-10 p-8 sm:p-10">
            <div className="flex items-center justify-between gap-3">
              {headerContent ? <div className="flex items-center gap-3">{headerContent}</div> : <div className="h-9" />}
              <span className="rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 ring-1 ring-white/70 backdrop-blur-sm dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
                AI Ready
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-bold leading-9 tracking-tight text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {title}
              </span>
            </h2>
            {description ? (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            ) : null}

            <div className="mt-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {children}

                {error ? (
                  <div className="rounded-xl border border-red-200/80 bg-red-50/70 px-3 py-3 text-sm font-medium text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    {error}
                  </div>
                ) : null}

                <Button
                  className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? submitLoadingText ?? submitText : submitText}
                </Button>

                {footer}
              </form>
            </div>

            {socialSlot ? (
              <div className="mt-10">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-white/70 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs font-semibold uppercase tracking-[0.22em]">
                    <span className="rounded-full bg-white/90 px-4 py-1 text-muted-foreground shadow-sm ring-1 ring-white/60 backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-200 dark:ring-slate-700">
                      {t('or')}
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">{socialSlot}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Form>
  );
}
