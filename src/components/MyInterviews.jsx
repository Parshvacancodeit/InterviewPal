import React, { useEffect, useState } from "react";

import "../styles/MyInterviews.css";
import axios from '../api/axios';

const MyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await axios.get("/api/interview-fetch", { withCredentials: true });
        const valid = res.data.filter(
          (interview) =>
            interview.completed &&
            interview.questions &&
            interview.questions.length > 0 &&
            interview.questions.some((q) => q.question?.trim() !== "")
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

  if (loading) return <p>Loading interviews...</p>;

  if (interviews.length === 0) return <p>No interviews found.</p>;

  return (
    <div className="my-interviews-wrapper">
      <div className="tabs">
        {interviews.map((interview) => (
          <div
            key={interview._id}
            className={`tab ${selectedId === interview._id ? "active" : ""}`}
            onClick={() => setSelectedId(interview._id)}
          >
            {interview.interviewTitle}
          </div>
        ))}
      </div>

      <div className="interview-content">
        <h2>{selectedInterview.interviewTitle}</h2>
        <p><strong>Skill:</strong> {selectedInterview.skill}</p>
        <p><strong>Difficulty:</strong> {selectedInterview.difficulty}</p>
        <p><strong>Completed At:</strong> {new Date(selectedInterview.completedAt).toLocaleString()}</p>

        <div className="questions-section">
          {selectedInterview.questions.map((qa, idx) => (
            qa.question && (
              <div key={idx} className="qa-card">
                <h4>Q{idx + 1}: {qa.question}</h4>
                <p><strong>Your Answer:</strong> {qa.userAnswer}</p>
                <p><strong>Reference:</strong> {qa.referenceAnswer}</p>
                <p><strong>Transcript:</strong> {qa.transcript}</p>
                <p><strong>Feedback:</strong> {qa.feedback}</p>
                <ul>
                  <li>Overall: {qa.scores?.overall}</li>
                  <li>Relevance: {qa.scores?.relevance}</li>
                  <li>Completeness: {qa.scores?.completeness}</li>
                  <li>Grammar: {qa.scores?.grammar}</li>
                </ul>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyInterviews;
