import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';

function App() {
  const [image, setImage] = useState(null);
  
  const handleImageChange = (uploadedImage) => {
    setImage(uploadedImage);
  };

  return (
    <div className="App">
      <h1>PRISM</h1>
      <ImageUploader onImageChange={handleImageChange} />
      {image && <img src={image} alt="Uploaded" />}
    </div>
  );
}

export default App;
