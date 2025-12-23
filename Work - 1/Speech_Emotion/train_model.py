import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import librosa
import numpy as np
import tensorflow as tf  # Corrected import
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout, Input
from tensorflow.keras.utils import to_categorical
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import pickle

# --- CONFIGURATION ---
DATASET_PATH = "dataset" 
TARGET_EMOTIONS = {
    '01': 'neutral',
    '03': 'happy',
    '04': 'sad',
    '05': 'angry'
}

def extract_mfcc(file_path):
    """Extracts 40 MFCC features from an audio file"""
    try:
        # Load audio (3 seconds)
        audio, sr = librosa.load(file_path, duration=3, offset=0.5)
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
        # Mean across the time axis to get a consistent 1D vector of 40
        return np.mean(mfcc.T, axis=0)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

# --- 1. LOAD DATA ---
if not os.path.exists(DATASET_PATH):
    print(f"Error: Dataset folder '{DATASET_PATH}' not found!")
    exit()

print("Loading dataset... (This may take a few minutes)")
X, y = [], []

for root, dirs, files in os.walk(DATASET_PATH):
    for file in files:
        if file.endswith(".wav"):
            parts = file.split("-")
            # In RAVDESS, the 3rd part of the filename is the emotion
            if len(parts) >= 3:
                emotion_code = parts[2]
                if emotion_code in TARGET_EMOTIONS:
                    file_path = os.path.join(root, file)
                    feature = extract_mfcc(file_path)
                    if feature is not None:
                        X.append(feature)
                        y.append(TARGET_EMOTIONS[emotion_code])

X = np.array(X)
y = np.array(y)

# --- 2. PREPARE DATA ---
lb = LabelEncoder()
y_encoded = to_categorical(lb.fit_transform(y))

# Reshape for LSTM: (samples, time_steps, features)
# Here we treat 40 MFCCs as 40 time steps with 1 feature each
X = X.reshape(X.shape[0], 40, 1)

X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# --- 3. BUILD MODEL (LSTM) ---
# 
model = Sequential([
    Input(shape=(40, 1)), # 40 time steps, 1 feature
    LSTM(128, return_sequences=False),
    Dropout(0.3),
    Dense(64, activation='relu'),
    Dropout(0.3),
    Dense(len(lb.classes_), activation='softmax')
])

model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# --- 4. TRAIN ---
print(f"Training on {len(X_train)} samples...")
history = model.fit(X_train, y_train, epochs=50, batch_size=32, validation_data=(X_test, y_test))

# --- 5. SAVE ---
if not os.path.exists('model'):
    os.makedirs('model')
model.save('model/emotion_model.h5')
with open('model/label_encoder.pkl', 'wb') as f:
    pickle.dump(lb, f)

print(f"Model saved! Final Accuracy: {history.history['accuracy'][-1]*100:.2f}%")