import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMicrophone, FaPause, FaStop } from "react-icons/fa";
import "../styles/InterviewPage.css";
import api from "../api/axios"; // ✅ use centralized axios instance

// Helper: Build the evaluation payload
const buildEvaluationPayload = (questionObj, userAnswer) => ({
  question: questionObj.question,
  reference_answer: questionObj.reference_answer,
  keywords: questionObj.keywords,
  user_answer: userAnswer,
});

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

  const { name, skill, difficulty, question, interviewId } = formData;

  const [messages, setMessages] = useState([
    { from: "ai", text: `Welcome ${name}, let's begin your ${difficulty} ${skill} interview.` },
    { from: "ai", text: question?.question || "Tell me about yourself." }
  ]);

  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);

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

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        const formDataAudio = new FormData();
        formDataAudio.append("audio", audioBlob, "recording.webm");

        setLoading(true);
        setTranscript("Transcribing...");

        try {
          const response = await api.post("/api/transcribe", formDataAudio, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const { text } = response.data;
          setTranscript(text);

          const payload = buildEvaluationPayload(currentQuestionRef.current, text);

          setMessages(prev => [...prev, { from: "user", text }]);

          try {
            const evalResponse = await api.post("/api/evaluate", payload);
            const evalResult = evalResponse.data;

            setMessages(prev => [
              ...prev,
              {
                from: "ai",
                text: `Evaluation: Overall Score - ${evalResult.score.overall}. Feedback - ${evalResult.feedback}`
              }
            ]);
          } catch (evalErr) {
            console.error("Evaluation failed:", evalErr);
            setMessages(prev => [...prev, { from: "ai", text: "Evaluation failed." }]);
          }

          setTimeout(async () => {
            try {
              const nextQRes = await api.post("/start", {
                tech: skill,
                difficulty: difficulty
              });

              const nextQuestion = nextQRes.data.question;

              if (nextQuestion?.question) {
                currentQuestionRef.current = nextQuestion;
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

  const handleEndInterview = async () => {
    if (!interviewId) {
      alert("Interview ID not found.");
      return;
    }

    try {
      const response = await api.post("/api/interview-data/complete", {
        interviewId
      });

      if (response.data.success) {
        alert("Interview ended successfully!");
        navigate("/");
      } else {
        alert("Failed to end interview.");
      }
    } catch (err) {
      console.error("❌ Error ending interview:", err);
      alert("Error ending interview.");
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

        <button onClick={handleEndInterview} title="End Interview">
          End Interview
        </button>
      </div>
    </div>
  );
}

export default InterviewPage;
