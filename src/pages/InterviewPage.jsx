

import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMicrophone, FaPause, FaStop } from "react-icons/fa";
import "../styles/InterviewPage.css";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Lottie from "lottie-react";
import runningRabbit from "../assets/Long Dog.json";
import api from "../api/axios";
import { encouragements, neutralAcknowledgements, tips } from "../../backend/data/ttsPhrases";

function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;
  const [user, setUser] = useState(null);
  useEffect(() => {
    api.get("/session", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user); // 👈 user contains fullName and username
      })
      .catch(() => {
        setUser(null);
      });
  }, []);


  useEffect(() => {
    if (!formData) navigate("/interview/setup");
  }, [formData, navigate]);

  if (!formData) return null;


  const { name, skill, difficulty, question, interviewId } = formData;

  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const [waitingForStartConfirmation, setWaitingForStartConfirmation] = useState(false);
  const [showWaitingAnimation, setShowWaitingAnimation] = useState(false);
  const [facts, setFacts] = useState([]);
const [randomFact, setRandomFact] = useState("");


  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentQuestionRef = useRef(null);
  const questionCount = qaHistory.length;
  const MAX_QUESTIONS = 5;

  // 🗣️ Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!text || availableVoices.length === 0) return resolve();

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      const sweetVoice = availableVoices.find(v => v.name.includes("Samantha"));
      if (sweetVoice) utterance.voice = sweetVoice;

      utterance.onend = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const quickLocalResponse = async (text) => {
  const lowerText = text.toLowerCase();

  // If unsure
  if (lowerText.includes("i don't know") || lowerText.includes("not sure") || lowerText.includes("no idea")) {
    await speakText(encouragements[Math.floor(Math.random() * encouragements.length)]);
    return;
  }

  // 30% chance to give a general tip
  if (Math.random() < 0.3) {
    await speakText(tips[Math.floor(Math.random() * tips.length)]);
    return;
  }

  // Otherwise give a neutral acknowledgement
  await speakText(neutralAcknowledgements[Math.floor(Math.random() * neutralAcknowledgements.length)]);
};


  useEffect(() => {
  fetch("../../backend/data/facts.json")
    .then((res) => res.json())
    .then((data) => {
      setFacts(data);
    })
    .catch((err) => {
      console.error("Failed to load facts:", err);
    });
}, []);

