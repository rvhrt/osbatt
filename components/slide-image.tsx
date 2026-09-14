'use client';
import { useEffect, useRef, useState } from 'react';
import { getAsset } from '@/lib/slide-assets';
import type { Activity } from '@/lib/model';
export default function SlideImage({
  slide,
  thumbnail = false,
}: {
  slide: NonNullable<Activity['slide']>;
  thumbnail?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [src, setSrc] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    let url = '';
    setSrc('');
    setError(false);
    getAsset(slide.assetId)
      .then((asset) => {
        if (!active) return;
        if (!asset) {
          setError(true);
          return;
        }
        url = URL.createObjectURL(thumbnail ? asset.thumbnail : asset.image);
        setSrc(url);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [slide.assetId, thumbnail]);
  if (error)
    return (
      <span className="slide-missing" role="status">
        Slide unavailable in this browser.
      </span>
    );
  if (!src) return <span className="slide-loading">Loading slide…</span>;
  if (thumbnail)
    return (
      <img
        className="slide-thumbnail"
        src={src}
        alt={`${slide.filename}, page ${slide.page}`}
        loading="lazy"
      />
    );
  return (
    <>
      <button
        className="slide-expand"
        aria-label={`Expand page ${slide.page}`}
        onClick={() => dialog.current?.showModal()}
      >
        <img className="slide-image" src={src} alt={`${slide.filename}, page ${slide.page}`} />
        <span>Expand slide</span>
      </button>
      <dialog ref={dialog} className="slide-dialog" aria-label={`Page ${slide.page} enlarged`}>
        <div className="dialog-heading">
          <span>
            {slide.filename} · page {slide.page}
          </span>
          <button className="button" onClick={() => dialog.current?.close()}>
            Close slide
          </button>
        </div>
        <img className="expanded-slide" src={src} alt={`${slide.filename}, page ${slide.page}`} />
      </dialog>
    </>
  );
}
