import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMicrophone, FaPause, FaStop } from "react-icons/fa";
import "../styles/InterviewPage.css";
import axios from "axios";

// Helper: Build the evaluation payload from the current question and user answer
const buildEvaluationPayload = (questionObj, userAnswer) => {
  return {
    question: questionObj.question,
    reference_answer: questionObj.reference_answer,
    keywords: questionObj.keywords,
    user_answer: userAnswer,
  };
};

function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  // Redirect to setup if formData is missing
  useEffect(() => {
    if (!formData) {
      navigate("/interview/setup");
    }
  }, [formData, navigate]);

  if (!formData) return null;

  // Destructure initial data from formData
  const { name, skill, difficulty, question } = formData;

  // Keep track of messages shown in chat UI
  const [messages, setMessages] = useState([
    { from: "ai", text: `Welcome ${name}, let's begin your ${difficulty} ${skill} interview.` },
    { from: "ai", text: question?.question || "Tell me about yourself." }
  ]);

  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs for MediaRecorder and current question
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentQuestionRef = useRef(question);

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

      // When recording stops, process the audio
      mediaRecorderRef.current.onstop = async () => {
        console.log("🛑 Recording stopped");

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        console.log("🔊 Blob created:", audioBlob);

        const formDataAudio = new FormData();
        formDataAudio.append("audio", audioBlob, "recording.webm");

        console.log("📤 Sending POST to /api/transcribe");

        setLoading(true);
        setTranscript("Transcribing...");

        try {
          // Send the audio for transcription
          const response = await axios.post("http://localhost:5050/api/transcribe", formDataAudio, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

          const { text } = response.data;
          setTranscript(text);

          // Build evaluation payload from current question and transcribed text
          const payload = buildEvaluationPayload(currentQuestionRef.current, text);
          console.log("📦 Evaluation Payload:", payload);

          // First, update the chat with the user answer
          setMessages(prev => [...prev, { from: "user", text }]);

          // Send the evaluation payload to the backend
          try {
            const evalResponse = await axios.post("http://localhost:5050/api/evaluate", payload, {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
            
            const evalResult = evalResponse.data;
            // Display evaluation result below the user answer
            setMessages(prev => [
              ...prev,
              {
                from: "ai",
                text: `Evaluation: Overall Score - ${evalResult.score.overall}. Feedback - ${evalResult.feedback}`
              }
            ]);
          } catch (evalErr) {
            console.error("Evaluation failed:", evalErr);
            setMessages(prev => [
              ...prev,
              { from: "ai", text: "Evaluation failed." }
            ]);
          }

          // Wait 2 seconds before fetching the next question to give the user time to read the evaluation
          setTimeout(async () => {
            try {
              const nextQRes = await axios.post("http://localhost:5050/start", {
                tech: skill,
                difficulty: difficulty
              });
              const nextQuestion = nextQRes.data.question;
              if (nextQuestion?.question) {
                // Update current question reference
                currentQuestionRef.current = nextQuestion;
                // Append the new question to the chat
                setMessages(prev => [...prev, { from: "ai", text: nextQuestion.question }]);
              } else {
                setMessages(prev => [...prev, { from: "ai", text: "No more questions. Thank you!" }]);
              }
            } catch (fetchErr) {
              console.error("⚠️ Failed to fetch next question:", fetchErr);
              setMessages(prev => [...prev, { from: "ai", text: "Error fetching next question." }]);
            }
            setLoading(false);
          }, 2000);

        } catch (err) {
          console.error("❌ Transcription failed:", err);
          alert("Transcription failed.");
          setLoading(false);
        }
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
