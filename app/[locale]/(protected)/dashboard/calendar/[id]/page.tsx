import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/button";
import { PostCopyActions } from "@/components/post-copy-actions";

type BlogPost = {
  id: number | string;
  title: string;
  slug: string;
  status: string | null;
  publishDate?: string | null;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  tags?: any;
  featuredImage?: string | null;
  tenantName?: string | null;
  tenantSiteUrl?: string | null;
};

const normalizeStatus = (s: string | null | undefined) =>
  s === "published" ? "已发布" : s === "draft" ? "暂停" : "待发布";

async function getPost(id: string): Promise<BlogPost | null> {
  const cookie = headers().get("cookie") || "";
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/blog-posts/${id}`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    ...data,
    publishDate: data.publishDate,
  };
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const post = await getPost(id);

  if (!post) {
    return (
      <div className="p-6 text-sm text-destructive">
        未找到文章
        <div className="mt-3">
          <Button as={Link} href="/dashboard/calendar" variant="outline">
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {post.tenantName || "站点"} {post.tenantSiteUrl ? `- ${post.tenantSiteUrl}` : ""}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">{post.title}</h1>
          <div className="space-x-3 text-sm text-muted-foreground">
            <span>发布日期：{post.publishDate || "未设置"}</span>
            <span>状态：{normalizeStatus(post.status)}</span>
            {post.category && <span>分类：{post.category}</span>}
          </div>
        </div>
        <Button as={Link} href="/dashboard/calendar" variant="outline">
          返回
        </Button>
      </div>

      <PostCopyActions html={post.content || ""} />

      {post.excerpt && <p className="text-base text-foreground">{post.excerpt}</p>}

      <article
        className="prose max-w-none prose-headings:mt-4 prose-p:my-3 prose-li:my-1"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />
    </div>
  );
}
