import fs from "fs";
import path from "path";
import { hashString } from "@/components/CoverArt";
import { PHOTO_COUNTS } from "@/lib/photos";
import { slugify } from "@/lib/slug";

const PHOTO_DIR = path.join(process.cwd(), "public", "photos");

/** True only for a real JPEG/PNG/WebP file, so a saved error page never shows as a broken image. */
function isImage(file: string) {
  try {
    const fd = fs.openSync(file, "r");
    const head = Buffer.alloc(4);
    fs.readSync(fd, head, 0, 4, 0);
    fs.closeSync(fd);
    const jpeg = head[0] === 0xff && head[1] === 0xd8;
    const png = head[0] === 0x89 && head[1] === 0x50;
    const webp = head.toString("ascii", 0, 4) === "RIFF";
    return jpeg || png || webp;
  } catch {
    return false;
  }
}

/**
 * Picks the best photo that actually exists on disk: one made for this title,
 * otherwise any photo for its category. Returns null to use the drawn cover.
 */
export function photoFor(title: string, category: string): string | null {
  const slug = slugify(title);
  if (isImage(path.join(PHOTO_DIR, "books", `${slug}.jpg`))) return `/photos/books/${slug}.jpg`;

  const count = PHOTO_COUNTS[category] || 0;
  const start = hashString(title);
  for (let k = 0; k < count; k++) {
    const n = ((start + k) % count) + 1;
    if (isImage(path.join(PHOTO_DIR, `${category}-${n}.jpg`))) return `/photos/${category}-${n}.jpg`;
  }
  return null;
}

/** Preferred banner photo number per category, chosen to differ from the book cards. */
const BANNER_PICK: Record<string, number> = { kids: 1, school: 2, history: 1, nature: 2, adventure: 1, mix: 1 };

/** Wide photo for a category's section banner, or null to use a colored gradient. */
export function bannerFor(category: string): string | null {
  const count = PHOTO_COUNTS[category] || 0;
  const first = BANNER_PICK[category] || 1;
  for (let k = 0; k < count; k++) {
    const n = ((first - 1 + k) % count) + 1;
    if (isImage(path.join(PHOTO_DIR, `${category}-${n}.jpg`))) return `/photos/${category}-${n}.jpg`;
  }
  return null;
}
