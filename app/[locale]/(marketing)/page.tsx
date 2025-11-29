import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";
import { generatePageMetadata } from "@/lib/metadata";
import { Container } from "@/components/container";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import {
  Sparkles,
  CalendarRange,
  BarChart3,
  FileText,
  Send,
  Target
} from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "hero" });

  return generatePageMetadata({
    locale,
    path: "",
    title: t("title"),
    description: t("description"),
  });
}

const stats = [
  { label: "平均流量增长", value: "200%" },
  { label: "内容创作时间节省", value: "80%" },
  { label: "企业客户信赖", value: "500+" },
];

const features = [
  {
    title: "AI 驱动的内容创作",
    desc: "基于 SERP 分析的智能内容生成，确保高质文章胜过同行",
    icon: Sparkles,
  },
  {
    title: "透明的内容日历",
    desc: "可视化发布计划，让您随时掌控内容策略的执行进度",
    icon: CalendarRange,
  },
  {
    title: "实时效果监控",
    desc: "专家团队解读数据看板，将复杂的 SEO 指标转化为可行动洞察",
    icon: BarChart3,
  },
  {
    title: "专业策略报告",
    desc: "定期诊断与复盘报告，持续优化您的 SEO 路径",
    icon: FileText,
  },
  {
    title: "一键自动发布",
    desc: "与 WordPress 等 CMS 深度集成，内容自动同步到您的网站",
    icon: Send,
  },
  {
    title: "精准关键词优化",
    desc: "基于竞争分析的关键词调度，帮助您在搜索结果中脱颖而出",
    icon: Target,
  },
];

const bullets = [
  "节省 80% 的内容创作时间",
  "3 个月内自然流量提升可达 200%",
  "专属 SEO 专家团队全程支持",
  "完全透明的工作流程",
  "数据驱动的决策支持",
  "无需 SEO 专业知识即可上手",
];

const caseMetrics = [
  { label: "合作时长", value: "6 个月" },
  { label: "自然流量增长", value: "+320%" },
  { label: "新增询盘", value: "+180%" },
  { label: "发布文章数", value: "48 篇" },
];

export default function Home() {
  return (
    <div className="bg-white text-foreground">
      <main>
        <section className="bg-white">
          <Container className="flex flex-col items-center py-16 md:py-20 text-center">
            <Badge className="text-xs tracking-tight px-4 py-2">B2B 企业的 AI SEO 解决方案</Badge>
            <div className="mt-6 space-y-2">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-foreground">
                超越竞争对手，
              </h1>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-foreground">
                用 AI 创建真正有效的 SEO 内容
              </h1>
            </div>
            <div className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed space-y-1">
              <p>evoSEO 将 360° 竞争分析、AI 内容创作和专家服务完美结合，</p>
              <p>为您提供透明、可控、高效的 SEO 内容系统</p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button className="rounded-full px-6">开始免费试用</Button>
              <Button variant="outline" className="rounded-full px-6" as="a" href="/contact">
                预约演示
              </Button>
            </div>
          </Container>
        </section>

        <section className="border-t border-border/60 bg-muted/50">
          <Container className="grid gap-6 py-10 sm:grid-cols-3 text-center">
            {stats.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <div className="text-4xl font-bold text-foreground">{item.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </Container>
        </section>

        <section id="why" className="bg-white py-14">
          <Container className="flex flex-col items-center text-center gap-4">
            <h2 className="text-3xl md:text-4xl font-black">为什么选择 evoSEO “玻璃盒”模式</h2>
            <p className="text-muted-foreground max-w-3xl">
              不同于传统的“黑盒”外包服务，我们让您全程掌控每一个环节
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
                >
                  <feature.icon className="h-8 w-8 text-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-muted/60 py-14">
          <Container className="grid gap-10 lg:grid-cols-2 items-start">
            <div>
              <h3 className="text-2xl md:text-3xl font-black">专为忙碌的 B2B 企业设计</h3>
              <p className="mt-3 text-muted-foreground">
                我们深知您的困境：SEO 很重要，但团队中没有专职人员。evoSEO 提供完整的托管服务，同时保证透明度和掌控感。
              </p>
              <ul className="mt-6 space-y-3 text-sm text-foreground">
                {bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>实际案例 · 某 B2B 科技公司</span>
                <span className="flex items-center gap-1 text-foreground">
                  <BarChart3 className="h-4 w-4" /> 指标
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                {caseMetrics.map((m) => (
                  <div key={m.label} className="rounded-lg border border-border/60 bg-muted/40 p-3">
                    <div className="text-muted-foreground">{m.label}</div>
                    <div className="text-xl font-semibold text-foreground mt-1">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="cta" className="bg-white py-16">
          <Container className="rounded-2xl border border-border bg-muted/60 p-8 text-center shadow-sm">
            <h3 className="text-2xl md:text-3xl font-black">
              准备好开始提升您的 SEO 效果了吗？
            </h3>
            <p className="mt-3 text-muted-foreground">
              加入 500+ 企业客户的行列，让 AI 和专家团队为您的增长保驾护航
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="px-6 rounded-full">立即开始免费试用</Button>
              <Button variant="outline" className="px-6 rounded-full" as="a" href="/contact">
                联系我们
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              14 天免费试用 · 无需信用卡 · 随时取消
            </p>
          </Container>
        </section>
      </main>
    </div>
  );
}
