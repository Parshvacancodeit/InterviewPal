import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { Bar } from "react-chartjs-2";
import {
  FaCalendarAlt,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaCommentDots,
} from "react-icons/fa";
import "../styles/Report.css";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Report = () => {
  const { interviewId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/api/report/interview/${interviewId}`);
        setReport(res.data);
      } catch (error) {
        console.error("Failed to load report", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [interviewId]);

  if (loading) return <div className="report-loading">Loading report...</div>;
  if (!report) return <div className="report-error">Report not found.</div>;

  // Correct answers calculation (≥ 7 is correct)
  const correctCount = report.scoreChart.filter(score => score >= 7).length;
  const correctPercentage = ((correctCount / report.scoreChart.length) * 100).toFixed(1);

  // Chart data
  const chartData = {
    labels: report.scoreChart.map((_, i) => `Q${i + 1}`),
    datasets: [
      {
        label: "Score",
        data: report.scoreChart,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: context, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = context.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "#a78bfa");
          gradient.addColorStop(1, "#4f46e5");
          return gradient;
        },
        borderRadius: 6,
      },
    ],
  };

  // Star rating calculation (out of 5)
  const starValue = Math.round((report.averageScore / 10) * 5 * 2) / 2; // round to half

  return (
    <div className="report-wrapper fade-in">
      {/* Header */}
      <div className="report-header">
        <h1>Interview Report</h1>
        <div className="report-subheader">
          <span><FaCalendarAlt /> {new Date(report.createdAt).toLocaleString()}</span>
          <span><FaStar /> Topic: {report.topic}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="report-card fade-in">
          <h3>Average Score</h3>
          <div className="score-value">{report.averageScore.toFixed(2)} / 10</div>
          <div className="stars-container">
            {[...Array(5)].map((_, i) => {
              const full = i + 1 <= Math.floor(starValue);
              const half = !full && i + 0.5 <= starValue;
              return (
                <FaStar
                  key={i}
                  className={`star-icon ${full ? "full" : half ? "half" : "empty"}`}
                />
              );
            })}
          </div>
        </div>
        <div className="report-card fade-in">
          <h3>Total Questions</h3>
          <p className="stat-number">{report.scoreChart.length}</p>
        </div>
        <div className="report-card fade-in">
          <h3>Correct %</h3>
          <p className="stat-number">{correctPercentage}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="report-chart fade-in small-chart">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            animation: { duration: 1200 },
            maintainAspectRatio: false
          }}
        />
      </div>

      {/* Best/Worst Questions */}
      <div className="qa-grid">
        <div className="flip-card fade-in">
          <div className="flip-card-inner">
            <div className="flip-card-front best">
              <h3><FaArrowUp /> Best Answer</h3>
              <p>{report.bestQuestion.question}</p>
              <p className="score-tag">Score: {report.bestQuestion.score.toFixed(2)}</p>
            </div>
            <div className="flip-card-back">
              <p><strong>Your Answer:</strong> {report.bestQuestion.userAnswer}</p>
              <p><strong>Expected:</strong> {report.bestQuestion.expectedAnswer}</p>
              <p className="extra-detail">
                You handled this question exceptionally well, showing strong understanding
                and clarity in explanation. Keep applying similar structuring to other answers.
              </p>
            </div>
          </div>
        </div>

        <div className="flip-card fade-in">
          <div className="flip-card-inner">
            <div className="flip-card-front worst">
              <h3><FaArrowDown /> Needs Improvement</h3>
              <p>{report.worstQuestion.question}</p>
              <p className="score-tag">Score: {report.worstQuestion.score.toFixed(2)}</p>
            </div>
            <div className="flip-card-back">
              <p><strong>Your Answer:</strong> {report.worstQuestion.userAnswer}</p>
              <p><strong>Expected:</strong> {report.worstQuestion.expectedAnswer}</p>
              <p className="extra-detail">
                This answer lacked key points and clarity. Focus on structuring your response:
                1) Restate the question, 2) Provide direct answer, 3) Add supporting examples.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="report-feedback fade-in">
        <FaCommentDots className="feedback-icon" />
        <p>{report.feedback}</p>
      </div>
    </div>
  );
};

export default Report;
