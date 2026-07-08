import React, { useEffect } from 'react';
import './Pages.css';

const Privacy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page-container container legal-page">
      <h1 className="page-title">Privacy Policy</h1>
      <div className="legal-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h3>1. Information Collection</h3>
        <p>We respect your privacy. This website does not require account registration. The only data we store are your local preferences (such as your search filters and age verification status) which are saved locally on your device via browser `localStorage`.</p>
        
        <h3>2. Third-Party Services</h3>
        <p>We embed video content from Eporner. These third-party services may use cookies, web beacons, and other tracking technologies to collect information about your activities. We encourage you to review Eporner's privacy policy for more information.</p>
        
        <h3>3. Analytics</h3>
        <p>We may use anonymous analytics tools to measure website traffic and improve user experience, but we do not collect personally identifiable information (PII).</p>
      </div>
    </div>
  );
};

export default Privacy;
