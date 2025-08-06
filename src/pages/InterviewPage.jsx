// import { useState, useRef, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { FaMicrophone, FaPause, FaStop } from "react-icons/fa";
// import "../styles/InterviewPage.css";
// import api from "../api/axios"; // ✅ centralized axios instance

// // Helper: Build the evaluation payload
// const buildEvaluationPayload = (questionObj, userAnswer) => ({
//   question: questionObj.question,
//   reference_answer: questionObj.reference_answer,
//   keywords: questionObj.keywords,
//   user_answer: userAnswer,
// });

// function InterviewPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const formData = location.state;

//   useEffect(() => {
//     if (!formData) {
//       navigate("/interview/setup");
//     }
//   }, [formData, navigate]);

//   if (!formData) return null;

//   const { name, skill, difficulty, question, interviewId } = formData;

//   const [messages, setMessages] = useState([
//     { from: "ai", text: `Welcome ${name}, let's begin your ${difficulty} ${skill} interview.` },
//     { from: "ai", text: question?.question || "Tell me about yourself." }
//   ]);

//   const [transcript, setTranscript] = useState("");
//   const [recording, setRecording] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const currentQuestionRef = useRef(question);

//   const handleStartRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = event => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.start();
//       setRecording(true);
//       setPaused(false);
//     } catch (err) {
//       console.error("🎙️ Mic error:", err);
//       alert("Microphone access denied.");
//     }
//   };

//   const handlePauseRecording = () => {
//     if (mediaRecorderRef.current?.state === "recording") {
//       mediaRecorderRef.current.pause();
//       setPaused(true);
//     }
//   };

//   const handleStopRecording = () => {
//     if (mediaRecorderRef.current?.state !== "inactive") {
//       mediaRecorderRef.current.stop();
//       setRecording(false);
//       setPaused(false);

//       mediaRecorderRef.current.onstop = async () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

//         const formDataAudio = new FormData();
//         formDataAudio.append("audio", audioBlob, "recording.webm");

//         setLoading(true);
//         setTranscript("Transcribing...");

//         try {
//           const response = await api.post("/api/transcribe", formDataAudio, {
//             headers: { "Content-Type": "multipart/form-data" },
//           });

//           const { text } = response.data;
//           setTranscript(text);

//           const payload = buildEvaluationPayload(currentQuestionRef.current, text);

//           setMessages(prev => [...prev, { from: "user", text }]);

//           try {
//             const evalResponse = await api.post("/api/evaluate", payload);
//             const evalResult = evalResponse.data;

//             setMessages(prev => [
//               ...prev,
//               {
//                 from: "ai",
//                 text: `Evaluation: Overall Score - ${evalResult.score.overall}. Feedback - ${evalResult.feedback}`
//               }
//             ]);

//             console.log("📤 Saving answer to DB with payload:", {
//   interviewId,
//   question: currentQuestionRef.current.question,
//   referenceAnswer: currentQuestionRef.current.reference_answer,
//   userAnswer: text,
//   transcript: text,
//   scores: evalResult.score,
//   feedback: evalResult.feedback,
// });

//             // ✅ Save the answer
//             await api.post("/api/interview-data/save-answer", {
//               interviewId,
//               question: currentQuestionRef.current.question,
//               referenceAnswer: currentQuestionRef.current.reference_answer,
//               userAnswer: text,
//               transcript: text,
//               scores: evalResult.score,
//               feedback: evalResult.feedback,
//             });

//           } catch (evalErr) {
//             console.error("Evaluation failed:", evalErr);
//             setMessages(prev => [...prev, { from: "ai", text: "Evaluation failed." }]);
//           }

//           // ✅ Fetch next question or end interview
//           setTimeout(async () => {
//             try {
//               const nextQRes = await api.post("/start", {
//                 name:name,
//                 tech: skill,
//                 difficulty: difficulty
//               });

//               const nextQuestion = nextQRes.data.question;

//               if (nextQuestion?.question) {
//                 currentQuestionRef.current = nextQuestion;
//                 setMessages(prev => [...prev, { from: "ai", text: nextQuestion.question }]);
//               } else {
//                 // ✅ Mark interview as complete
//                 await api.post("/api/interview-data/complete", { interviewId });
//                 setMessages(prev => [...prev, { from: "ai", text: "✅ Interview completed. Thank you!" }]);
//               }
//             } catch (fetchErr) {
//               console.error("⚠️ Failed to fetch next question:", fetchErr);
//               setMessages(prev => [...prev, { from: "ai", text: "Error fetching next question." }]);
//             } finally {
//               setLoading(false);
//             }
//           }, 2000);

//         } catch (err) {
//           console.error("❌ Transcription failed:", err);
//           alert("Transcription failed.");
//           setLoading(false);
//         }
//       };
//     }
//   };

//   const handleEndInterview = async () => {
//     if (!interviewId) {
//       alert("Interview ID not found.");
//       return;
//     }

//     try {
//       const response = await api.post("/api/interview-data/complete", {
//         interviewId
//       });

//       if (response.data.success) {
//         alert("Interview ended successfully!");
//         navigate("/");
//       } else {
//         alert("Failed to end interview.");
//       }
//     } catch (err) {
//       console.error("❌ Error ending interview:", err);
//       alert("Error ending interview.");
//     }
//   };

//   return (
//     <div className="interview-wrapper">
//       <div className="chat-box">
//         {messages.map((msg, index) => (
//           <div key={index} className={`chat-bubble ${msg.from}`}>
//             {msg.text}
//           </div>
//         ))}
//       </div>

