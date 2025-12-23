# Speech Emotion Detection Using Deep Learning

## Project Overview
This project focuses on **detecting emotions from speech signals** using deep learning techniques. The model can classify audio recordings into different emotion categories, providing insights into the speaker's emotional state.

---

## Features
- Classifies emotions such as **happy, sad, angry, neutral**, etc.
- Preprocessing of audio data (feature extraction like MFCCs)
- Deep learning model implemented for high accuracy
- Works with real-time audio or prerecorded datasets

---

## Dataset
- Uses publicly available speech emotion datasets (e.g., RAVDESS, TESS)
- Audio files are preprocessed and converted into features suitable for deep learning models

---

## Technologies Used
- **Python** for programming
- **TensorFlow / Keras** for deep learning
- **Librosa** for audio processing
- **NumPy, Pandas, Matplotlib** for data handling and visualization

---

## Installation
1. Clone the repository:
```bash
git clone https://github.com/Prakash-Chandran/Speech-Emotion-Detection-using-Deep-Learning.git
cd Speech-Emotion-Detection-using-Deep-Learning
```
2. Create a virtual environment (optional but recommended):
```
bash
python -m venv venv
```
### Activate the environment:
#### Windows:
```
venv\Scripts\activate
```
#### macOS/Linux:
```
source venv/bin/activate
```
3. Install required packages:
  ~ Run this in your Terminal with the actual path of the file located using ' cd file-path '
```
pip install -r requirements.txt
```
## Usage:
1.Place your audio files in the data folder (or follow the dataset structure provided)
2.Run the preprocessing script:
```
python preprocess.py
```
3.Train the Model  :
```
python train_model.py
```
4.Test the model with new audio samples:
```
python test_model.py --audio path_to_audio_file.wav
```

## File Structure 
```
Speech-Emotion-Detection-using-Deep-Learning/
|
Speech_Emotion/
│
├── __pycache__/            # Python cache files
├── Dataset/                # Dataset folder (audio or data files)
├── model/                  # Likely your trained models or model scripts
├── static/                 # Static files (CSS, JS, images) for web app
├── templates/              # HTML templates for web app
├── app.py                  # Main Flask (or other framework) app
├── requirements.txt        # Python dependencies
├── train_model.py          # Script to train your model
├── __init__db.py           # Probably database initialization (typo? usually __init__.py)
├── login.php               # PHP login script (interesting mix with Python)
├── main_app.py             # Another Python app script
├── test_email.py           # Script to test email functionality
├── test123.py              # Some test script
├── users.db                # Database file (SQLite likely)
```
## Results:
  - The trained model can predict emotions with high accuracy on test datasets.
  - Example predictions: happy, sad, angry, neutral.

## License:
  This project is open-source and available under the **MIT License**.

---

## Author

**Prakash Chandran**  
GitHub: [https://github.com/Prakash-Chandran](https://github.com/Prakash-Chandran)
