'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Sun,
  Moon,
  Code2,
  FileText,
  Presentation,
  ChevronRight,
  X,
  Play,
  Clock3,
  Folder,
  Terminal,
  Check,
  Pencil,
} from 'lucide-react';
import { Activity, Project, Run, Store, initialStore, readStore } from '@/lib/model';
const CodeEditor = dynamic(() => import('./code-editor'), { ssr: false });
const key = 'osbatt.workspace.v1';
const icons = { presentation: Presentation, theory: FileText, coding: Code2 };
const date = (s: string) =>
  new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function Osbatt() {
  const [store, setStore] = useState<Store>(initialStore);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'projects' | 'history'>('projects');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [index, setIndex] = useState(0);
  const [rehearsal, setRehearsal] = useState<{ project: Project; startedAt: string } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [review, setReview] = useState<Run | null>(null);
  const [saved, setSaved] = useState(false);
  const storageBlocked = useRef(false);
  useEffect(() => {
    try {
      setStore(readStore(localStorage.getItem(key)));
      const t = localStorage.getItem('osbatt.theme');
      if (t === 'light') setTheme(t);
    } catch {
      storageBlocked.current = true;
      setError('Saved data could not be loaded. Storage is paused to protect it.');
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || storageBlocked.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(store));
    } catch {
      setError('Browser storage is unavailable or full. Your latest changes are not saved.');
    }
  }, [store, ready]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (ready)
      try {
        localStorage.setItem('osbatt.theme', theme);
      } catch {
        setError('Your theme preference could not be saved.');
      }
  }, [theme, ready]);
  useEffect(() => {
    if (!rehearsal) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [rehearsal]);
  const project = store.projects.find((p) => p.id === projectId);
  function updateProject(p: Project) {
    setStore((s) => ({
      ...s,
      projects: s.projects.map((old) =>
        old.id === p.id ? { ...p, updatedAt: new Date().toISOString() } : old,
      ),
    }));
  }
  function start(p: Project) {
    setRehearsal({ project: structuredClone(p), startedAt: new Date().toISOString() });
    setAnswers(store.drafts[p.id] ?? {});
    setIndex(0);
    setSaved(false);
  }
  function changeAnswer(value: string) {
    if (!rehearsal) return;
    const next = { ...answers, [rehearsal.project.activities[index].id]: value };
    setAnswers(next);
    setSaved(false);
    setStore((s) => ({ ...s, drafts: { ...s.drafts, [rehearsal.project.id]: next } }));
  }
  function finish() {
    if (!rehearsal) return;
    setStore((s) => ({
      ...s,
      runs: [
        {
          id: crypto.randomUUID(),
          project: rehearsal.project,
          startedAt: rehearsal.startedAt,
          endedAt: new Date().toISOString(),
          answers,
        },
        ...s.runs,
      ],
    }));
    setRehearsal(null);
    setProjectId(null);
    setTab('history');
  }
  const current = rehearsal?.project.activities[index];
  return (
    <div className="app">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => {
            if (!rehearsal) {
              setProjectId(null);
              setReview(null);
            }
          }}
          aria-label="OSBATT home"
        >
          osbatt<span className="brand-dot">.</span>
        </button>
        <span className="top-divider" />
        <span className="top-context">
          {rehearsal ? rehearsal.project.title : 'Teaching workspace'}
        </span>
        <div className="top-right">
          <span className="local-label">Local preview</span>
          <button
            className="icon-button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <span className="avatar" aria-label="Tutor">
            T
          </span>
        </div>
      </header>
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      {!ready ? (
        <main className="dashboard">Loading workspace…</main>
      ) : rehearsal && current ? (
        <>
          <div className="sessionbar">
            <span className="eyebrow">REHEARSAL</span>
            <span>
              {index + 1} / {rehearsal.project.activities.length}
            </span>
            <span className="muted">Only you · drafts saved in this browser</span>
            <button className="button end" onClick={finish}>
              Finish rehearsal
            </button>
          </div>
          <main
            className={`workspace ${current.kind === 'presentation' ? 'presentation-only' : ''}`}
          >
            <section className="question">
              <div className="pane-label">
                {current.kind === 'coding' ? (
                  <Code2 size={15} />
                ) : current.kind === 'theory' ? (
                  <FileText size={15} />
                ) : (
                  <Presentation size={15} />
                )}
                {current.kind === 'presentation'
                  ? 'Presentation'
                  : `${current.kind === 'coding' ? 'Programming' : 'Theory'} question`}
              </div>
              <div className="question-content">
                <span className="eyebrow">{rehearsal.project.title}</span>
                <h1>{current.title}</h1>
                <div className="question-body">{current.body}</div>
                {current.kind === 'coding' && (
                  <div className="constraint">
                    <span className="eyebrow">WORKSPACE</span>
                    <code>main.c · C</code>
                    <p>
                      Use the terminal to compile and run your program once execution is connected.
                    </p>
                  </div>
                )}
              </div>
              <div className="question-footer">Take your time. Work through it together.</div>
            </section>
            {current.kind !== 'presentation' && (
              <section className="answer-pane">
                <div className="pane-label">
                  {current.kind === 'coding' ? (
                    <>
                      <Code2 size={15} /> main.c <span className="right-label">C</span>
                    </>
                  ) : (
                    <>
                      <Pencil size={15} /> Your reasoning
                    </>
                  )}
                </div>
                {current.kind === 'coding' ? (
                  <>
                    <div className="editor">
                      <CodeEditor
                        value={answers[current.id] ?? current.starter ?? ''}
                        onChange={changeAnswer}
                        theme={theme}
                      />
                    </div>
                    <section className="terminal">
                      <div className="pane-label">
                        <Terminal size={15} /> Terminal{' '}
                        <span className="right-label">Not connected</span>
                      </div>
                      <div className="terminal-body">
                        <span className="muted">An isolated C environment will appear here.</span>
                        <p>Terminal execution is not available in this preview.</p>
                        <code>
                          $ <span className="terminal-cursor" />
                        </code>
                      </div>
                    </section>
                  </>
                ) : (
                  <textarea
                    className="theory-input"
                    aria-label="Your answer"
                    placeholder="Start with what you know. Explain your reasoning…"
                    value={answers[current.id] ?? ''}
                    onChange={(e) => changeAnswer(e.target.value)}
                  />
                )}
                <div className="answer-footer">
                  <span className="muted" role="status">
                    {saved ? 'Attempt saved locally' : 'Local draft · not sent to a tutor'}
                  </span>
                  <button
                    className="button primary"
                    disabled={!answers[current.id]?.trim()}
                    onClick={() => setSaved(true)}
                  >
                    {saved ? <Check size={15} /> : null} Save attempt
                  </button>
                </div>
              </section>
            )}
          </main>
          <footer className="session-footer">
            <span className="muted">
              Preview controls · students will follow the host in live sessions
            </span>
            <div className="actions">
              <button
                className="button"
                disabled={index === 0}
                onClick={() => {
                  setIndex((i) => i - 1);
                  setSaved(false);
                }}
              >
                <ArrowLeft size={15} /> Previous
              </button>
              <button
                className="button"
                disabled={index === rehearsal.project.activities.length - 1}
                onClick={() => {
                  setIndex((i) => i + 1);
                  setSaved(false);
                }}
              >
                Next <ArrowRight size={15} />
              </button>
            </div>
          </footer>
        </>
      ) : (
        <main className="dashboard">
          <nav className="tabs" aria-label="Workspace">
            <button
              className={tab === 'projects' ? 'active' : ''}
              onClick={() => {
                setTab('projects');
                setProjectId(null);
                setReview(null);
              }}
            >
              <Folder size={16} />
              Projects
            </button>
            <button
              className={tab === 'history' ? 'active' : ''}
              onClick={() => {
                setTab('history');
                setProjectId(null);
                setReview(null);
              }}
            >
              <Clock3 size={16} />
              History
            </button>
          </nav>
          {review ? (
            <>
              <button className="back" onClick={() => setReview(null)}>
                <ArrowLeft size={15} /> History
              </button>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">LOCAL REHEARSAL · {date(review.endedAt)}</span>
                  <h1>{review.project.title}</h1>
                  <p>Question and answer snapshots from this run.</p>
                </div>
              </div>
              {review.project.activities
                .filter((a) => a.kind !== 'presentation')
                .map((a) => (
                  <section className="review-answer" key={a.id}>
                    <span className="eyebrow">{a.kind}</span>
                    <h2>{a.title}</h2>
                    <p className="question-body">{a.body}</p>
                    <pre>{review.answers[a.id] || 'No answer recorded.'}</pre>
                  </section>
                ))}
            </>
          ) : project ? (
            <>
              <button className="back" onClick={() => setProjectId(null)}>
                <ArrowLeft size={15} /> Projects
              </button>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">PROJECT</span>
                  <h1>{project.title}</h1>
                  <p>{project.description || 'Your next teaching session starts here.'}</p>
                </div>
                <div className="actions">
                  <button className="button" onClick={() => setEditing(true)}>
                    <Pencil size={15} />
                    Edit details
                  </button>
                  <button
                    className="button primary"
                    disabled={!project.activities.length}
                    onClick={() => start(project)}
                  >
                    <Play size={15} />
                    Rehearse
                  </button>
                </div>
              </div>
              <div className="section-heading">
                <h2>
                  Session content <span>{project.activities.length}</span>
                </h2>
                <span className="muted">Live hosting and PDF import are coming next</span>
              </div>
              {project.activities.map((a, i) => (
                <ActivityRow
                  key={a.id}
                  activity={a}
                  index={i}
                  onSave={(next) =>
                    updateProject({
                      ...project,
                      activities: project.activities.map((item) =>
                        item.id === a.id ? next : item,
                      ),
                    })
                  }
                />
              ))}
              {!project.activities.length && (
                <div className="empty">
                  <Presentation size={28} />
                  <h2>A blank canvas.</h2>
                  <p>Add an explanation, theory question or programming exercise.</p>
                </div>
              )}
              <div className="add-content">
                {(['presentation', 'theory', 'coding'] as const).map((kind) => (
                  <button
                    className="button"
                    key={kind}
                    onClick={() =>
                      updateProject({
                        ...project,
                        activities: [
                          ...project.activities,
                          {
                            id: crypto.randomUUID(),
                            kind,
                            title: kind === 'presentation' ? 'New explanation' : 'New question',
                            body: '',
                            ...(kind === 'coding'
                              ? {
                                  starter:
                                    '#include <stdio.h>\n\nint main(void) {\n    return 0;\n}\n',
                                }
                              : {}),
                          },
                        ],
                      })
                    }
                  >
                    <Plus size={15} />
                    {kind === 'presentation'
                      ? 'Explanation'
                      : kind === 'theory'
                        ? 'Theory question'
                        : 'Coding question'}
                  </button>
                ))}
              </div>
            </>
          ) : tab === 'projects' ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">YOUR WORKSPACE</span>
                  <h1>Projects</h1>
                  <p>A place for your slides, questions and good discussions.</p>
                </div>
                <button className="button primary" onClick={() => setCreating(true)}>
                  <Plus size={17} />
                  New project
                </button>
              </div>
              <div className="list-heading">
                <span>PROJECT</span>
                <span>CONTENT</span>
                <span>UPDATED</span>
                <span />
              </div>
              {store.projects.map((p) => (
                <button className="project-row" key={p.id} onClick={() => setProjectId(p.id)}>
                  <div className="project-name">
                    <span className="project-icon">
                      <Presentation size={20} />
                    </span>
                    <div>
                      <strong>{p.title}</strong>
                      <p>{p.description || 'No description yet'}</p>
                    </div>
                  </div>
                  <span className="muted">{p.activities.length} sections</span>
                  <span className="muted">{date(p.updatedAt)}</span>
                  <ChevronRight size={17} />
                </button>
              ))}
              <div className="dashboard-note">
                <span className="small-dot" /> Your projects are saved in this browser. Live
                sessions will be separate runs of a project.
              </div>
            </>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">PAST SESSIONS</span>
                  <h1>History</h1>
                  <p>Return to the questions, and the thinking behind the answers.</p>
                </div>
              </div>
              {!store.runs.length ? (
                <div className="empty">
                  <Clock3 size={30} />
                  <h2>Nothing here just yet.</h2>
                  <p>
                    Finish a project rehearsal to see its saved answers here.
                    <br />
                    Live class sessions will appear here once hosting is connected.
                  </p>
                  <button className="button" onClick={() => setTab('projects')}>
                    Browse projects <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                store.runs.map((run) => (
                  <button className="history-row" key={run.id} onClick={() => setReview(run)}>
                    <div>
                      <strong>{run.project.title}</strong>
                      <p>
                        Local rehearsal ·{' '}
                        {Object.values(run.answers).filter((a) => a.trim()).length} answers
                      </p>
                    </div>
                    <span className="muted">
                      {date(run.endedAt)} ·{' '}
                      {new Date(run.endedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <ChevronRight size={17} />
                  </button>
                ))
              )}
            </>
          )}
          <footer className="dashboard-footer">
            <span>Built for the room.</span>
            <span>OSBATT / interface preview</span>
          </footer>
        </main>
      )}
      {(creating || (editing && project)) && (
        <ProjectDialog
          project={editing ? project : undefined}
          onClose={() => {
            setCreating(false);
            setEditing(false);
          }}
          onSave={(title, description) => {
            if (editing && project) updateProject({ ...project, title, description });
            else {
              const p: Project = {
                id: crypto.randomUUID(),
                title,
                description,
                updatedAt: new Date().toISOString(),
                activities: [],
              };
              setStore((s) => ({ ...s, projects: [...s.projects, p] }));
              setProjectId(p.id);
            }
            setCreating(false);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

function ProjectDialog({
  project,
  onClose,
  onSave,
}: {
  project?: Project;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} aria-labelledby="dialog-title">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const title = String(data.get('title')).trim();
          if (title) onSave(title, String(data.get('description')).trim());
        }}
      >
        <div className="dialog-heading">
          <h2 id="dialog-title">{project ? 'Edit project' : 'New project'}</h2>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <label>
          Project name
          <input
            autoFocus
            required
            maxLength={100}
            name="title"
            defaultValue={project?.title}
            placeholder="e.g. Trees and recursion"
          />
        </label>
        <label>
          Description <span className="muted">(optional)</span>
          <textarea
            name="description"
            maxLength={300}
            defaultValue={project?.description}
            placeholder="What will your students work on?"
          />
        </label>
        <div className="dialog-footer">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary">{project ? 'Save changes' : 'Create project'}</button>
        </div>
      </form>
    </dialog>
  );
}

function ActivityRow({
  activity,
  index,
  onSave,
}: {
  activity: Activity;
  index: number;
  onSave: (a: Activity) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = icons[activity.kind];
  return (
    <div className="activity">
      <button className="activity-summary" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="activity-number">{String(index + 1).padStart(2, '0')}</span>
        <Icon size={17} />
        <strong>{activity.title}</strong>
        <span className="muted">{activity.kind}</span>
        <ChevronRight size={16} className={open ? 'rotated' : ''} />
      </button>
      {open && (
        <form
          className="activity-form"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const title = String(data.get('title')).trim();
            if (!title) return;
            onSave({
              ...activity,
              title,
              body: String(data.get('body')),
              ...(activity.kind === 'coding' ? { starter: String(data.get('starter')) } : {}),
            });
            setOpen(false);
          }}
        >
          <label>
            Title
            <input name="title" required maxLength={150} defaultValue={activity.title} />
          </label>
          <label>
            Content
            <textarea name="body" defaultValue={activity.body} rows={5} />
          </label>
          {activity.kind === 'coding' && (
            <label>
              Starter file · main.c
              <textarea
                className="code-input"
                name="starter"
                defaultValue={activity.starter}
                rows={8}
              />
            </label>
          )}
          <button className="button primary">Save section</button>
        </form>
      )}
    </div>
  );
}
