import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import './Sliders.css';

const TrendingTagsSlider = ({ tags }) => {
  const navigate = useNavigate();

  return (
    <div className="slider-section">
      <div className="slider-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame color="var(--primary)" size={24} /> Trending Keywords
        </h2>
        <span className="slider-meta">Based on top weekly API data</span>
      </div>
      
      <div className="slider-container-wrapper">
        <div className="slider-container categories-container">
          {tags.map((tag, idx) => (
            <div 
              key={idx} 
              className="trending-tag-slide"
              onClick={() => navigate(`/search?query=${encodeURIComponent(tag)}`)}
            >
              <div className="tag-content">
                <span className="tag-hash">#</span>
                <span className="tag-name">{tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingTagsSlider;
