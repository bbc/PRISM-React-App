import React, { useState, useEffect, useRef } from 'react';
import ImageCanvas from './ImageCanvas';

function ImageUploader() {
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showOriginal, setShowOriginal] = useState(true);
    const [scribbles, setScribbles] = useState([]);
    const canvasRef = useRef(null);
    const scribblesCanvasRef = useRef(null); // Create a new useRef for scribbles canvas
    const [drawnData, setDrawnData] = useState(null);
    const [mode, setMode] = useState('drawing'); // Moved from ImageCanvas
    const [brushSize, setBrushSize] = useState(10); // Moved from ImageCanvas

    const toggleMode = () => {
        setMode(prevMode => prevMode === 'drawing' ? 'erasing' : 'drawing');
    };

    useEffect(() => {
        if (selectedFile) {
            processImage();
        }
    }, [selectedFile]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
            setShowOriginal(true);
        }
    };

    const processImage = async () => {
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/process-image', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const responseData = await response.json();
            setScribbles(responseData.scribbles);
        } catch (error) {
            console.error('Error during image processing:', error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleImageChange} accept="image/*" />
            <button onClick={() => setShowOriginal(true)}>Show Original</button>
            <button onClick={() => setShowOriginal(false)}>Show Black and White</button>
            <button onClick={toggleMode}>Toggle Mode ({mode})</button>
            <div className="brush-size-selector">
                <label htmlFor="brushSize">Brush Size: {brushSize}</label>
                <input
                    type="range"
                    id="brushSize"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    min="1"
                    max="50"
                />
            </div>
            <div className="image-canvas-container">
                {imagePreview && (
                    <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="image-preview"
                        style={{ zIndex: showOriginal ? 4 : 1 }} // Dynamic z-index
                    />
                )}
                <ImageCanvas
                    image={imagePreview}
                    scribbles={scribbles}
                    canvasRef={canvasRef}
                    scribblesCanvasRef={scribblesCanvasRef}
                    drawnData={drawnData}
                    setDrawnData={setDrawnData}
                    mode={mode}
                    brushSize={brushSize}
                    className="canvas-element"
                />
            </div>
        </div>
    );
    
}

export default ImageUploader;
