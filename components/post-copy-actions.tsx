"use client";

import { useState } from "react";
import { Button } from "@/components/button";

type Props = {
  html: string;
};

// 简易 HTML -> Markdown 转换，尽量保留结构与间距
function htmlToMarkdown(html: string): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");

  const joinChildren = (node: Element, sep = " ") =>
    Array.from(node.childNodes)
      .map(serialize)
      .filter(Boolean)
      .join(sep)
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .trim();

  const serialize = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node as Text).data.replace(/\s+/g, " ");
    }
    if (!(node instanceof HTMLElement)) return "";
    const tag = node.tagName.toLowerCase();

    switch (tag) {
      case "h1": {
        const content = joinChildren(node);
        return content ? `# ${content}\n\n` : "";
      }
      case "h2": {
        const content = joinChildren(node);
        return content ? `## ${content}\n\n` : "";
      }
      case "h3": {
        const content = joinChildren(node);
        return content ? `### ${content}\n\n` : "";
      }
      case "p":
      case "div":
      case "section":
      case "article":
      case "header":
      case "footer":
      case "main": {
        const content = joinChildren(node);
        return content ? `${content}\n\n` : "";
      }
      case "strong":
      case "b": {
        const content = joinChildren(node, "");
        return `**${content}**`;
      }
      case "em":
      case "i": {
        const content = joinChildren(node, "");
        return `*${content}*`;
      }
      case "br":
        return "\n";
      case "ul": {
        const items = Array.from(node.children)
          .map((li) => `- ${serialize(li).trim()}`)
          .filter(Boolean)
          .join("\n");
        return items ? `${items}\n\n` : "";
      }
      case "ol": {
        const items = Array.from(node.children)
          .map((li, idx) => `${idx + 1}. ${serialize(li).trim()}`)
          .filter(Boolean)
          .join("\n");
        return items ? `${items}\n\n` : "";
      }
      case "li": {
        const content = joinChildren(node);
        return content;
      }
      case "a": {
        const href = node.getAttribute("href") || "";
        const content = joinChildren(node, "");
        return `[${content || href}](${href})`;
      }
      case "img": {
        const alt = node.getAttribute("alt") || "";
        const src = node.getAttribute("src") || "";
        return `![${alt}](${src})`;
      }
      case "code": {
        const content = joinChildren(node, "");
        return `\`${content}\``;
      }
      case "pre": {
        const content = joinChildren(node, "\n");
        return `\n\`\`\`\n${content}\n\`\`\`\n\n`;
      }
      default:
        return joinChildren(node);
    }
  };

  const body = doc.body;
  return Array.from(body.childNodes)
    .map(serialize)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function PostCopyActions({ html }: Props) {
  const [copied, setCopied] = useState<"html" | "md" | null>(null);

  const copyText = async (text: string, type: "html" | "md") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("copy failed", error);
    }
  };

  const markdown = htmlToMarkdown(html);

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => copyText(html, "html")}>
        {copied === "html" ? "已复制 HTML" : "复制为 HTML"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => copyText(markdown, "md")}>
        {copied === "md" ? "已复制 Markdown" : "复制为 Markdown"}
      </Button>
    </div>
  );
}
