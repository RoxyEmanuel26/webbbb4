import React, { useEffect } from 'react';
import './Pages.css';

const Terms = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page-container container legal-page">
      <h1 className="page-title">Terms of Service</h1>
      <div className="legal-content">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. Furthermore, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
        
        <h3>2. Description of Service</h3>
        <p>This website acts solely as an indexing and search tool that links to third-party content hosted by Eporner. We do not host, upload, or control any of the video content displayed.</p>

        <h3>3. Age Requirement</h3>
        <p>You must be at least 18 years of age, or the age of majority in your jurisdiction, to access and use this website.</p>
        
        <h3>4. Disclaimer of Warranties</h3>
        <p>Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis.</p>
      </div>
    </div>
  );
};

export default Terms;
