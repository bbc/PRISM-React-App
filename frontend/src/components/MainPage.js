import React, { useState, useEffect, useRef } from 'react';
import ImageCanvas from './ImageCanvas';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

function MainPage({image}) {
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [displayedImageID, setDisplayedImageID] = useState(null);
    const [displayedImage, setDisplayedImageState] = useState('ORIGINAL');
    const [scribbles, setScribbles] = useState([]);
    const canvasRef = useRef(null);
    const scribblesCanvasRef = useRef(null); // Create a new useRef for scribbles canvas
    const [drawnData, setDrawnData] = useState(null);
    const [mode, setMode] = useState('drawing'); // Moved from ImageCanvas
    const [brushSize, setBrushSize] = useState(10); // Moved from ImageCanvas
    const [restoredImage, setRestoredImage] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({ width: '100%', height: 'auto' });
    const [savedDrawing, setSavedDrawing] = useState(null);


    const setDisplayedImage = (imageType) => {
        if (imageType !== 'ANNOTATED' && displayedImage === 'ANNOTATED') {
            // Save the current drawing if leaving annotated view
            const scribblesCanvas = scribblesCanvasRef.current;
            if (scribblesCanvas) {
                const drawing = scribblesCanvas.toDataURL('image/png');
                setSavedDrawing(drawing);
            }
        }
        // Update the displayed image state
        setDisplayedImageState(imageType);
    }

    useEffect(() => {
        function calculateDimensions() {
            const viewportWidth = window.innerWidth * 0.9; // 90% of viewport width
            const viewportHeight = window.innerHeight * 0.9; // 90% of viewport height

            // Assuming imagePreview is the URL of the image
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                let width, height;

                // Adjust width and height based on aspect ratio
                if (viewportWidth / aspectRatio < viewportHeight) {
                    width = viewportWidth;
                    height = viewportWidth / aspectRatio;
                } else {
                    width = viewportHeight * aspectRatio;
                    height = viewportHeight;
                }

                setImageDimensions({ width, height });
            };
            img.src = imagePreview;
        }

        if (imagePreview) {
            calculateDimensions();
        }
    }, [imagePreview]);

    const toggleMode = () => {
        setMode(prevMode => prevMode === 'drawing' ? 'erasing' : 'drawing');
    };

    useEffect(() => {
        setImagePreview(image);

        if (image) {
            processImage();
        }
    }, [image]);


    const processImage = async () => {
        const response = await fetch(image);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('file', blob, 'image.jpg'); // 'image.jpg' is a placeholder name

        try {
            const response = await fetch('http://localhost:5000/process-image', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const responseData = await response.json();
            setDisplayedImageID(responseData.image_id);
            setScribbles(responseData.scribbles);
        } catch (error) {
            console.error('Error during image processing:', error);
        }
    };

    const sendScribblesToBackend = async () => {
        const scribblesCanvas = scribblesCanvasRef.current;
        if (!scribblesCanvas) {
            console.error("Canvas not found");
            return;
        }
    
        // Get canvas data as base64 encoded string
        const scribblesData = scribblesCanvas.toDataURL('image/png');
    
        try {
            const response = await fetch('http://localhost:5000/send-scribbles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ scribbles: scribblesData, image_id: displayedImageID }),
            });
    
            const responseData = await response.json();
            console.log(responseData);
            if (responseData && responseData.processedImage) {
                const fullImageData = `data:image/jpeg;base64,${responseData.processedImage}`;
                setRestoredImage(fullImageData);
            }
        } catch (error) {
            console.error('Error sending scribbles to backend:', error);
        }
    };
    

    return (
        <div>
            <div className="top-controls">
            <button onClick={() => setDisplayedImage('ORIGINAL')}>Show Original</button>
            <button onClick={() => setDisplayedImage('ANNOTATED')}>Show Detected Damage</button>
            <button onClick={() => setDisplayedImage('RESTORED')} disabled={!restoredImage}>Show Restored Image</button>
                <button onClick={toggleMode}>Toggle Mode ({mode})</button>
                <button onClick={sendScribblesToBackend}>Restore Image</button>
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
            </div>
            <div className="image-canvas-container">
                {imagePreview && displayedImage === 'ORIGINAL' && (
                    <div className="pan-zoom-container">
                        <TransformWrapper>
                            <TransformComponent>
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    style={{ width: imageDimensions.width, height: imageDimensions.height }}
                                />
                            </TransformComponent>
                        </TransformWrapper>
                    </div>
                )}
                {displayedImage === 'ANNOTATED' && (
                    <div className="pan-zoom-container">
                        <ImageCanvas
                            image={imagePreview}
                            scribbles={scribbles}
                            canvasRef={canvasRef}
                            scribblesCanvasRef={scribblesCanvasRef}
                            drawnData={drawnData}
                            setDrawnData={setDrawnData}
                            savedDrawing={savedDrawing}
                            mode={mode}
                            brushSize={brushSize}
                            className="canvas-element"
                            style={{ width: imageDimensions.width, height: imageDimensions.height }}
                        />
                    </div>
                )}
                {restoredImage && displayedImage === 'RESTORED' && (
                    <div className="pan-zoom-container">
                        <TransformWrapper>
                            <TransformComponent>
                                <img 
                                    src={restoredImage} 
                                    alt="Processed" 
                                    className="image-preview"   
                                    style={{ width: imageDimensions.width, height: imageDimensions.height }}
                                />
                            </TransformComponent>
                        </TransformWrapper>
                    </div>
                )}
            </div>
        </div>
    );
}
    

export default MainPage;
