import React from 'react';
import '../index.css'; // Update the CSS import as well

function DrawCursor({ cursorPosition, cursorSize }) {
  const cursorStyle = {
    left: cursorPosition.x - cursorSize / 2 + 'px',
    top: cursorPosition.y - cursorSize / 2 + 'px',
    width: cursorSize + 'px',
    height: cursorSize + 'px',
  };

  return <div className="draw-cursor" style={cursorStyle}></div>;
}

export default DrawCursor;
