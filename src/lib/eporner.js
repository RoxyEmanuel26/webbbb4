const API_BASE = 'https://www.eporner.com/api/v2/video';

const fixEncoding = (str) => {
  if (!str) return str;
  let fixed = str;
  try {
    if (/[\x80-\xFF]/.test(fixed)) {
      fixed = decodeURIComponent(escape(fixed));
    }
  } catch (e) {}
  
  fixed = fixed.replace(/&quot;/g, '"')
               .replace(/&amp;/g, '&')
               .replace(/&#039;/g, "'")
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>');
               
  return fixed;
};

const sanitizeVideo = (video) => {
  if (!video) return video;
  return {
    ...video,
    title: fixEncoding(video.title),
    keywords: fixEncoding(video.keywords)
  };
};

export const epornerServerApi = {
  searchVideos: async (params = {}) => {
    const url = new URL(`${API_BASE}/search/`);
    
    const defaultParams = {
      query: 'all',
      per_page: 20,
      page: 1,
      thumbsize: 'medium',
      order: 'latest',
      gay: 0,
      lq: 1,
      format: 'json'
    };

    const finalParams = { ...defaultParams, ...params };
    Object.keys(finalParams).forEach(key => {
      if (finalParams[key] !== undefined && finalParams[key] !== null) {
        url.searchParams.append(key, finalParams[key]);
      }
    });

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Next.js App Router caching
      cf: { cacheEverything: true, cacheTtl: 3600 } // Cloudflare caching
    });
    
    if (!response.ok) throw new Error('Failed to fetch videos');
    const data = await response.json();
    
    if (data && data.videos) {
      data.videos = data.videos.map(sanitizeVideo);
      const forbiddenRegex = /\b(gay|shemale|tranny|ladyboy|ts|transsexual|transgender|boy|men|cock suck|cock sucking)\b/i;
      data.videos = data.videos.filter(v => {
        const kw = (v.keywords || '');
        const title = (v.title || '');
        return !forbiddenRegex.test(kw) && !forbiddenRegex.test(title);
      });
    }
    return data;
  },

  getVideoDetails: async (id, thumbsize = 'medium') => {
    const url = new URL(`${API_BASE}/id/`);
    url.searchParams.append('id', id);
    url.searchParams.append('thumbsize', thumbsize);
    url.searchParams.append('format', 'json');

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      cf: { cacheEverything: true, cacheTtl: 3600 }
    });
    
    if (!response.ok) throw new Error('Failed to fetch video details');
    const data = await response.json();
    return data && data.id ? sanitizeVideo(data) : data;
  }
};
