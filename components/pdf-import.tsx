'use client';
import { useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { importPdf } from '@/lib/import-pdf';
import type { Activity } from '@/lib/model';
export default function PdfImport({
  onImport,
  disabled = false,
}: {
  onImport: (activities: Activity[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="button" disabled={disabled} onClick={() => setOpen(true)}>
        <Upload size={15} />
        Import PDF
      </button>
      {open && <ImportDialog onImport={onImport} onClose={() => setOpen(false)} />}
    </>
  );
}
function ImportDialog({
  onImport,
  onClose,
}: {
  onImport: (activities: Activity[]) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState('');
  useEffect(() => {
    dialog.current?.showModal();
    return () => controller.current?.abort();
  }, []);
  async function submit() {
    if (!file || busy) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError('');
    setProgress({ done: 0, total: 0 });
    try {
      const activities = await importPdf(
        file,
        (done, total) => setProgress({ done, total }),
        abort.signal,
      );
      if (abort.signal.aborted) return;
      onImport(activities);
      onClose();
    } catch (cause) {
      if (!abort.signal.aborted) {
        setError(
          cause instanceof Error && cause.name === 'PasswordException'
            ? 'Password-protected PDFs are not supported. Export an unlocked copy.'
            : cause instanceof Error
              ? cause.message
              : 'Could not import this PDF.',
        );
        setBusy(false);
      }
    }
  }
  return (
    <dialog ref={dialog} onCancel={onClose} aria-labelledby="pdf-title">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="dialog-heading">
          <h2 id="pdf-title">Import slides</h2>
          <button className="icon-button" type="button" aria-label="Close import" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <p className="import-description">
          Each PDF page becomes a presentation section. Afterwards, choose which slides need a
          theory answer or C workspace.
        </p>
        <label>
          Presentation PDF
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={busy}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError('');
            }}
          />
        </label>
        <p className="muted">Up to 50 MB / 200 pages. Processed and saved in this browser.</p>
        {busy && (
          <div className="import-progress" role="status">
            <progress
              value={progress.total ? progress.done : undefined}
              max={progress.total || 1}
            />
            <span>
              {progress.total
                ? progress.done === progress.total
                  ? 'Saving slides…'
                  : `Rendering page ${progress.done + 1} of ${progress.total}`
                : 'Opening PDF…'}
            </span>
          </div>
        )}
        {error && (
          <p className="import-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-footer">
          <button className="button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={!file || busy}>
            {busy ? 'Importing…' : 'Add slides'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
