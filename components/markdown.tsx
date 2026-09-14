import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export default function Markdown({
  children,
  inline = false,
}: {
  children: string;
  inline?: boolean;
}) {
  const content = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      allowedElements={inline ? ['strong', 'em', 'code', 'del', 'br'] : undefined}
      disallowedElements={inline ? undefined : ['img']}
      unwrapDisallowed
      components={{
        a: ({ href, children }) =>
          href ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ) : (
            <span>{children}</span>
          ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
  return inline ? (
    <span className="markdown-inline">{content}</span>
  ) : (
    <div className="markdown">{content}</div>
  );
}
