const API_BASE = 'https://www.eporner.com/api/v2/video';

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
      return await response.json();
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
      return await response.json();
    } catch (error) {
      console.error(`Error fetching video details for ID ${id}:`, error);
      throw error;
    }
  }
};
