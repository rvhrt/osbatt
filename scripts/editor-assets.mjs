import { cpSync, mkdirSync, rmSync } from 'node:fs';
rmSync('public/monaco', { recursive: true, force: true });
mkdirSync('public/monaco', { recursive: true });
cpSync('node_modules/monaco-editor/min/vs', 'public/monaco/vs', { recursive: true });

mkdirSync('public/pdfjs', { recursive: true });
cpSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdfjs/pdf.worker.min.mjs');
for (const dir of ['cmaps', 'standard_fonts', 'wasm'])
  cpSync(`node_modules/pdfjs-dist/${dir}`, `public/pdfjs/${dir}`, { recursive: true });
