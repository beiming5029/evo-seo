/**
 * 简易测试脚本：将 doc/blog_posts_rows.json 的文章推送到本地 WordPress
 *
 * 使用方法（在项目根目录执行）：
 *   WP_SITE_URL=http://wordpress-test-site.local \
 *   WP_USERNAME=admin \
 *   WP_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *   pnpm tsx scripts/publish-wp-test.ts
 *
 * 说明：
 * - 默认从 doc/blog_posts_rows.json 读取所有文章并逐条创建为已发布状态。
 * - 需要 WordPress 已开启应用密码（Basic Auth）。
 * - 如需只发一篇，可修改 `slice(0, 1)` 之类的过滤。
 */

import fs from "fs";
import path from "path";

const SITE_URL = process.env.WP_SITE_URL || "http://wordpress-test-site.local";
const USERNAME = 'api-tester';
const APP_PASSWORD = 'V3VX YtD4 BuSv MSed PSFb UzA7';
const POSTS_JSON = path.join(process.cwd(), "doc", "blog_posts_rows.json");

if (!USERNAME || !APP_PASSWORD) {
  console.error("缺少 WP_USERNAME 或 WP_APP_PASSWORD 环境变量");
  process.exit(1);
}

async function publishPost(post: any) {
  const endpoint = `${SITE_URL.replace(/\/$/, "")}/wp-json/wp/v2/posts`;
  const auth = Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString("base64");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      title: post.title,
      content: post.content || post.excerpt || "",
      status: "publish",
      excerpt: post.excerpt || "",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`发布失败 ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data?.link || data?.guid?.rendered || "";
}

async function main() {
  const raw = fs.readFileSync(POSTS_JSON, "utf-8");
  const rows = JSON.parse(raw);

  // 如需只发一篇，改为 rows.slice(0, 1)
  const posts = Array.isArray(rows) ? rows : [];
  console.log(`即将推送 ${posts.length} 篇文章到 ${SITE_URL}`);

  for (const p of posts) {
    try {
      const link = await publishPost(p);
      console.log(`✅ 发布成功: ${p.title} -> ${link}`);
    } catch (err: any) {
      console.error(`❌ 发布失败: ${p.title}`, err?.message || err);
    }
  }
}

main().catch((err) => {
  console.error("脚本异常", err);
  process.exit(1);
});
