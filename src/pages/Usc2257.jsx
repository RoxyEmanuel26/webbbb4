import React, { useEffect } from 'react';
import './Pages.css';

const Usc2257 = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page-container container legal-page">
      <h1 className="page-title">18 U.S.C. 2257 Statement</h1>
      <div className="legal-content">
        <p>All models, actors, actresses, and other persons that appear in any visual depiction of actual or simulated sexually explicit conduct appearing or otherwise contained in this website were over the age of eighteen (18) years at the time of the creation of such depictions.</p>
        <p><strong>Exemption Notice:</strong> This website is an indexing tool and search engine that automatically embeds content hosted by third-party platforms (Eporner). This website does not produce, direct, or create any of the visual depictions found here.</p>
        <p>For complete 18 U.S.C. 2257 compliance records, please refer to the original content host, Eporner.com, which is the primary producer and distributor of the content embedded herein.</p>
      </div>
    </div>
  );
};

export default Usc2257;
