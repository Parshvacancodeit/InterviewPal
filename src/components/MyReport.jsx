import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/MyReports.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MyReport = () => {
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("/api/report-fetch", { withCredentials: true });
        setReports(res.data);
        if (res.data.length > 0) setSelectedId(res.data[0]._id);
      } catch (err) {
        console.error("Error fetching reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const selectedReport = reports.find((r) => r._id === selectedId);

  if (loading) return <p className="loading">Loading reports...</p>;
  if (reports.length === 0) return <p className="loading">No reports found.</p>;

  const chartData = {
    labels: selectedReport.scoreChart?.map((_, i) => `Q${i + 1}`) || [],
    datasets: [
      {
        label: "Score per Question",
        data: selectedReport.scoreChart || [],
        backgroundColor: "var(--primary)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { color: "var(--text)" },
        grid: { color: "var(--accent)" },
      },
      x: {
        ticks: { color: "var(--text)" },
        grid: { color: "var(--accent)" },
      },
    },
  };

  const truncate = (text, max = 100) =>
    text && text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div className="my-interviews-wrapper">
      {/* Sidebar */}
      <aside className="sidebar" role="navigation" aria-label="Reports Sidebar">
        <h3 className="sidebar-title">My Reports</h3>
        {reports.map((report) => (
          <button
            key={report._id}
            className={`tab ${selectedId === report._id ? "active" : ""}`}
            onClick={() => setSelectedId(report._id)}
            title={report.interviewTitle || report.topic}
            aria-current={selectedId === report._id ? "true" : "false"}
          >
            {truncate(report.interviewTitle || report.topic, 30)}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="report-main" role="main">
        <header className="report-header">
          <h2>{selectedReport.interviewTitle || selectedReport.topic}</h2>
          <div className="header-meta">
            <span className="avg-score">
              Average Score: {selectedReport.averageScore?.toFixed(2) || "N/A"} / 10
            </span>
            <span>{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
          </div>
        </header>

        <section className="chart-section">
          <Bar data={chartData} options={chartOptions} />
        </section>

        <div className="qa-grid">
          {/* Best Question */}
          <section className="qa-card best">
            <h4>Best Question</h4>
            {selectedReport.bestQuestion ? (
              <>
                <p><strong>Q:</strong> {truncate(selectedReport.bestQuestion.question, 80)}</p>
                <p><strong>Score:</strong> {selectedReport.bestQuestion.score} / 10</p>
                <p><strong>Your Answer:</strong> {truncate(selectedReport.bestQuestion.userAnswer, 100)}</p>
                <p><strong>Expected:</strong> {truncate(selectedReport.bestQuestion.expectedAnswer, 100)}</p>
              </>
            ) : (
              <p>No data available</p>
            )}
          </section>

          {/* Worst Question */}
          <section className="qa-card worst">
            <h4>Worst Question</h4>
            {selectedReport.worstQuestion ? (
              <>
                <p><strong>Q:</strong> {truncate(selectedReport.worstQuestion.question, 80)}</p>
                <p><strong>Score:</strong> {selectedReport.worstQuestion.score} / 10</p>
                <p><strong>Your Answer:</strong> {truncate(selectedReport.worstQuestion.userAnswer, 100)}</p>
                <p><strong>Expected:</strong> {truncate(selectedReport.worstQuestion.expectedAnswer, 100)}</p>
              </>
            ) : (
              <p>No data available</p>
            )}
          </section>
        </div>

        {/* Overall Feedback */}
        <section className="feedback-card">
          <h4>Overall Feedback</h4>
          <p>{selectedReport.feedback || "No feedback provided."}</p>
        </section>
      </main>
    </div>
  );
};

export default MyReport;
