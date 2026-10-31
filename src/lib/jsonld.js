const SITE_URL = 'https://www.nicevx.com';

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NICEVX',
    url: SITE_URL,
    description: 'Free HD adult videos, curated collections, and daily additions.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?query={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NICEVX',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    sameAs: [],
  };
}

export function breadcrumbListSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

function formatIsoDuration(video) {
  if (video.duration && /^PT/i.test(video.duration)) {
    return video.duration;
  }
  const totalSeconds = Number(video.durationSeconds || video.length_sec || 0);
  if (!totalSeconds || totalSeconds <= 0) return undefined;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let iso = 'PT';
  if (hours > 0) iso += `${hours}H`;
  if (minutes > 0) iso += `${minutes}M`;
  if (seconds > 0 || iso === 'PT') iso += `${seconds}S`;
  return iso;
}

export function videoObjectSchema(video) {
  const duration = formatIsoDuration(video);
  const thumbs = Array.isArray(video.thumbs) && video.thumbs.length > 0
    ? video.thumbs.map((t) => (typeof t === 'string' ? t : t.src)).filter(Boolean)
    : [video.thumbnail].filter(Boolean);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || `Watch ${video.title} on NICEVX in full HD.`,
    thumbnailUrl: thumbs.length ? thumbs : [`${SITE_URL}/favicon.png`],
    uploadDate: video.uploadDate,
    url: video.canonicalUrl || `${SITE_URL}/video/${video.canonicalSlug}`,
    isFamilyFriendly: false,
  };

  if (video.embedUrl) {
    schema.embedUrl = video.embedUrl;
  }
  if (duration) {
    schema.duration = duration;
  }
  if (video.category) {
    schema.genre = video.category;
  }
  if (Array.isArray(video.tags) && video.tags.length > 0) {
    schema.keywords = video.tags.join(', ');
  }
  if (Number(video.views) > 0) {
    schema.interactionStatistic = {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: Number(video.views),
    };
  }

  return schema;
}

export function itemListSchema({ name, url, items = [], maxItems = 36 }) {
  const sliced = items.slice(0, maxItems);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    numberOfItems: sliced.length,
    itemListElement: sliced.map((video, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'VideoObject',
        name: video.title,
        url: video.canonicalUrl || `${SITE_URL}/video/${video.canonicalSlug}`,
        thumbnailUrl: [video.thumbnail].filter(Boolean),
        ...(video.uploadDate && { uploadDate: video.uploadDate }),
        ...(video.durationSeconds && { duration: formatIsoDuration(video) }),
      },
    })),
  };
}