useEffect(() => {
  if (showWaitingAnimation && facts.length > 0) {
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * facts.length);
      setRandomFact(facts[randomIndex]);
    }, 4500); // every 3 seconds

    // Immediately set a fact when animation starts (optional)
    setRandomFact(facts[Math.floor(Math.random() * facts.length)]);

    return () => clearInterval(intervalId); // cleanup on hide or unmount
  }
}, [showWaitingAnimation, facts]);



  // 🗣️ Initial greeting
  useEffect(() => {
    if (availableVoices.length === 0) return;

    (async () => {
      await speakText(`Hello, I will be taking your ${skill} interview today.`);
      await speakText("Let's begin with your introduction.");
    })();
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
          console.log("🎤 Transcribed Text:", text);
          setTranscript(text);

          // ⏸ Awaiting start confirmation?
          if (waitingForStartConfirmation) {
            const userSaid = text.toLowerCase().trim();
            if (["yes", "yeah", "sure", "okay", "ok", "yup"].some(word => userSaid.includes(word))) {
              console.log("✅ User confirmed to start interview");
              setWaitingForStartConfirmation(false);
              setHasIntroduced(true);

              try {
                const nextQRes = await api.post("/start", {
                  name,
                  tech: skill,
                  difficulty
                });

                const nextQuestion = nextQRes.data.question;
                currentQuestionRef.current = nextQuestion;
                setTranscript("");
                await speakText(nextQuestion.question);
                setQaHistory([{ question: nextQuestion.question, answer: null }]);
              } catch (err) {
                console.error("❌ Error fetching question:", err);
                await speakText("Sorry, I couldn't load your interview questions.");
              } finally {
                setLoading(false);
              }
            } else {
              console.log("❌ User did not confirm start.");
              await speakText("Let me know when you're ready to start the interview.");
              setLoading(false);
            }
            return;
          }

          // 🟡 Intro flow
          if (!hasIntroduced) {
            try {
              const introRes = await api.post("/api/intro", {
  text: text,
  name: user.fullName
});

              console.log("🧠 Intro Parsed:", introRes.data.parsed);
              console.log("📢 Feedback:", introRes.data.message);
              console.log("🔍 Name being sent from frontend:", user.fullName);


              await speakText(introRes.data.message);
              setTranscript("");

              await speakText("Shall we start the interview?");
              setWaitingForStartConfirmation(true);
              toast.info("Awaiting confirmation to begin the interview...");
            } catch (err) {
              toast.error("Intro analysis failed.");
              console.error("❌ Intro error:", err);
              await speakText("Sorry, I couldn't understand your introduction.");
              setLoading(false);
            }
            return;
          }

          // ✅ Regular Q&A
          const payload = {
            question: currentQuestionRef.current.question,
            reference_answer: currentQuestionRef.current.reference_answer,
            keywords: currentQuestionRef.current.keywords,
            user_answer: text,
          };

          await api.post("/api/evaluate-and-save", {
            payload,
            interviewId,
            question: currentQuestionRef.current.question,
            referenceAnswer: currentQuestionRef.current.reference_answer,
            transcript: text,
          });

          await quickLocalResponse(text);

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
                const doneMsg = " Interview completed. Thank you!";
                setTranscript(doneMsg);
                await speakText(doneMsg);

                setLoading(false);
                setShowWaitingAnimation(true);

    setTimeout(async () => {
      try {
        // Call your report generation endpoint here
        await api.post(`/api/report/generate/${interviewId}`);

        // Navigate to the report page
        navigate(`/report/${interviewId}`);
      } catch (err) {
        console.error("Failed to generate report:", err);
        // You can hide the animation if failure occurs
        setShowWaitingAnimation(false);
      }
    }, 25000); // 20 seconds wait
  
  return;
                
              }

              if (nextQuestion?.question) {
                currentQuestionRef.current = nextQuestion;
                await speakText(nextQuestion.question);
                setTranscript("");
                setQaHistory(prev => [...prev, { question: nextQuestion.question, answer: null }]);
              } else {
                await api.post("/api/interview-data/complete", { interviewId });
                const doneMsg = "✅Interview completed. Thank you!";
                setTranscript(doneMsg);
                await speakText(doneMsg);
              }
            } catch {
              const errMsg = "⚠️ Error fetching next question.";
              setTranscript(errMsg);
              await speakText(errMsg);
            } finally {
              setLoading(false);
            }
          }, 2000);

        } catch (err) {
          toast.error("Transcription failed.");
          console.error("❌ Transcription error:", err);
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
        await speakText("Interview ended successfully!");
        navigate("/");
      } else {
        toast.error("Failed to end interview.");
      }
    } catch {
      toast.error("Error ending interview.");
    }
  };

  return (
    <>
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

      {showWaitingAnimation && (
  <div
    style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: 20,
      textAlign: "center",
    }}
  >
    <Lottie animationData={runningRabbit} style={{ width: 200, height: 200 }} loop={true} />
    <p
      style={{
        marginTop: 20,
        fontSize: 18,
        color: "#555",
        fontWeight: "bold",
        maxWidth: "300px",
      }}
    >
      All your answers are being checked and verified.<br /> Please wait...
    </p>

    {/* Show random fact below */}
    {randomFact && (
      <p
        style={{
          marginTop: 30,
          fontSize: 16,
          color: "#444",
          fontStyle: "italic",
          maxWidth: "350px",
        }}
      >
        Did you know? {randomFact}
      </p>
    )}
  </div>
)}

    </>
  );
}


export default InterviewPage;
