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
import "../styles/MyInterviews.css";  // Use your provided CSS here

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

  // Bar Chart data
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
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Scores per Question",
        font: { size: 18, weight: "bold" },
        color: "var(--primary)",
      },
    },
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

  return (
    <div className="my-interviews-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3 className="sidebar-title">My Reports</h3>
        {reports.map((report) => (
          <div
            key={report._id}
            className={`tab ${selectedId === report._id ? "active" : ""}`}
            onClick={() => setSelectedId(report._id)}
            title={report.interviewTitle || report.topic}
          >
            {report.interviewTitle || report.topic}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="interview-content">
        <header className="interview-header">
          <h2>{selectedReport.interviewTitle || selectedReport.topic}</h2>
          <p>
            <strong>Average Score:</strong>{" "}
            {selectedReport.averageScore?.toFixed(2) || "N/A"}/10
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(selectedReport.createdAt).toLocaleString()}
          </p>
        </header>

        <section className="qa-card" style={{ maxWidth: 720, marginBottom: 30 }}>
          <Bar data={chartData} options={chartOptions} />
        </section>

        <section className="questions-section">
          {/* Best Question */}
          <div className="qa-card">
            <div className="qa-header">
              <h4>Best Question</h4>
              <div className="overall-score">
                {selectedReport.bestQuestion
                  ? `${selectedReport.bestQuestion.score}/10`
                  : "N/A"}
              </div>
            </div>
            {selectedReport.bestQuestion ? (
              <>
                <p>
                  <strong>Q:</strong> {selectedReport.bestQuestion.question}
                </p>
                <p>
                  <strong>Your Answer:</strong>{" "}
                  {selectedReport.bestQuestion.userAnswer}
                </p>
                <p>
                  <strong>Expected:</strong>{" "}
                  {selectedReport.bestQuestion.expectedAnswer}
                </p>
              </>
            ) : (
              <p>No data available</p>
            )}
          </div>

          {/* Worst Question */}
          <div className="qa-card">
            <div className="qa-header">
              <h4>Worst Question</h4>
              <div className="overall-score">
                {selectedReport.worstQuestion
                  ? `${selectedReport.worstQuestion.score}/10`
                  : "N/A"}
              </div>
            </div>
            {selectedReport.worstQuestion ? (
              <>
                <p>
                  <strong>Q:</strong> {selectedReport.worstQuestion.question}
                </p>
                <p>
                  <strong>Your Answer:</strong>{" "}
                  {selectedReport.worstQuestion.userAnswer}
                </p>
                <p>
                  <strong>Expected:</strong>{" "}
                  {selectedReport.worstQuestion.expectedAnswer}
                </p>
              </>
            ) : (
              <p>No data available</p>
            )}
          </div>
        </section>

        <section className="qa-card" style={{ maxWidth: 720, marginTop: 40 }}>
          <h4>Overall Feedback</h4>
          <p>{selectedReport.feedback || "No feedback provided."}</p>
        </section>
      </main>
    </div>
  );
};

export default MyReport;
