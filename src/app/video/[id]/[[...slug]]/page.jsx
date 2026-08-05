export const runtime = 'edge';
import { redirect } from 'next/navigation';

/**
 * Helper: Slugify text ke lowercase-hyphen (sama dengan VideoCard.jsx)
 */
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Route lama: /video/[id]/[[...slug]]
 * → Redirect 301 permanen ke: /video/[slug-judul]-[id]
 *
 * Ini menjaga semua backlink lama (Pinterest, sosmed, dll) tetap berfungsi
 * dan meneruskan SEO value ke URL baru.
 */
export default async function OldVideoRedirect({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || '';

  if (!id) {
    redirect('/');
  }

  // Coba ambil judul video untuk buat slug yang bermakna
  let slug = id; // fallback jika API gagal
  try {
    const res = await fetch(
      `https://www.eporner.com/api/v2/video/id/?id=${id}&thumbs=0`,
      { next: { revalidate: 86400 } }
    );
    if (res.ok) {
      const video = await res.json();
      if (video && video.title) {
        slug = `${slugify(video.title)}-${id}`;
      }
    }
  } catch (_) {
    slug = id;
  }

  // Redirect 301 permanen ke URL baru
  redirect(`/video/${slug}`);
}

