import whisper
import json
import sys
import os
import tempfile
import base64

MODEL = None

def load_model():
    global MODEL
    if MODEL is None:
        print("[Whisper] Loading model...", file=sys.stderr)
        MODEL = whisper.load_model("base")
        print("[Whisper] Model ready!", file=sys.stderr)
    return MODEL

def transcribe_audio(audio_path):
    try:
        model = load_model()
        print(f"[Whisper] Transcribing: {audio_path}", file=sys.stderr)

        result = model.transcribe(
        audio_path,
        language="en",
        task="transcribe",
        fp16=False,
        temperature=0.0,        # More deterministic = more accurate
        best_of=5,              # Try 5 times, pick best
        beam_size=5,            # Better search = better accuracy
        condition_on_previous_text=False  # Avoid hallucinations
)

        return {
            "success": True,
            "text": " ".join(result["text"]).strip() if isinstance(result["text"], list) else result["text"].strip(),
            "language": result.get("language", "en")
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": ""
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)

    audio_file = sys.argv[1]

    if not os.path.exists(audio_file):
        print(json.dumps({"error": f"File not found: {audio_file}"}))
        sys.exit(1)

    result = transcribe_audio(audio_file)
    print(json.dumps(result))