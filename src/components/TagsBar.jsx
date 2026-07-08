import React from 'react';
import { Hash } from 'lucide-react';
import './TagsBar.css';

const TagsBar = ({ tags, onTagClick }) => {
  return (
    <div className="tags-bar-root" role="navigation" aria-label="Trending topics">
      <div className="page-wrapper tags-bar-inner">
        <span className="tags-bar-label">
          <Hash size={13} aria-hidden="true" /> Trending:
        </span>
        <div className="tags-bar-scroll">
          {tags.map((tag) => (
            <button
              key={tag}
              className="tag-pill"
              onClick={() => onTagClick(tag)}
              aria-label={`Browse ${tag}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagsBar;
