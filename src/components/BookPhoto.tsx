"use client";

import { useEffect, useRef, useState } from "react";
import { CoverArt } from "@/components/CoverArt";
import { AnimatedCover, hasAnimatedCover } from "@/components/AnimatedCovers";

type BookPhotoProps = {
  photo: string | null;
  category: string;
  accent: string;
  title: string;
  author?: string;
  className?: string;
};

/** Shows the photo the server confirmed exists; otherwise (or if it still fails) the drawn cover. */
export function BookPhoto({ photo, category, accent, title, author, className }: BookPhotoProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Catch an image that failed before React attached its error handler.
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [photo]);

  if (hasAnimatedCover(title)) {
    return <AnimatedCover title={title} author={author} className={className} />;
  }

  if (!photo || failed) {
    return <CoverArt category={category} accent={accent} title={title} author={author} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden bg-[#1c2430] ${className || ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={photo}
        alt={`Photo for ${title}`}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-[#f8f4ec]">
        <strong className="block font-display text-lg leading-snug drop-shadow">{title}</strong>
        {author ? (
          <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] opacity-85">{author}</span>
        ) : null}
      </div>
    </div>
  );
}
