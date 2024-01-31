import React, { useState } from 'react';
import MainPage from './components/MainPage';

function App() {
  const [image, setImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const uploadedImage = URL.createObjectURL(file);
      setImage(uploadedImage);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>PRISM</h1>
      </div>
      {!image ? (
        <input type="file" onChange={handleImageChange} accept="image/*" />
      ) : (
        <MainPage image={image} />
      )}
    </div>
  );
}

export default App;
