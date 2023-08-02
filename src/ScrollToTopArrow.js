import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import './ScrollToTopArrow.css';

function ScrollToTopArrow() {

    const scrollToTop = () => {
        window.scrollTo({ top: null, behavior: 'smooth' });
      };
    
      return (
        <div className="scroll-to-top-arrow" onClick={scrollToTop}>
          <FaArrowUp className="arrow-icon" />
        </div>
      );
}

export default ScrollToTopArrow;