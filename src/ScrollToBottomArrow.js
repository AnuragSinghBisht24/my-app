import React, { useState, useEffect } from 'react';
import { FaArrowDown } from 'react-icons/fa';
import './ScrollToBottomArrow.css';

function ScrollToBottomArrow() {

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="scroll-to-bottom-arrow" onClick={scrollToBottom}>
      <FaArrowDown className="arrow-icon" />
    </div>
  );
}

export default ScrollToBottomArrow;