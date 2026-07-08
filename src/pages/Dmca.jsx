import React, { useEffect } from 'react';
import './Pages.css';

const Dmca = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page-container container legal-page">
      <h1 className="page-title">DMCA / Copyright</h1>
      <div className="legal-content">
        <p>This website functions as an automated search engine and indexing tool. We do not host, store, or upload any video files on our servers. All videos are embedded directly from Eporner.com API.</p>
        
        <h3>Takedown Requests</h3>
        <p>Since we do not host any of the media, we cannot remove videos from the source. To have a video completely removed from the Internet, you must contact the original host (Eporner).</p>
        
        <p>If you wish to request that we block a specific embed link from appearing in our search results, please contact us with the specific URL of the page on our site and proof of copyright ownership.</p>
      </div>
    </div>
  );
};

export default Dmca;
