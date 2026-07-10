const API_BASE = 'https://www.eporner.com/api/v2/video';

// In-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Utility to fix Mojibake (UTF-8 bytes mistakenly interpreted as Latin-1) and HTML entities
const fixEncoding = (str) => {
  if (!str) return str;
  let fixed = str;
  try {
    // Attempt to decode if it contains typical extended Latin characters used in Mojibake
    if (/[\x80-\xFF]/.test(fixed)) {
      fixed = decodeURIComponent(escape(fixed));
    }
  } catch (e) {
    // Ignore malformed URI errors, just fallback to original
  }
  
  // Clean HTML entities using DOMParser (safe in React)
  try {
    const doc = new DOMParser().parseFromString(fixed, 'text/html');
    fixed = doc.documentElement.textContent || fixed;
  } catch (e) {
    // ignore
  }
  return fixed;
};

// Apply fixes to a video object
const sanitizeVideo = (video) => {
  if (!video) return video;
  return {
    ...video,
    title: fixEncoding(video.title),
    keywords: fixEncoding(video.keywords)
  };
};

export const epornerApi = {
  searchVideos: async (params = {}) => {
    try {
      const url = new URL(`${API_BASE}/search/`);
      
      // Default parameters
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

      const cacheKey = url.toString();
      const cachedData = getCached(cacheKey);
      if (cachedData) return cachedData;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      if (data && data.videos) {
        // Fix encoding for all videos
        data.videos = data.videos.map(sanitizeVideo);

        // Strict client-side filtering to ensure no gay/shemale content slips through
        const forbiddenRegex = /\b(gay|shemale|tranny|ladyboy|ts|transsexual|transgender|boy|men|cock suck|cock sucking)\b/i;
        data.videos = data.videos.filter(v => {
          const kw = (v.keywords || '');
          const title = (v.title || '');
          return !forbiddenRegex.test(kw) && !forbiddenRegex.test(title);
        });
      }
      
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  getVideoDetails: async (id, thumbsize = 'medium') => {
    try {
      const url = new URL(`${API_BASE}/id/`);
      url.searchParams.append('id', id);
      url.searchParams.append('thumbsize', thumbsize);
      url.searchParams.append('format', 'json');

      const cacheKey = url.toString();
      const cachedData = getCached(cacheKey);
      if (cachedData) return cachedData;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      let finalData = data;
      // Fix encoding for single video
      if (data && data.id) {
        finalData = sanitizeVideo(data);
      }
      
      setCache(cacheKey, finalData);
      return finalData;
    } catch (error) {
      console.error(`Error fetching video details for ID ${id}:`, error);
      throw error;
    }
  }
};
