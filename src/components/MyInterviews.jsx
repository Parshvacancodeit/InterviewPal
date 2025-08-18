import React, { useEffect, useState } from "react";
import "../styles/MyInterviews.css";
import axios from '../api/axios';

const MyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // New state

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await axios.get("/api/interview-fetch", { withCredentials: true });
        const valid = res.data.filter(
          (interview) =>
            interview.completed &&
            Array.isArray(interview.questions) &&
            interview.questions.length > 0 &&
            interview.questions.some((q) => q && q.question && q.question.trim() !== "")
        );
        setInterviews(valid);
        if (valid.length > 0) setSelectedId(valid[0]._id);
      } catch (err) {
        console.error("Error fetching interviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const selectedInterview = interviews.find((i) => i._id === selectedId);

  if (loading) return <p className="loading">Loading interviews...</p>;
  if (interviews.length === 0) return <p className="loading">No interviews found.</p>;

  return (
    <div className={`my-interviews-wrapper ${sidebarOpen ? '' : 'collapsed'}`}>
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">My Interviews</h3>
          <button
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>
        {sidebarOpen && interviews.map((interview) => (
          <div
            key={interview._id}
            className={`tab ${selectedId === interview._id ? "active" : ""}`}
            onClick={() => setSelectedId(interview._id)}
          >
            {interview.interviewTitle}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="interview-content">
        <header className="interview-header">
          <h2>{selectedInterview.interviewTitle}</h2>
          <p><strong>Skill:</strong> {selectedInterview.skill}</p>
          <p><strong>Difficulty:</strong> {selectedInterview.difficulty}</p>
          <p><strong>Completed At:</strong> {new Date(selectedInterview.completedAt).toLocaleString()}</p>
        </header>

        <div className="questions-section">
          {selectedInterview.questions
            .filter((qa) => qa && qa.question)
            .map((qa, idx) => (
              <div key={idx} className="qa-card">
                <div className="qa-header">
                  <h4>Q{idx + 1}: {qa.question}</h4>
                  {qa.scores?.overall !== undefined && (
                    <span className="overall-score">Score: {qa.scores.overall}/10</span>
                  )}
                </div>
                <div className="qa-body">
                  <p><strong>Your Answer:</strong> {qa.userAnswer}</p>
                  <p><strong>Reference:</strong> {qa.referenceAnswer}</p>
                  <p><strong>Feedback:</strong> {qa.feedback}</p>
                </div>
              </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyInterviews;
