'use client';
import { useId, useRef, useState } from 'react';
import Markdown from './markdown';
export default function MarkdownField({
  label,
  name,
  defaultValue = '',
  inline = false,
  required = false,
  maxLength,
  autoFocus = false,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  inline?: boolean;
  required?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const input = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const id = useId();
  function wrap(before: string, after: string) {
    const node = input.current;
    if (!node) return;
    const start = node.selectionStart ?? value.length;
    const end = node.selectionEnd ?? start;
    const selected = value.slice(start, end) || 'text';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    if (maxLength && next.length > maxLength) return;
    setValue(next);
    requestAnimationFrame(() => {
      node.focus();
      node.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }
  const props = {
    id,
    name,
    required,
    maxLength,
    autoFocus,
    placeholder,
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValue(event.target.value),
  };
  return (
    <div className="markdown-field">
      <label htmlFor={id}>{label}</label>
      <div className="markdown-toolbar" role="group" aria-label={`${label} formatting`}>
        <button type="button" onClick={() => wrap('**', '**')} aria-label="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => wrap('*', '*')} aria-label="Italic">
          <em>I</em>
        </button>
        <button type="button" onClick={() => wrap('`', '`')} aria-label="Inline code">
          {'< >'}
        </button>
        {!inline && (
          <>
            <button type="button" onClick={() => wrap('[', '](https://example.com)')}>
              Link
            </button>
            <button type="button" onClick={() => wrap('\n- ', '')}>
              List
            </button>
            <button type="button" onClick={() => wrap('\n```c\n', '\n```\n')}>
              Code block
            </button>
          </>
        )}
        <span>Markdown</span>
      </div>
      {inline ? (
        <input
          {...props}
          ref={(node) => {
            input.current = node;
          }}
        />
      ) : (
        <textarea
          {...props}
          ref={(node) => {
            input.current = node;
          }}
          rows={5}
        />
      )}
      <details className="markdown-preview">
        <summary>{label} preview</summary>
        <div>
          {value ? (
            <Markdown inline={inline}>{value}</Markdown>
          ) : (
            <span className="muted">No content</span>
          )}
        </div>
      </details>
    </div>
  );
}
