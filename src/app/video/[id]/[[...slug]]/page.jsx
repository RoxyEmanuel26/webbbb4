import React from 'react';
import { redirect } from 'next/navigation';
import { epornerServerApi } from '@/lib/eporner';
import { ALL_CATEGORIES } from '@/data/allCategories';
import VideoPlayerClient from './VideoPlayerClient';

export const revalidate = 3600; // Cache for 1 hour

const createSlug = (title) => {
  if (!title) return '';
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  let video;
  try {
    video = await epornerServerApi.getVideoDetails(id, 'big');
  } catch (error) {
    return { title: 'Video Not Found - NICEVX' };
  }

  if (!video || !video.id) {
    return { title: 'Video Not Found - NICEVX' };
  }

  const videoSlug = createSlug(video.title);
  const canonicalUrl = `https://nicevx.com/video/${video.id}/${videoSlug}`;
  const currentYear = new Date().getFullYear();
  const seoTitle = `${video.title} - Free HD Porn Video ${currentYear} — NICEVX`;
  const seoDesc = `Watch "${video.title}" free HD porn video on NICEVX. ${video.length_min || ''} ${video.views ? `${Number(video.views).toLocaleString()} views.` : ''} Stream top-quality adult content in ${currentYear}.`;
  const thumbSrc = video.default_thumb?.src || (video.thumbs?.[0]?.src) || '';

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'video.other',
      title: seoTitle,
      description: seoDesc,
      url: canonicalUrl,
      images: thumbSrc ? [{ url: thumbSrc }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: thumbSrc ? [thumbSrc] : [],
    }
  };
}

export default async function VideoPage({ params }) {
  const { id, slug } = await params;

  let video = null;
  let related = [];
  
  try {
    video = await epornerServerApi.getVideoDetails(id, 'big');
  } catch (error) {
    // leave video null
  }

  if (!video || Array.isArray(video) || !video.id) {
    return (
      <div className="empty-block" style={{ minHeight: '60vh' }}>
        <p style={{ fontSize: '3rem' }}>😔</p>
        <h2>Video Not Available</h2>
        <p>This video may have been removed or is temporarily unavailable.</p>
        <a href="/" style={{
          marginTop: '1rem', display: 'inline-block',
          background: 'var(--color-accent)', color: 'white',
          textDecoration: 'none', padding: '10px 24px',
          borderRadius: 'var(--radius-sm)', fontWeight: 700
        }}>
          ← Go Home
        </a>
      </div>
    );
  }

  const expectedSlug = createSlug(video.title);
  
  // Strict check: if slug is not exactly 1 element or doesn't match precisely, redirect to canonical.
  if (!slug || slug.length !== 1 || slug[0] !== expectedSlug) {
    redirect(`/video/${id}/${expectedSlug}`);
  }

  if (video.keywords) {
    try {
      const kw = video.keywords.split(',')[0].trim();
      const rel = await epornerServerApi.searchVideos({
        query: kw,
        per_page: 10,
        gay: 0,
        lq: 1,
        thumbsize: 'medium',
      });
      related = (rel?.videos || []).filter(v => v.id !== id).slice(0, 8);
    } catch (_) {}
  }

  const keywords = video.keywords
    ? video.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : [];

  const relatedCategories = ALL_CATEGORIES.filter(cat => 
    keywords.some(kw => cat.name.toLowerCase() === kw.toLowerCase() || kw.toLowerCase().includes(cat.name.toLowerCase()))
  ).slice(0, 5);

  const thumbSrc = video.default_thumb?.src || (video.thumbs?.[0]?.src) || '';
  const canonicalUrl = `https://nicevx.com/video/${video.id}/${expectedSlug}`;

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: `Watch "${video.title}" free HD porn video on NICEVX.`,
    thumbnailUrl: thumbSrc,
    uploadDate: video.added || undefined,
    duration: video.length_min ? `PT${video.length_min.replace(':', 'M')}S` : undefined,
    contentUrl: canonicalUrl,
    embedUrl: typeof video.embed === 'string' && !video.embed.includes('<iframe') ? video.embed : undefined,
    interactionStatistic: video.views ? {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: video.views,
    } : undefined,
    keywords: keywords.join(', '),
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://nicevx.com/"
      },
      ...(keywords.length > 0 ? [
        {
          "@type": "ListItem",
          "position": 2,
          "name": keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1),
          "item": `https://nicevx.com/tag/${keywords[0].toLowerCase().replace(/\s+/g, '-')}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": video.title,
          "item": canonicalUrl
        }
      ] : [
        {
          "@type": "ListItem",
          "position": 2,
          "name": video.title,
          "item": canonicalUrl
        }
      ])
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([videoSchema, breadcrumbsSchema]).replace(/</g, '\\u003c') }}
      />
      <VideoPlayerClient video={video} related={related} relatedCategories={relatedCategories} keywords={keywords} />
    </>
  );
}
