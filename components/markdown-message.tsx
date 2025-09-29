"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ReactNode } from "react";

interface MarkdownMessageProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownMessage({ content, isStreaming }: MarkdownMessageProps) {
  return (
    <div className="markdown-content prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义渲染组件
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-4 mb-2 text-black dark:text-white">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-3 mb-2 text-black dark:text-white">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mt-2 mb-1 text-black dark:text-white">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 text-gray-800 dark:text-gray-200 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 text-gray-800 dark:text-gray-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-800 dark:text-gray-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-2 text-gray-800 dark:text-gray-200">{children}</li>
          ),
          code: ({ inline, children }: { inline?: boolean; children?: ReactNode }) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-700 dark:text-gray-300">
                  {children}
                </code>
              );
            }
            return (
              <code className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-900 text-sm font-mono overflow-x-auto">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-400 pl-4 my-2 italic text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-black dark:text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 underline hover:text-black dark:hover:text-white"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse" />
      )}
    </div>
  );
}