//       <div className="voice-input-box">
//         <input
//           type="text"
//           value={loading ? "Transcribing..." : transcript}
//           onChange={(e) => setTranscript(e.target.value)}
//           placeholder="Your spoken answer will appear here..."
//           readOnly
//         />

//         {!recording && (
//           <button onClick={handleStartRecording} title="Start Recording">
//             <FaMicrophone />
//           </button>
//         )}

//         {recording && !paused && (
//           <button onClick={handlePauseRecording} title="Pause Recording">
//             <FaPause />
//           </button>
//         )}

//         {recording && (
//           <button onClick={handleStopRecording} title="Stop and Transcribe">
//             <FaStop />
//           </button>
//         )}

//         <button onClick={handleEndInterview} title="End Interview">
//           End Interview
//         </button>
//       </div>
//     </div>
//   );
// }

// export default InterviewPage;



import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMicrophone, FaPause, FaStop } from "react-icons/fa";
import "../styles/InterviewPage.css";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import api from "../api/axios";

function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  useEffect(() => {
    if (!formData) navigate("/interview/setup");
  }, [formData, navigate]);

  if (!formData) return null;

  const { name, skill, difficulty, question, interviewId } = formData;

  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([
    { question: question?.question || "Tell me about yourself.", answer: null }
  ]);
  const [availableVoices, setAvailableVoices] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentQuestionRef = useRef(question);
  const questionCount = qaHistory.length;
  const MAX_QUESTIONS = 5;

  // 🗣️ Load available voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // 🗣️ Speak function with sweet voice
  const speakText = (text) => {
    if (!text || availableVoices.length === 0) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    const sweetVoice = availableVoices.find(
      (v) =>
        v.name.includes("Google UK English Female") ||
        v.name.includes("Google US English") ||
        v.name.includes("Microsoft Zira") ||
        v.name.includes("Samantha")
    );

    if (sweetVoice) utterance.voice = sweetVoice;

    window.speechSynthesis.speak(utterance);
  };

  // 🗣️ Speak first question on page load
  useEffect(() => {
    const firstQ = question?.question || "Tell me about yourself.";
    speakText(firstQ);
  }, [availableVoices]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setRecording(true);
      setPaused(false);
    } catch (err) {
      toast.error("Microphone access denied.");
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

          const payload = {
            question: currentQuestionRef.current.question,
            reference_answer: currentQuestionRef.current.reference_answer,
            keywords: currentQuestionRef.current.keywords,
            user_answer: text,
          };

          api.post("/api/evaluate-and-save", {
            payload,
            interviewId,
            question: currentQuestionRef.current.question,
            referenceAnswer: currentQuestionRef.current.reference_answer,
            transcript: text,
          }).catch(console.error);

          setQaHistory(prev => {
            const updated = [...prev];
            updated[updated.length - 1].answer = text;
            return updated;
          });

          setTimeout(async () => {
            try {
              const nextQRes = await api.post("/start", {
                name,
                tech: skill,
                difficulty
              });

              const nextQuestion = nextQRes.data.question;

              if (qaHistory.length >= MAX_QUESTIONS) {
                await api.post("/api/interview-data/complete", { interviewId });
                const doneMsg = "✅ Interview completed. Thank you!";
                setTranscript(doneMsg);
                speakText(doneMsg);
                setLoading(false);
                return;
              }

              if (nextQuestion?.question) {
                currentQuestionRef.current = nextQuestion;
                speakText(nextQuestion.question);
                setTranscript("");
                setQaHistory(prev => [...prev, { question: nextQuestion.question, answer: null }]);
              } else {
                await api.post("/api/interview-data/complete", { interviewId });
                const doneMsg = "✅ Interview completed. Thank you!";
                setTranscript(doneMsg);
                speakText(doneMsg);
              }
            } catch {
              const errMsg = "⚠️ Error fetching next question.";
              setTranscript(errMsg);
              speakText(errMsg);
            } finally {
              setLoading(false);
            }
          }, 2000);

        } catch (err) {
          toast.error("Transcription failed.");
          setLoading(false);
        }
      };
    }
  };

  const handleEndInterview = async () => {
    if (!interviewId) return toast.warning("Interview ID not found.");

    const confirmEnd = window.confirm("Are you sure you want to end the interview?");
    if (!confirmEnd) return;

    try {
      const response = await api.post("/api/interview-data/complete", { interviewId });

      if (response.data.success) {
        toast.success("Interview ended successfully!");
        speakText("Interview ended successfully!");
        navigate("/");
      } else {
        toast.error("Failed to end interview.");
      }
    } catch {
      toast.error("Error ending interview.");
    }
  };

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h2>Interview with {name}</h2>
        <p>{skill} | {difficulty} | Question {questionCount} of {MAX_QUESTIONS}</p>

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      <div className="qa-history">
        {qaHistory.map((item, index) => (
          <div key={index} className="qa-card">
            <div className="question">
              <strong>Q{index + 1}:</strong> {item.question}
            </div>
            {item.answer && (
              <div className="answer">
                <strong>Your Answer:</strong> {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="controls-box">
        {!recording && (
          <button onClick={handleStartRecording}>
            <FaMicrophone /> Start
          </button>
        )}
        {recording && !paused && (
          <button onClick={handlePauseRecording}>
            <FaPause /> Pause
          </button>
        )}
        {recording && (
          <button onClick={handleStopRecording}>
            <FaStop /> Stop
          </button>
        )}
        <button onClick={handleEndInterview}>End Interview</button>

        {recording && !paused && (
          <div className="audio-wave-container">
            {[...Array(5)].map((_, i) => (
              <div className="audio-bar" key={i}></div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="loader-container">
          <div className="loader" />
          <span>Transcribing...</span>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default InterviewPage;
