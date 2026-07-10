"use client";
import React, { useState, useEffect } from 'react';
import './AgeGateModal.css';

const AgeGateModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem('ageVerified');
    if (isVerified !== 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsOpen(false);
  };

  const handleDeny = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <h2>Age Verification</h2>
        <p>This website contains sexually explicit adult material. You must be at least 18 years of age or have reached the legal age of majority (whichever is higher) in the jurisdiction from which you are accessing this site.</p>
        <p>Are you 18 years of age or older?</p>
        <div className="age-gate-actions">
          <button onClick={handleConfirm} className="btn-primary">I am 18+</button>
          <button onClick={handleDeny} className="btn-secondary">Exit</button>
        </div>
      </div>
    </div>
  );
};

export default AgeGateModal;
