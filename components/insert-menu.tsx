'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, Code2, FileText } from 'lucide-react';
export default function InsertMenu({
  title,
  onInsert,
}: {
  title: string;
  onInsert: (kind: 'theory' | 'coding', offset: number) => void;
}) {
  const [position, setPosition] = useState<0 | 1 | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const id = useId();
  useEffect(() => {
    if (position === null) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setPosition(null);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [position]);
  return (
    <div
      className="insert-control"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPosition(null);
      }}
    >
      {([0, 1] as const).map((offset) => (
        <button
          key={offset}
          className="button insert-toggle"
          aria-label={`Insert ${offset === 0 ? 'above' : 'below'} ${title}`}
          aria-haspopup="menu"
          aria-expanded={position === offset}
          aria-controls={position === offset ? id : undefined}
          onClick={(event) => {
            trigger.current = event.currentTarget;
            setPosition((old) => (old === offset ? null : offset));
          }}
        >
          {offset === 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}Insert{' '}
          {offset === 0 ? 'above' : 'below'}
        </button>
      ))}
      {position !== null && (
        <div
          id={id}
          key={position}
          className="insert-menu"
          role="menu"
          aria-label={`Insert ${position === 0 ? 'above' : 'below'} ${title}`}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setPosition(null);
              trigger.current?.focus();
            }
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              event.preventDefault();
              const items = [
                ...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
              ];
              const current = items.indexOf(document.activeElement as HTMLButtonElement);
              const index =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? items.length - 1
                    : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
                      items.length;
              items[index]?.focus();
            }
          }}
        >
          {(['theory', 'coding'] as const).map((kind, index) => (
            <button
              key={kind}
              ref={(node) => {
                if (node && index === 0) node.focus();
              }}
              role="menuitem"
              onClick={() => {
                onInsert(kind, position);
                setPosition(null);
                trigger.current?.focus();
              }}
            >
              {kind === 'theory' ? <FileText size={15} /> : <Code2 size={15} />}
              {kind === 'theory' ? 'Theory' : 'Coding'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
