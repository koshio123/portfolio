import type { MDXComponents } from "mdx/types";

/** ブログ本文(MDX)の要素にデザインシステムのスタイルを当てる */
const components: MDXComponents = {
  h2: (props) => <h2 className="mt-16 mb-4 text-h2 font-bold" {...props} />,
  h3: (props) => <h3 className="mt-10 mb-3 text-h3 font-bold" {...props} />,
  p: (props) => <p className="my-5" {...props} />,
  ul: (props) => <ul className="my-5 list-disc pl-6" {...props} />,
  ol: (props) => <ol className="my-5 list-decimal pl-6" {...props} />,
  li: (props) => <li className="my-1" {...props} />,
  a: (props) => <a className="underline underline-offset-4" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-6 rounded-lg bg-surface px-6 py-4 text-ink-muted" {...props} />
  ),
  pre: (props) => (
    <pre
      data-theme="night"
      className="my-6 overflow-x-auto rounded-lg bg-bg p-5 font-mono text-sm leading-relaxed text-ink"
      {...props}
    />
  ),
  code: (props) => <code className="font-mono text-[0.9em]" {...props} />,
  hr: () => <hr className="my-12 border-line" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
