from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image, ImageDraw
import io
import random
import os
import uuid
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for your Flask app

def generate_scribbles(width, height):
    scribbles = [[random.randint(0, 1) for _ in range(width)] for _ in range(height)]
    return scribbles

@app.route('/process-image', methods=['POST'])
def process_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Convert uploaded image to black and white
    img = Image.open(file.stream)
    img_bw = img.convert('L')  # Convert to grayscale (L mode)

    # Get the image dimensions
    width, height = img_bw.size

    # Generate the 2D array of 1s and 0s
    scribbles = generate_scribbles(width, height)

    # Save the image with scribbles
    img_bytes = io.BytesIO()
    img_bw.save(img_bytes, format='JPEG')  # Save in JPEG format
    img_bytes.seek(0)

    # Generate a unique image identifier
    image_id = generate_unique_id()

    # Save the image to a known location or database with the generated image_id
    save_image_to_location(image_id, img_bytes.getvalue())
    # Encode image data to base64
    img_base64 = base64.b64encode(img_bytes.getvalue()).decode()

    # Return a clean JSON response with base64 encoded image data and scribbles
    return jsonify({
        'image': img_base64,
        'scribbles': scribbles  # Send the serialized scribbles
    })
# Function to generate a unique image identifier
def generate_unique_id():
    # Generate a UUID (Universally Unique Identifier) as the image identifier
    return str(uuid.uuid4())

# Function to save the image to a known location or directory
def save_image_to_location(image_id, image_data):
    # Define the directory where images will be saved
    save_directory = 'images'  # You can change this to your desired directory

    # Ensure the directory exists, create it if it doesn't
    if not os.path.exists(save_directory):
        os.makedirs(save_directory)

    # Create a file path using the image_id and save the image there
    file_path = os.path.join(save_directory, f'{image_id}.jpg')

    # Save the image to the specified file path
    with open(file_path, 'wb') as file:
        file.write(image_data)
if __name__ == '__main__':
    app.run(debug=False)  # Turn off debug mode for production
