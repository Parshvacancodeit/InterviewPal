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

  const chartData = {
    labels: report.scoreChart.map((_, i) => `Q${i + 1}`),
    datasets: [
      {
        label: "Score",
        data: report.scoreChart,
        backgroundColor: "#4f46e5",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="report-wrapper">
      <div className="report-header">
        <h1>Interview Report</h1>
        <div className="report-subheader">
          <span><FaCalendarAlt /> {new Date(report.createdAt).toLocaleString()}</span>
          <span><FaStar /> Topic: {report.topic}</span>
        </div>
      </div>

      <div className="report-score">
        <h2>Average Score</h2>
        <div className="score-value">{report.averageScore.toFixed(2)} / 10</div>
      </div>

      <div className="report-chart">
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div className="qa-block">
        <h3><FaArrowUp /> Best Answered Question</h3>
        <div className="qa-card">
          <p><strong>Q:</strong> {report.bestQuestion.question}</p>
          <p><strong>Your Answer:</strong> {report.bestQuestion.userAnswer}</p>
          <p><strong>Expected:</strong> {report.bestQuestion.expectedAnswer}</p>
          <p><strong>Score:</strong> {report.bestQuestion.score.toFixed(2)}</p>
        </div>
      </div>

      <div className="qa-block">
        <h3><FaArrowDown /> Worst Answered Question</h3>
        <div className="qa-card">
          <p><strong>Q:</strong> {report.worstQuestion.question}</p>
          <p><strong>Your Answer:</strong> {report.worstQuestion.userAnswer}</p>
          <p><strong>Expected:</strong> {report.worstQuestion.expectedAnswer}</p>
          <p><strong>Score:</strong> {report.worstQuestion.score.toFixed(2)}</p>
        </div>
      </div>

      <div className="report-feedback">
        <h3><FaCommentDots /> Feedback</h3>
        <p>{report.feedback}</p>
      </div>
    </div>
  );
};

export default Report;
