import io
import numpy as np
import tensorflow as tf

from PIL import Image

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse

from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Load model
model = tf.keras.models.load_model(
    "model_bahan_pangan.keras",
    custom_objects={
        'preprocess_input': preprocess_input
    }
)

# Class labels
class_names = [
    'AYAM',
    'JAGUNG',
    'KENTANG',
    'TELOR',
    'TEMPE',
    'TERONG UNGU'
]

# Threshold confidence
THRESHOLD = 0.80

# FastAPI app
app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "Food Classification API Running"
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Read image
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")

    # Resize image
    image = image.resize((224, 224))

    # Convert image to array
    image_array = np.array(image)

    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)

    # Predict
    prediction = model.predict(image_array)

    confidence = float(np.max(prediction))

    predicted_class = int(np.argmax(prediction))

    # Threshold handling
    if confidence >= THRESHOLD:
        result = class_names[predicted_class]
    else:
        result = "Bahan pangan tidak dikenali"

    return JSONResponse({
        "prediction": result,
        "confidence": round(confidence * 100, 2)
    })