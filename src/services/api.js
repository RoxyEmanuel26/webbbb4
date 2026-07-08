const API_BASE = 'https://www.eporner.com/api/v2/video';

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

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      if (data && data.videos) {
        // Fix encoding for all videos
        data.videos = data.videos.map(sanitizeVideo);

        // Strict client-side filtering to ensure no gay/shemale content slips through
        const forbiddenWords = ['gay', 'shemale', 'tranny', 'ladyboy', 'ts', 'transsexual', 'transgender', 'boy', 'men', 'cock suck'];
        data.videos = data.videos.filter(v => {
          const kw = (v.keywords || '').toLowerCase();
          const title = (v.title || '').toLowerCase();
          return !forbiddenWords.some(word => kw.includes(word) || title.includes(word));
        });
      }
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

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Fix encoding for single video
      if (data && data.id) {
        return sanitizeVideo(data);
      }
      return data;
    } catch (error) {
      console.error(`Error fetching video details for ID ${id}:`, error);
      throw error;
    }
  }
};
