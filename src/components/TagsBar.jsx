"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import './TagsBar.css';

const TagsBar = ({ tags, onTagClick }) => {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tags]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="tags-bar-root" role="navigation" aria-label="Trending topics">
      <div className="page-wrapper tags-bar-inner">
        <span className="tags-bar-label">
          <Hash size={13} aria-hidden="true" /> Trending:
        </span>
        <div className="tags-scroll-wrapper">
          {showLeft && (
            <button className="tags-scroll-btn left" onClick={() => handleScroll('left')} aria-label="Scroll left">
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="tags-bar-scroll" ref={scrollRef} onScroll={checkScroll}>
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                prefetch={false}
                className="tag-pill"
                aria-label={`Browse ${tag}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {tag}
              </Link>
            ))}
          </div>
          {showRight && (
            <button className="tags-scroll-btn right" onClick={() => handleScroll('right')} aria-label="Scroll right">
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsBar;
