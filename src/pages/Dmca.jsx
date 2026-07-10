import React from 'react';
import './Pages.css';

const Dmca = () => (
  <div className="page-wrapper legal-page">
    <div className="legal-card">
      <h1>DMCA Notice & Takedown Policy</h1>
      <span className="legal-date">Last Updated: January 1, 2025</span>

      <h2>About Our Platform</h2>
      <p>NICEVX is an aggregator platform powered by the Eporner API. We do not host, upload, or store any video content on our servers. All videos are indexed and provided by Eporner.com.</p>

      <h2>DMCA Compliance</h2>
      <p>We respect the intellectual property rights of others and expect users of our site to do the same. It is our policy to respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA).</p>

      <h2>Filing a Takedown Notice</h2>
      <p>Since we do not host the content ourselves, DMCA takedown requests should be directed to:</p>
      <ul>
        <li><strong>Eporner.com</strong> — the actual content host</li>
        <li>Visit their DMCA page at: eporner.com/dmca/</li>
      </ul>

      <h2>Content Removal</h2>
      <p>Upon receiving a valid DMCA notice that results in content being removed from Eporner, the corresponding videos will automatically no longer appear on our platform, as our content is served directly through their API.</p>

      <h2>Counter-Notification</h2>
      <p>If you believe content was removed in error, you may file a counter-notification in accordance with DMCA guidelines with the hosting provider.</p>
    </div>
  </div>
);

export default Dmca;
