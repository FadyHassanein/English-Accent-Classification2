# 🗣️ English Dialect Classification App

An intelligent, AI-powered web application that analyzes spoken English from video content and classifies the speaker's dialect. Built for **hiring evaluation**, this tool delivers accurate accent detection, confidence scores, and actionable insights.

---

## 🚀 Key Features

- 🎥 **Multi-Platform Video Support**  
  Works with YouTube, Loom, MP4 links, and 1000+ video sources

- 🤖 **Transformer-Based AI Model**  
  Uses state-of-the-art models from Hugging Face for dialect classification

- 🧠 **Confidence Scoring**  
  Provides ranked probability scores for each predicted accent

- 💼 **Recruitment-Oriented**  
  Tailored for HR screening, interview analysis, and candidate evaluation

- 🌐 **Modern Web Interface**  
  Built with React + Material-UI for a clean and responsive UI

- ⚡ **Real-Time Processing**  
  Instant feedback and visual results upon submission

---

## 🌍 Supported Dialects

- 🇺🇸 American English  
- 🇬🇧 British English  
- 🇦🇺 Australian English  
- 🇨🇦 Canadian English  
- 🇮🇳 Indian English  
- 🇮🇪 Irish English  
- 🏴 Scottish English  
- 🇿🇦 South African English  
*(...and more as the model expands)*

---

## 🛠️ Prerequisites

Install the following tools before setup:

- **Python** (3.9 or 3.10 recommended)
- **FFmpeg** (audio/video processing)
- **yt-dlp** (YouTube & video downloader)

### 🔧 Installation Guides

#### Windows
```bash
# Download Python from https://www.python.org
# Download FFmpeg from https://ffmpeg.org and add to system PATH

pip install yt-dlp
```

#### macOS (Homebrew)
```bash
brew install python ffmpeg yt-dlp
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3 python3-pip ffmpeg
pip3 install yt-dlp
```

---

## 📦 Project Structure

```
english_dialect_classification/
├── backend/
│   ├── app.py              # FastAPI backend
│   ├── requirements.txt    # Python dependencies
│   └── static/             # Bundled React frontend
│       ├── index.html
│       └── static/
```

---

## ⚙️ Installation & Run

### Step 1: Navigate to Backend Folder
```bash
cd backend
```

### Step 2: Create & Activate Virtual Environment
```bash
python -m venv venv

# Activate:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Start the Application
```bash
python app.py
# or
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Step 5: Navigate to the frontend folder
```
cd ..
cd backend
```
### Step 6: start the app
```
npm install
npm start
```
---

## 🧠 How It Works

### 1. 📤 Frontend Submission
- User enters a video URL
- Request sent to FastAPI backend for processing

### 2. 🎞️ Video Download
- Uses `yt-dlp` to download video to a temporary file

### 3. 🔊 Audio Extraction
- `MoviePy` extracts audio and converts it to WAV format (16kHz mono)

### 4. 🎧 Preprocessing
- `torchaudio` loads and prepares waveform tensor for inference

### 5. 🧠 AI Classification
- Transformer model (`dima806/english_accents_classification`) runs inference
- Returns probability scores for supported dialects

### 6. 📈 Results Formatting
- Scores ranked and formatted
- Sent back to frontend for display

---

## 🔁 Data Flow Diagram

```
User Input URL
        ↓
     yt-dlp
   [Download Video]
        ↓
     MoviePy
   [Extract Audio]
        ↓
   torchaudio
 [Preprocess Tensor]
        ↓
   Hugging Face Model
 [Predict Dialect]
        ↓
   FastAPI → React
 [Display Results]
```

---

## 🧪 Example Usage

```json
POST /api/classify_dialect/

Request:
{
  "url": "https://www.youtube.com/shorts/KxXcpaLrhHw"
}

Response:
{
  "results": [
    {"label": "australia", "score": 0.919},
    {"label": "us", "score": 0.036}
  ]
}
```

---

## 🔍 API Endpoints

- `GET /api/`  
  Health check — returns welcome message

- `POST /api/classify_dialect/`  
  Input: `{ "url": "<video_url>" }`  
  Output: JSON with sorted dialect predictions

---

## 🧰 Troubleshooting

| Issue                        | Solution                                             |
|-----------------------------|------------------------------------------------------|
| `yt-dlp` not found          | `pip install yt-dlp` + ensure it’s in PATH          |
| `ffmpeg` not found          | Install and add FFmpeg to system PATH               |
| Model not downloading       | Check internet connection and available disk space  |
| Audio extraction fails      | Make sure video contains audio & has correct format |

---

## ⚡ Performance Tips

- **First Run**: Model download may take a few minutes
- **RAM**: Ensure 4GB+ free for smooth inference
- **Processing Time**: 30–90 seconds per video
- **Disk Usage**: ~100MB per video for temporary files

---

## 📄 License

This project is proprietary and intended solely for **internal hiring evaluations**.

---

## 🤝 Support

For bug reports or questions, contact the development team or submit an issue internally.
