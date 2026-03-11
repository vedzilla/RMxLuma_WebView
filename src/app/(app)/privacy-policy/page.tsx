import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-text mb-6 mt-8">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-text mb-3 mt-8 pb-2 border-b border-border">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-text mb-2 mt-6">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-subtle leading-relaxed mb-4">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-brand hover:text-brand-hover underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-4 space-y-1 text-subtle">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1 text-subtle">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-text">{children}</strong>
  ),
  hr: () => <hr className="border-border my-8" />,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left font-semibold text-text py-2 px-3 border-b border-border bg-surface">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="py-2 px-3 border-b border-border text-subtle">{children}</td>
  ),
};

export default function PrivacyPolicyPage() {
  const filePath = path.join(process.cwd(), 'public', 'privacy-policy.md');
  const content = fs.readFileSync(filePath, 'utf8');

  return (
    <div className="py-12 px-[18px]">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/discover"
          className="inline-flex items-center text-sm text-subtle hover:text-brand mb-6 transition-colors"
        >
          ← Back to Discover
        </Link>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow px-8 py-10">
          <ReactMarkdown components={components}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
