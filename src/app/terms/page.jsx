export const runtime = 'edge';
import React from 'react';
import '../../pages/Pages.css';

export const metadata = {
  title: 'Terms of Service — NICEVX',
  description: 'Read the Terms of Service for NICEVX. By using our platform you agree to these terms.',
  robots: 'noindex, follow',
  alternates: {
    canonical: 'https://nicevx.com/terms'
  }
};

export default function TermsPage() {
  return (
    <div className="page-wrapper legal-page">
      <div className="legal-card">
        <h1>Terms of Service</h1>
        <span className="legal-date">Last Updated: January 1, 2025</span>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using NICEVX, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>

        <h2>2. Age Requirement</h2>
        <p>You must be at least 18 years of age, or the age of majority in your jurisdiction (whichever is higher), to access and use this website. By using this site, you confirm and represent that you are of legal age.</p>

        <h2>3. Content</h2>
        <p>All content on this website is provided by third-party sources through the Eporner API. We do not host or store any video content directly. We are merely a platform that displays publicly available content.</p>
        <p>All individuals depicted in content displayed on this website are at least 18 years of age at the time of creation of such content.</p>

        <h2>4. Prohibited Activities</h2>
        <ul>
          <li>Attempting to access restricted sections of the site</li>
          <li>Distributing malware or harmful code</li>
          <li>Using the site for any unlawful purpose</li>
          <li>Scraping or harvesting data without permission</li>
        </ul>

        <h2>5. Disclaimer of Warranties</h2>
        <p>This service is provided "as is" without any warranties, express or implied. We do not warrant that the service will be uninterrupted or error-free.</p>

        <h2>6. Contact</h2>
        <p>For any questions regarding these terms, please use the DMCA contact page.</p>
      </div>
    </div>
  );
}
