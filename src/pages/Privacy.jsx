import React from 'react';
import { Helmet } from 'react-helmet-async';
import './Pages.css';

const Privacy = () => (
  <>
    <Helmet>
      <title>Privacy Policy — NICEVX</title>
      <meta name="description" content="Read the Privacy Policy for NICEVX." />
      <link rel="canonical" href="https://nicevx.com/privacy" />
      <meta name="robots" content="noindex, follow" />
    </Helmet>
    <div className="page-wrapper legal-page">
    <div className="legal-card">
      <h1>Privacy Policy</h1>
      <span className="legal-date">Last Updated: January 1, 2025</span>

      <h2>1. Information We Collect</h2>
      <p>We may collect information you provide directly to us, including when you use our services. This may include technical information such as IP address, browser type, and pages visited.</p>

      <h2>2. Cookies</h2>
      <p>We use local storage to save your age verification status. We may also use analytics cookies to understand site usage. You can disable cookies in your browser settings.</p>

      <h2>3. Third-Party Content</h2>
      <p>Videos are served via the Eporner API and embedded from third-party servers. Their privacy policies apply to content served from their servers. We encourage you to review their privacy policy at eporner.com.</p>

      <h2>4. Data Retention</h2>
      <p>We do not store personal data on our servers. Any age verification status is stored locally in your browser's localStorage and can be cleared at any time by clearing your browser data.</p>

      <h2>5. Children's Privacy</h2>
      <p>This site is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such information, please contact us immediately.</p>

      <h2>6. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
    </div>
  </div>
  </>
);

export default Privacy;
