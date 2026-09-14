'use client';
import Editor, { loader } from '@monaco-editor/react';
loader.config({ paths: { vs: '/monaco/vs' } });
export default function CodeEditor({
  value,
  onChange,
  theme,
}: {
  value: string;
  onChange: (value: string) => void;
  theme: 'dark' | 'light';
}) {
  return (
    <Editor
      height="100%"
      language="c"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      loading={<p className="muted">Loading editor…</p>}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 23,
        padding: { top: 20 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        ariaLabel: 'C source editor',
        renderLineHighlight: 'none',
      }}
    />
  );
}
