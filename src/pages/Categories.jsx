import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import './Categories.css';

const CATEGORIES = [
  { name: 'Teen', icon: '👧', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
  { name: 'MILF', icon: '👩', color: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { name: 'Amateur', icon: '📹', color: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
  { name: 'Anal', icon: '🍑', color: 'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)' },
  { name: 'Asian', icon: '👘', color: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Ebony', icon: '🍫', color: 'linear-gradient(to right, #434343 0%, black 100%)' },
  { name: 'Big Tits', icon: '🍈', color: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)' },
  { name: 'Big Ass', icon: '🍑', color: 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)' },
  { name: 'Lesbian', icon: '👩‍❤️‍👩', color: 'linear-gradient(to right, #eea2a2 0%, #bbc1bf 19%, #57c6e1 42%, #b49fda 79%, #7ac5d8 100%)' },
  { name: 'Threesome', icon: '👨‍👩‍👧', color: 'linear-gradient(to right, #74ebd5 0%, #9face6 100%)' },
  { name: 'Blowjob', icon: '👄', color: 'linear-gradient(to top, #ff0844 0%, #ffb199 100%)' },
  { name: 'Hardcore', icon: '🔥', color: 'linear-gradient(to top, #09203f 0%, #537895 100%)' },
  { name: 'Creampie', icon: '💦', color: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' },
  { name: 'Cumshot', icon: '☔', color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { name: 'Hentai', icon: '🐙', color: 'linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)' },
  { name: 'Vintage', icon: '🎞️', color: 'linear-gradient(to right, #868f96 0%, #596164 100%)' },
  { name: 'POV', icon: '👁️', color: 'linear-gradient(to right, #b224ef 0%, #7579ff 100%)' },
  { name: 'Massage', icon: '💆', color: 'linear-gradient(to right, #f83600 0%, #f9d423 100%)' },
  { name: 'Latina', icon: '💃', color: 'linear-gradient(to top, #0fd850 0%, #f9f047 100%)' },
  { name: 'Redhead', icon: '🦊', color: 'linear-gradient(to top, #c79081 0%, #dfa579 100%)' },
];

const Categories = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/search?query=${encodeURIComponent(categoryName.toLowerCase())}`);
  };

  return (
    <div className="categories-page">
      <div className="page-wrapper content-area">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="section-title-group">
            <Layers className="section-icon" size={28} />
            <h1 className="section-title">Explore Categories</h1>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="cats-grid">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.name}
              className="cat-card"
              onClick={() => handleCategoryClick(cat.name)}
              role="button"
              tabIndex={0}
              style={{ background: cat.color }}
            >
              <div className="cat-card-overlay"></div>
              <div className="cat-card-content">
                <span className="cat-icon" aria-hidden="true">{cat.icon}</span>
                <h3 className="cat-name">{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Categories;
