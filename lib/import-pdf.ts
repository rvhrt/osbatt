import type { Activity } from './model';
import { saveAssets, type SlideAsset } from './slide-assets';
export const maxPdfBytes = 50 * 1024 * 1024;
export const maxPdfPages = 200;
function imageBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not render a slide.'))),
      'image/webp',
      0.92,
    ),
  );
}
export async function importPdf(
  file: File,
  progress: (done: number, total: number) => void,
  signal: AbortSignal,
): Promise<Activity[]> {
  if (!file.size || file.size > maxPdfBytes) throw new Error('Choose a PDF smaller than 50 MB.');
  const data = new Uint8Array(await file.arrayBuffer());
  if (!new TextDecoder().decode(data.subarray(0, 1024)).includes('%PDF-'))
    throw new Error('This file is not a PDF.');
  signal.throwIfAborted();
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
  const task = pdfjs.getDocument({
    data,
    cMapUrl: '/pdfjs/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/pdfjs/standard_fonts/',
    wasmUrl: '/pdfjs/wasm/',
  });
  const cancel = () => {
    void task.destroy();
  };
  signal.addEventListener('abort', cancel, { once: true });
  const assets: SlideAsset[] = [];
  const activities: Activity[] = [];
  try {
    const pdf = await task.promise;
    if (pdf.numPages > maxPdfPages) throw new Error('Choose a PDF with 200 pages or fewer.');
    progress(0, pdf.numPages);
    for (let n = 1; n <= pdf.numPages; n++) {
      signal.throwIfAborted();
      const page = await pdf.getPage(n);
      const original = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({
        scale: Math.min(2, 1920 / Math.max(original.width, original.height)),
      });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvas, viewport }).promise;
      const image = await imageBlob(canvas);
      const thumb = document.createElement('canvas');
      thumb.width = 240;
      thumb.height = Math.max(1, Math.round((240 * viewport.height) / viewport.width));
      thumb.getContext('2d')!.drawImage(canvas, 0, 0, thumb.width, thumb.height);
      const thumbnail = await imageBlob(thumb);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .trim();
      const id = crypto.randomUUID();
      assets.push({ id, image, thumbnail });
      activities.push({
        id: crypto.randomUUID(),
        kind: 'presentation',
        title: `Slide ${n}`,
        body: '',
        slide: { assetId: id, page: n, filename: file.name, text: text.slice(0, 15000) },
      });
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
      progress(n, pdf.numPages);
    }
    signal.throwIfAborted();
    await saveAssets(assets);
    return activities;
  } finally {
    signal.removeEventListener('abort', cancel);
    await task.destroy();
  }
}
