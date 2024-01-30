import React, { useEffect, useRef, useState } from 'react';
import '../index.css';
import DrawCursor from './DrawCursor'; // Update the import to use DrawCursor

function ImageCanvas({ image, scribbles, canvasRef, scribblesCanvasRef, mode, brushSize }) {
  const drawing = useRef(false);
  const [hovering, setHovering] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState({ scaleX: 1, scaleY: 1 });

  const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    // relationship bitmap vs. element for X
    const scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
      x: (evt.clientX - rect.left) * scaleX,  // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY    // been adjusted to be relative to element
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;
    img.onload = () => {
      // Set canvas dimensions to match image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      const rect = canvas.getBoundingClientRect();
      setScale({
        scaleX: rect.width / canvas.width,
        scaleY: rect.height / canvas.height
      });
      console.log(canvas.width / rect.width);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
      }
      ctx.putImageData(imageData, 0, 0);

      // Draw scribbles on top of the image
      // Set scribblesCanvas dimensions to match image dimensions
      const scribblesCanvas = scribblesCanvasRef.current;
      scribblesCanvas.width = img.width;
      scribblesCanvas.height = img.height;
      const scribblesCtx = scribblesCanvas.getContext('2d');
      drawScribbles(scribblesCtx, scribbles);
    };
  }, [image, scribbles, canvasRef, scribblesCanvasRef]);

  const stopDrawing = () => {
    drawing.current = false;
    scribblesCanvasRef.current.removeEventListener('mousemove', draw);
    scribblesCanvasRef.current.globalCompositeOperation = 'source-over'; // Reset composite mode
  };

  const startDrawing = (e) => {
    drawing.current = true;
    const ctx = scribblesCanvasRef.current.getContext('2d');
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = mode === 'drawing' ? 'red' : 'rgba(0,0,0,0)';
    ctx.globalCompositeOperation = mode === 'drawing' ? 'source-over' : 'destination-out';

    const pos = getMousePos(scribblesCanvasRef.current, e);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, 2 * Math.PI);
    ctx.fill();

    scribblesCanvasRef.current.addEventListener('mousemove', draw);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    const ctx = scribblesCanvasRef.current.getContext('2d');
    const pos = getMousePos(scribblesCanvasRef.current, e);

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawScribbles = (ctx, scribbles) => {
    ctx.fillStyle = 'red';
    const pixelSize = 1; // Size of each pixel

    for (let y = 0; y < scribbles.length; y++) {
      const row = scribbles[y];
      for (let x = 0; x < row.length; x++) {
        const pixelValue = row[x];
        if (pixelValue === 1) {
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  };

  const toggleMode = () => {
    // Toggle between drawing and erasing modes
    setMode((prevMode) => (prevMode === 'drawing' ? 'erasing' : 'drawing'));
  };

  return (
    <div>
      {hovering && <DrawCursor cursorSize={brushSize * scale.scaleX} cursorPosition={cursorPosition} />}
      <canvas
        ref={canvasRef}
        className="image-canvas"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={(e) => setCursorPosition({ x: e.clientX, y: e.clientY })}
        style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', // Adjust based on your requirements
            height: 'auto'
        }}
      />
      <canvas
        ref={scribblesCanvasRef}
        className="scribbles-canvas"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={(e) => setCursorPosition({ x: e.clientX, y: e.clientY })}
        style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', // Adjust based on your requirements
            height: 'auto'
        }}
      />
    </div>
  );
}

export default ImageCanvas;