from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from fastapi.staticfiles import StaticFiles
import uvicorn
from transformers import pipeline
import subprocess
from moviepy.editor import VideoFileClip
import tempfile
import os
import torchaudio
import time


app= FastAPI(description="API for English Dialect classification",)

dialect_classifier = pipeline("audio-classification", model="dima806/english_accents_classification")


origins = [
    "http://localhost:3000",  # Your React frontend development server
    # Add your production frontend URL here if applicable
    # "https://your-frontend-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specific origins
    allow_credentials=True, # Allows cookies to be included in requests
    allow_methods=["*"],    # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],    # Allows all headers
)



FFMPEG_PATH= None
def download_video_yt_dlp(video_url, output_path="downloaded_video.mp4"):
    """
    Downloads a video from a public URL using yt-dlp.
    Supports direct MP4 links, Loom, YouTube, and many other sites.
    """
    print(f"Attempting to download video from: {video_url}")
    command = ['yt-dlp', '-o', output_path, '--no-check-certificate']

    # If ffmpeg path is specified, tell yt-dlp where to find it
    # This is useful if yt-dlp needs ffmpeg for merging formats or post-processing
    if FFMPEG_PATH and os.path.exists(FFMPEG_PATH):
        ffmpeg_dir = os.path.dirname(FFMPEG_PATH)
        command.extend(['--ffmpeg-location', ffmpeg_dir])
    elif FFMPEG_PATH and not os.path.exists(FFMPEG_PATH):
        print(f"Warning: Specified FFMPEG_PATH '{FFMPEG_PATH}' does not exist. yt-dlp will try to find ffmpeg in PATH.")

    # Enforce mp4 format if possible, otherwise let yt-dlp choose best
    command.extend(['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', video_url])


    try:
        # Remove existing file if it exists to avoid issues with yt-dlp
        if os.path.exists(output_path):
            os.remove(output_path)

        process = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"Video downloaded successfully to: {output_path}")
        print(f"yt-dlp output:\n{process.stdout}")
        if process.stderr:
            print(f"yt-dlp errors/warnings:\n{process.stderr}")
        return output_path
    except FileNotFoundError:
        print("Error: yt-dlp command not found. Please ensure yt-dlp is installed and in your PATH.")
        return None
    except subprocess.CalledProcessError as e:
        print(f"Error during video download with yt-dlp:")
        print(f"Command: {' '.join(e.cmd)}")
        print(f"Return code: {e.returncode}")
        print(f"Output: {e.stdout}")
        print(f"Error output: {e.stderr}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred during download: {e}")
        return None
    

def extract_audio_moviepy(video_path, audio_path="extracted_audio.wav"):
    """
    Extracts audio from a video file using MoviePy and saves it as WAV.
    """
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return None

    print(f"Extracting audio from: {video_path}")
    try:
        # If FFMPEG_PATH is set, configure MoviePy to use it
        if FFMPEG_PATH and os.path.exists(FFMPEG_PATH) and "FFMPEG_BINARY" not in os.environ:
             # MoviePy checks for FFMPEG_BINARY env var or tries to find ffmpeg.
             # This is an alternative way if direct config is needed, but often not required if in PATH.
             # from moviepy.config import change_settings
             # change_settings({"FFMPEG_BINARY": FFMPEG_PATH})
             print(f"Note: If MoviePy fails, ensure ffmpeg is in PATH or configure MoviePy's FFMPEG_BINARY setting.")


        video_clip = VideoFileClip(video_path)
        audio_clip = video_clip.audio
        # Export as WAV, 16kHz, mono - common for speech models
        audio_clip.write_audiofile(audio_path, fps=16000, nbytes=2, codec='pcm_s16le')
        audio_clip.close()
        video_clip.close()
        print(f"Audio extracted successfully to: {audio_path}")
        return audio_path
    except Exception as e:
        print(f"Error extracting audio with MoviePy: {e}")
        # Attempt to clean up if video_clip was defined
        if 'video_clip' in locals() and video_clip:
            video_clip.close()
        if 'audio_clip' in locals() and audio_clip:
            audio_clip.close()
        return None
    



@app.get("/")
def welcome():
    return {"message": "Welcome to the English Dialect Classification API!"}

# Pydantic Model for Request Body
# This defines the expected structure and validates the input
class URLPayload(BaseModel):
    url: HttpUrl

# ... (dialect_classifier, download_video_yt_dlp, extract_audio_moviepy functions remain mostly the same,
#      but ensure they use the output_path arguments passed to them)

@app.post("/classify_dialect/")
async def inference(payload: URLPayload): # Consider async for I/O bound tasks
    start= time.time()
    received_url = str(payload.url)
    print(f"Received URL: {received_url}")
    temp_video_file = None
    temp_audio_file = None

    try:
        # Create temporary files with unique names
        # delete=False means we are responsible for deleting the file
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tvf:
            temp_video_path = tvf.name
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as taf:
            temp_audio_path = taf.name

        # Download video using yt-dlp to the temporary path
        video_path_result = download_video_yt_dlp(received_url, output_path=temp_video_path)
        if not video_path_result:
            # Ensure temp files are cleaned up even on early exit if they were created
            if os.path.exists(temp_video_path): os.remove(temp_video_path)
            if os.path.exists(temp_audio_path): os.remove(temp_audio_path)
            return {"error": "Failed to download the video."}

        # Extract audio from the downloaded video to the temporary path
        audio_path_result = extract_audio_moviepy(temp_video_path, audio_path=temp_audio_path)
        if not audio_path_result:
            # Ensure temp files are cleaned up
            if os.path.exists(temp_video_path): os.remove(temp_video_path)
            if os.path.exists(temp_audio_path): os.remove(temp_audio_path)
            return {"error": "Failed to extract audio from the video."}

        # Load and classify the audio
        waveform, sample_rate = torchaudio.load(temp_audio_path)

        if waveform.shape[0] > 1: # More than one channel
            waveform = waveform.mean(dim=0, keepdim=True)

        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            waveform = resampler(waveform)

        results = dialect_classifier(waveform.squeeze().numpy())
        print(results)
        end= time.time()
        print(f"Processing time: {end - start} seconds")
        return {"results": results}

    except Exception as e:
        print(f"An error occurred during processing: {e}")
        return {"error": f"An internal server error occurred: {str(e)}"}
    finally:
        # Clean up temporary files
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
