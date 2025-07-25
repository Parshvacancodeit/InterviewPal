import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMicrophone, FaPause, FaStop } from "react-icons/fa";
import "../styles/InterviewPage.css";
import axios from "axios";



function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  useEffect(() => {
    if (!formData) {
      navigate("/interview/setup");
    }
  }, [formData, navigate]);

  if (!formData) return null;
  const { name, skill, difficulty } = formData;

  const [messages, setMessages] = useState([
    { from: "ai", text: `Welcome ${name}, let's begin your ${difficulty} ${skill} interview.` },
    { from: "ai", text: "Tell me about yourself." }
  ]);
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setPaused(false);
    } catch (err) {
      console.error("🎙️ Mic error:", err);
      alert("Microphone access denied.");
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setPaused(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setPaused(false);

      mediaRecorderRef.current.onstop = async () => {
  console.log("🛑 Recording stopped");

  const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
  console.log("🔊 Blob created:", audioBlob);

  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  console.log("📤 Sending POST to /api/transcribe");

  setLoading(true);
  setTranscript("Transcribing...");

  try {
    const response = await axios.post("http://localhost:5050/api/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true, // 👈 Make sure cookies are sent
    });

    console.log("✅ Received response:", response.data);

    const { text } = response.data;
    setTranscript(text);

    setMessages(prev => [
      ...prev,
      { from: "user", text },
      { from: "ai", text: "That's interesting! Can you explain event delegation?" }
    ]);
  } catch (err) {
    console.error("❌ Transcription failed:", err);
    alert("Transcription failed.");
  }

  setLoading(false);
};

    }
  };

  return (
    <div className="interview-wrapper">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.from}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="voice-input-box">
        <input
          type="text"
          value={loading ? "Transcribing..." : transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your spoken answer will appear here..."
          readOnly
        />

        {!recording && (
          <button onClick={handleStartRecording} title="Start Recording">
            <FaMicrophone />
          </button>
        )}

        {recording && !paused && (
          <button onClick={handlePauseRecording} title="Pause Recording">
            <FaPause />
          </button>
        )}

        {recording && (
          <button onClick={handleStopRecording} title="Stop and Transcribe">
            <FaStop />
          </button>
        )}
      </div>
    </div>
  );
}

export default InterviewPage;
