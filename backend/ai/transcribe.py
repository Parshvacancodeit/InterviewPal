import whisper
import sys

def transcribe_audio(audio_path):
    print("🔍 Loading Whisper model")
    model = whisper.load_model("base")
    print(f"🎧 Transcribing audio: {audio_path}")
    result = model.transcribe(audio_path)
    print("📃 Transcription result:", result["text"])
    return result['text']

if __name__ == "__main__":
    audio_path = sys.argv[1]
    print("🐍 Python script started with path:", audio_path)
    print(transcribe_audio(audio_path))
