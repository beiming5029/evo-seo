"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/container";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  Search,
  FileText,
  BarChart3,
  Globe,
  Zap,
  Users
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-slate-50 dark:bg-slate-900/95 relative">
      <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      <Container>
        <motion.div
          {...fadeIn}
          className="text-right mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">我们的服务</h2>
          <div className="h-1 w-20 bg-blue-600 ml-auto mt-4 rounded-full" />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { icon: Search, title: "AI 驱动内容优化", desc: "专业策略指南" },
            { icon: FileText, title: "内容策略制定", desc: "一键部署优发布" },
            { icon: BarChart3, title: "流程技术审核", desc: "精准关键词优化" },
            { icon: Globe, title: "专业策略指南", desc: "专业策略指南" },
            { icon: Zap, title: "一键部署优发布", desc: "一键部署优发布" },
            { icon: Users, title: "精准关键词优化", desc: "精准关键词优化" }
          ].map((service, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <SpotlightCard className="h-full p-8 group hover:shadow-lg transition-shadow duration-300 dark:bg-slate-900 dark:border-slate-800">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300 shadow-sm">
                  <service.icon className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{service.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{service.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
