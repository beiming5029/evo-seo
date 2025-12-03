"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/container";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { CountUp } from "@/components/ui/count-up";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

export function CaseStudySection() {
  return (
    <section id="results" className="py-24 bg-white dark:bg-slate-950 overflow-hidden relative">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-6 tracking-tight">
              专为忙碌的B2B团队设计
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              专为您量身打造的SEO：我们提供解决方案，了解您的挑战并专注帮助你快速获得成果。
            </p>

            <ul className="space-y-4 mb-12">
              {[
                "节省 80% 的内容策略时间",
                "6 个月内获得页面自然流量提升 200% 的平均回报",
                "自动合规检测",
                "与团队现有工具无缝集成"
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-8 border-t border-slate-100 dark:border-slate-800 pt-8">
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-baseline">
                  +<CountUp to={180} duration={2} />%
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">自然流量<br/>6个月</div>
              </div>
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-baseline">
                  <CountUp to={6} duration={2} />个月
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">流量翻倍</div>
              </div>
              <div className="group">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-baseline">
                  +<CountUp to={320} duration={2} />%
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">关于询盘<br/>6个月</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-transparent rounded-[2rem] -z-10" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
              <Image
                src="/images/professional-warehouse-logistics-center.png"
                alt="Warehouse Logistics"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />

              {/* Floating Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-xl border border-white/50 dark:border-slate-700/50 shadow-lg"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">月度增长</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">+124.5%</div>
                  </div>
                  <div className="h-10 w-24 flex items-end gap-1">
                    {[40, 65, 50, 80, 60, 90, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex-1 bg-blue-600 rounded-t-sm opacity-80"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
