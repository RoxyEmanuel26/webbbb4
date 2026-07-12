/**
 * Adsterra Sequential Queue Loader
 * 
 * To prevent conflicts with the global `window.atOptions` when loading multiple banners
 * on the same page, we queue the ad requests and load their `invoke.js` scripts sequentially.
 * This ensures that each script reads its correct configuration before the next one overwrites it.
 * 
 * Using this method preserves 100% of Adsterra's native viewability tracking and URL referrers,
 * which protects your CPM and Revenue compared to using iframe srcDoc hacks.
 */

const queue = [];
let isProcessing = false;

const processQueue = () => {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const { adKey, width, height, container, resolve } = queue.shift();

  // If container unmounted before processing, skip it
  if (!container || !document.body.contains(container)) {
    isProcessing = false;
    resolve(false);
    processQueue();
    return;
  }

  // 1. Set global options for this specific ad
  window.atOptions = {
    'key': adKey,
    'format': 'iframe',
    'height': height,
    'width': width,
    'params': {}
  };

  // 2. Load the script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://glamournakedemployee.com/${adKey}/invoke.js`;
  script.async = true;

  // Once script is loaded and executed, it has already consumed window.atOptions
  // We can safely move to the next ad in the queue
  script.onload = () => {
    isProcessing = false;
    resolve(true);
    processQueue();
  };

  script.onerror = () => {
    isProcessing = false;
    resolve(false);
    processQueue();
  };

  container.appendChild(script);
};

export const enqueueAd = (adKey, width, height, container) => {
  return new Promise((resolve) => {
    queue.push({ adKey, width, height, container, resolve });
    processQueue();
  });
};
