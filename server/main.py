"""
ARIA TTS Server — FastAPI + Kokoro TTS (Pipelined)
Generates sentences in parallel, sends as each completes
Run: uvicorn main:app --host 0.0.0.0 --port 8765 --reload
"""

import json
import base64
import io
import asyncio
import numpy as np
import soundfile as sf
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from kokoro_onnx import Kokoro
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading Kokoro TTS model...")
kokoro = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
executor = ThreadPoolExecutor(max_workers=2)
print("✅ Kokoro ready!")


def generate_word_timings(text: str, duration: float) -> list:
    words = text.split()
    if not words:
        return []
    timings = []
    time_per_char = duration / max(len(text), 1)
    current_time = 0.0
    for word in words:
        word_duration = len(word) * time_per_char
        timings.append({
            "word": word,
            "start": round(current_time, 3),
            "end": round(current_time + word_duration, 3),
        })
        current_time += word_duration + (time_per_char * 1.2)
    return timings


def audio_to_base64(samples: np.ndarray, sample_rate: int) -> str:
    buf = io.BytesIO()
    sf.write(buf, samples, sample_rate, format="WAV")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def generate_audio(text: str):
    """Runs in thread pool — blocking Kokoro call"""
    samples, sample_rate = kokoro.create(
        text,
        voice="af_bella",
        speed=1.0,
        lang="en-us",
    )
    return samples, sample_rate


@app.websocket("/ws/tts")
async def tts_websocket(websocket: WebSocket):
    await websocket.accept()
    print("🔌 Client connected")

    # Queue of sentences to generate
    sentence_queue: asyncio.Queue = asyncio.Queue()
    # Queue of generated audio ready to send
    audio_queue: asyncio.Queue = asyncio.Queue()

    async def producer():
        """Receives sentences from frontend and queues them"""
        try:
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)

                if message.get("type") == "cancel":
                    # Clear queues on cancel
                    while not sentence_queue.empty():
                        sentence_queue.get_nowait()
                    while not audio_queue.empty():
                        audio_queue.get_nowait()
                    continue

                text = message.get("text", "").strip()
                if text:
                    await sentence_queue.put(text)
        except WebSocketDisconnect:
            await sentence_queue.put(None)  # Signal shutdown

    async def generator():
        """Takes sentences from queue, generates audio in thread pool"""
        loop = asyncio.get_event_loop()
        while True:
            text = await sentence_queue.get()
            if text is None:
                await audio_queue.put(None)
                break
            print(f"🎙 Generating: {text[:50]}...")
            try:
                samples, sample_rate = await loop.run_in_executor(
                    executor, generate_audio, text
                )
                duration = len(samples) / sample_rate
                word_timings = generate_word_timings(text, duration)
                audio_b64 = audio_to_base64(samples, sample_rate)
                await audio_queue.put({
                    "type": "tts",
                    "audio": audio_b64,
                    "sampleRate": sample_rate,
                    "duration": duration,
                    "words": word_timings,
                })
                print(f"✅ Generated {duration:.1f}s audio — queued")
            except Exception as e:
                print(f"❌ TTS error: {e}")
                await audio_queue.put({"type": "error", "message": str(e)})

    async def sender():
        """Sends generated audio to frontend as each one completes"""
        while True:
            item = await audio_queue.get()
            if item is None:
                break
            try:
                await websocket.send_text(json.dumps(item))
                print(f"📤 Sent to client")
            except Exception as e:
                print(f"❌ Send error: {e}")
                break

    try:
        await asyncio.gather(producer(), generator(), sender())
    except WebSocketDisconnect:
        print("🔌 Client disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
    finally:
        print("🔌 Session ended")


@app.get("/health")
async def health():
    return {"status": "ok", "model": "kokoro-v1.0"}