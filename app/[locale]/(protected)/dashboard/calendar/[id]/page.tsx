import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/button";
import { PostCopyActions } from "@/components/post-copy-actions";

type ScheduleWithArticle = {
  id: string;
  tenantId: string;
  tenantName?: string | null;
  tenantSiteUrl?: string | null;
  title?: string | null;
  summary?: string | null;
  contentUrl?: string | null;
  publishDate?: string | null;
  status?: string | null;
  article?: {
    title?: string | null;
    excerpt?: string | null;
    content?: string | null;
    slug?: string | null;
    status?: string | null;
  } | null;
};

const normalizeStatus = (s: string | null | undefined) =>
  s === "published" ? "已发布" : s === "draft" ? "暂停" : "待发布";

async function getPost(id: string): Promise<ScheduleWithArticle | null> {
  const cookie = headers().get("cookie") || "";
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/evo/posts/${id}`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.post) return null;
  return {
    id: data.post.id,
    tenantId: data.post.tenantId,
    tenantName: data.post.tenantName,
    tenantSiteUrl: data.post.tenantSiteUrl,
    title: data.post.title || data.article?.title,
    summary: data.post.summary || data.article?.excerpt,
    contentUrl: data.post.contentUrl,
    publishDate: data.post.publishDate,
    status: data.post.status,
    article: data.article || null,
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

  const title = post.title || "未命名文章";
  const excerpt = post.summary || post.article?.excerpt || "";
  const content = post.article?.content || "";
  const status = normalizeStatus(post.status);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {post.tenantName || "站点"} {post.tenantSiteUrl ? `- ${post.tenantSiteUrl}` : ""}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <div className="space-x-3 text-sm text-muted-foreground">
            <span>发布日期：{post.publishDate || "未设置"}</span>
            <span>状态：{status}</span>
          </div>
        </div>
        <Button as={Link} href="/dashboard/calendar" variant="outline">
          返回
        </Button>
      </div>

      <PostCopyActions html={content} />

      {excerpt && <p className="text-base text-foreground">{excerpt}</p>}

      <article
        className="prose max-w-none prose-headings:mt-4 prose-p:my-3 prose-li:my-1"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
