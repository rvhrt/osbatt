'use client';
import { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Code2,
  FileText,
  Presentation,
  ChevronRight,
} from 'lucide-react';
import type { Activity } from '@/lib/model';
import SlideImage from './slide-image';
import InsertMenu from './insert-menu';
import Markdown from './markdown';
import MarkdownField from './markdown-field';
const icons = { presentation: Presentation, theory: FileText, coding: Code2 };
export default function ActivityRow({
  activity,
  index,
  count,
  onSave,
  onMove,
  onRemove,
  onInsert,
  initiallyOpen = false,
}: {
  activity: Activity;
  index: number;
  count: number;
  onSave: (a: Activity) => void;
  onMove: (offset: number) => void;
  onRemove: () => void;
  onInsert: (kind: 'theory' | 'coding', offset: number) => void;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [kind, setKind] = useState(activity.kind);
  const [starter, setStarter] = useState(
    activity.starter ?? '#include <stdio.h>\n\nint main(void) {\n    return 0;\n}\n',
  );
  const [error, setError] = useState('');
  const Icon = icons[activity.kind];
  return (
    <div className="activity">
      <div className="activity-toolbar">
        <button
          className="activity-summary"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="activity-number">{String(index + 1).padStart(2, '0')}</span>
          {activity.slide ? <SlideImage slide={activity.slide} thumbnail /> : <Icon size={17} />}
          <strong>
            <Markdown inline>{activity.title}</Markdown>
          </strong>
          <span className="muted">{activity.kind}</span>
          <ChevronRight size={16} className={open ? 'rotated' : ''} />
        </button>
        <div className="activity-controls">
          <InsertMenu title={activity.title} onInsert={onInsert} />
          <button
            className="icon-button"
            aria-label={`Move ${activity.title} up`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUp size={15} />
          </button>
          <button
            className="icon-button"
            aria-label={`Move ${activity.title} down`}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDown size={15} />
          </button>
          <button
            className="icon-button"
            aria-label={`Remove ${activity.title}`}
            onClick={() => {
              if (
                confirm(
                  `Remove “${activity.title}” from this project? Past rehearsals will keep their copy.`,
                )
              )
                onRemove();
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {open && (
        <form
          className="activity-form"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const title = String(data.get('title')).trim();
            if (!title) return;
            onSave({ ...activity, title, body: String(data.get('body')), kind, starter });
            setOpen(false);
          }}
        >
          {activity.slide && (
            <div className="activity-slide-preview">
              <SlideImage slide={activity.slide} />
              <p className="muted">
                {activity.slide.filename} · original page {activity.slide.page}
              </p>
            </div>
          )}
          <MarkdownField
            label="Title"
            name="title"
            inline
            required
            maxLength={150}
            defaultValue={activity.title}
          />
          <label>
            Section type
            <select value={kind} onChange={(e) => setKind(e.target.value as Activity['kind'])}>
              <option value="presentation">Presentation only</option>
              <option value="theory">Theory answer</option>
              <option value="coding">C programming</option>
            </select>
          </label>
          <MarkdownField
            label={activity.slide ? 'Additional instructions' : 'Content'}
            name="body"
            defaultValue={activity.body}
          />
          {kind === 'coding' && (
            <>
              <label>
                Upload starter file
                <input
                  type="file"
                  accept=".c,text/x-c,text/plain"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (!file.name.endsWith('.c') || file.size > 256 * 1024) {
                      setError('Choose a .c file no larger than 256 KB.');
                      return;
                    }
                    try {
                      setStarter(await file.text());
                      setError('');
                    } catch {
                      setError('Could not read the starter file.');
                    }
                  }}
                />
              </label>
              <label>
                Starter file · main.c
                <textarea
                  className="code-input"
                  value={starter}
                  onChange={(e) => setStarter(e.target.value)}
                  rows={8}
                />
              </label>
              <p className="muted starter-note">This preview uses one file named main.c.</p>
            </>
          )}
          {error && (
            <p role="alert" className="import-error">
              {error}
            </p>
          )}
          <button className="button primary">Save section</button>
        </form>
      )}
    </div>
  );
}
