import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import numpy as np
import librosa
import pickle
import tensorflow as tf
from flask import Flask, request, jsonify, render_template, redirect, url_for, session, Blueprint

# -------------------- Blueprint Setup --------------------
# We name the blueprint 'speech'
speech_bp = Blueprint('speech', 
                      __name__, 
                      template_folder='templates',   
                      static_folder='static')           

# -------------------- Model & Label Loading --------------------
MODEL_PATH = 'Speech_Emotion/model/emotion_model.h5'
LABEL_PATH = 'Speech_Emotion/model/label_encoder.pkl'

model = None
lb = None

if os.path.exists(MODEL_PATH) and os.path.exists(LABEL_PATH):
    model = tf.keras.models.load_model(MODEL_PATH)
    with open(LABEL_PATH, 'rb') as f:
        lb = pickle.load(f)
    print("Model and Labels loaded successfully.")
else:
    print("Warning: Model or Labels not found!")

# -------------------- Helper Functions --------------------
def extract_mfcc(file_path):
    audio, sr = librosa.load(file_path, duration=3, offset=0.5)
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    return np.mean(mfcc.T, axis=0)

# -------------------- Blueprint Routes --------------------

@speech_bp.route('/')
def speech_emotion():  # CHANGED FROM home() TO speech_emotion()
    """This matches url_for('speech.speech_emotion')"""
    return render_template('index.html')

@speech_bp.route('/predict', methods=['POST'])
def predict():
    if model is None or lb is None:
        return jsonify({'error': 'Model not loaded on server'}), 500
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static/uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        features = extract_mfcc(filepath)
        features = features.reshape(1, 40, 1) 
        prediction = model.predict(features)[0]

        emotion_probs = {lb.classes_[i]: float(prediction[i]) for i in range(len(lb.classes_))}
        predicted_idx = np.argmax(prediction)
        
        return jsonify({
            'emotion': lb.classes_[predicted_idx],
            'confidence': f"{float(prediction[predicted_idx])*100:.1f}%",
            'probabilities': emotion_probs
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)