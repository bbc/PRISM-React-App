import React from 'react';

function BrushSizeSelector({ brushSize, setBrushSize }) {
  return (
    <div className="brush-size-selector">
      <label>Brush Size: {brushSize}</label>
      <input
        type="range"
        min="1"
        max="20"
        value={brushSize}
        onChange={(e) => setBrushSize(parseInt(e.target.value))}
      />
    </div>
  );
}

export default BrushSizeSelector;
