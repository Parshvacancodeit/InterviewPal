import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/InterviewSetup.css";
import { FaUser, FaCode, FaTachometerAlt, FaArrowLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import { FaReact, FaServer, FaDatabase, FaDocker, FaGitAlt, FaPython } from "react-icons/fa";
import api from "../api/axios";

function InterviewSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    skill: "",
    difficulty: "",
  });
  const [activeCategory, setActiveCategory] = useState("frontend");

  const steps = [
    { label: "Your Name", description: "Give your interview a title. This helps you identify it later.", icon: <FaUser /> },
    { label: "Select Skill", description: "Pick a category then click a subskill to select it.", icon: <FaCode /> },
    { label: "Select Difficulty", description: "Choose question difficulty.", icon: <FaTachometerAlt /> },
  ];

  const skillCategories = {
    frontend: [
      { label: "React", value: "React" },
      { label: "CSS", value: "Css" },
      { label: "HTML", value: "html" },
      { label: "JavaScript", value: "JavaScript" },
    ],
    backend: [
      { label: "Node.js", value: "Node.js" },
      { label: "Express.js", value: "Express.js" },
      { label: "Django", value: "Django" },
      { label: "Flask", value: "Flask" },
    ],
    database: [
      { label: "MySQL", value: "MySQL" },
      { label: "MongoDB", value: "MongoDB" },
    ],
    language: [
      { label: "Java", value: "Java" },
      { label: "Python", value: "Python" },
    ],
    "data-science": [
      { label: "Data Science", value: "DataScience" },
      { label: "Machine Learning", value: "MachineLearning" },
      { label: "DSA", value: "DSA" },
    ],
    devops: [
      { label: "Docker", value: "Docker" },
      { label: "Git", value: "Git" },
    ],
  };

  const categoryIcons = {
    frontend: <FaReact />,
    backend: <FaServer />,
    database: <FaDatabase />,
    language: <FaPython />,
    "data-science": <FaCode />,
    devops: <FaDocker />,
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-block">
            <label className="field-label">Interview title</label>
            <input
              type="text"
              placeholder="e.g. Frontend Practice — React"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-input"
            />
          </div>
        );
      case 1:
        return (
          <div className="step-block">
            <label className="field-label">Categories</label>
            <div className="category-row" role="tablist" aria-label="Skill categories">
              {Object.keys(skillCategories).map((cat) => (
                <button
                  key={cat}
                  className={`category-chip ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                >
                  <div className="cat-icon">{categoryIcons[cat]}</div>
                  <div className="cat-label">{cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                </button>
              ))}
            </div>

            <label className="field-label">Subskills</label>
            <div className="subskills-grid" role="list">
              {skillCategories[activeCategory].map((sub) => (
                <button
                  key={sub.value}
                  className={`subskill-pill ${formData.skill === sub.value ? "selected" : ""}`}
                  onClick={() => setFormData({ ...formData, skill: sub.value })}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            <div className="hint-row">
              <small>{formData.skill ? `Selected: ${formData.skill}` : "No skill selected yet."}</small>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-block">
            <label className="field-label">Difficulty</label>
            <div className="difficulty-row">
              {["Easy", "Medium", "Hard"].map((level) => (
                <button
                  key={level}
                  className={`difficulty-btn ${formData.difficulty === level ? "active" : ""}`}
                  onClick={() => setFormData({ ...formData, difficulty: level })}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="hint-row">
              <small>{formData.difficulty ? `Difficulty: ${formData.difficulty}` : "Pick a difficulty."}</small>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleNext = async () => {
    // basic validation UX
    if (currentStep === 0 && !formData.name.trim()) {
      alert("Please enter an interview title.");
      return;
    }
    if (currentStep === 1 && !formData.skill) {
      alert("Please select a skill.");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Start interview
      try {
        const response = await api.post("/start", {
          tech: formData.skill,
          difficulty: formData.difficulty,
          name: formData.name,
        });
        const { question, interviewId } = response.data;
        if (!interviewId || !question) {
          alert("Invalid response from server. Interview not started.");
          return;
        }
        navigate("/interview", { state: { ...formData, question, interviewId } });
      } catch (err) {
        console.error("Failed to fetch question:", err);
        alert("Could not start interview. Try again.");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const clearSelection = () => setFormData({ ...formData, skill: "" });

  return (
    <div className="blurred-overlay">
      <div className="interview-modal" role="dialog" aria-modal="true" aria-label="Interview setup">
        <header className="modal-header">
          <div className="title-row">
            <h2 className="form-title">Interview Setup</h2>
            <div className="step-small">{steps[currentStep].icon} <span className="step-text">{steps[currentStep].label}</span></div>
          </div>
          <p className="subtitle">Quick setup to tailor your practice session.</p>
        </header>

        <main className="modal-body">
          <div className="progress-row">
            {steps.map((s, idx) => (
              <div key={s.label} className={`progress-item ${idx <= currentStep ? "active" : ""}`}>
                <div className="progress-circle">{idx + 1}</div>
                <div className="progress-label">{s.label}</div>
              </div>
            ))}
          </div>

          <section className="step-description">
            <div className="desc-icon">{steps[currentStep].icon}</div>
            <p className="desc-text">{steps[currentStep].description}</p>
          </section>

          <section className="form-step">{renderStepContent()}</section>
        </main>

        <footer className="modal-footer">
          <div className="selection-summary">
            {formData.skill ? (
              <div className="selected-pill">
                <strong>{formData.skill}</strong>
                <button className="clear-btn" onClick={clearSelection} title="Clear skill"><FaTimes /></button>
              </div>
            ) : (
              <div className="selected-placeholder">No skill selected</div>
            )}
            <div className="meta-summary">
              <small>{formData.name || "No title yet"}</small>
              <small>{formData.difficulty || "No difficulty"}</small>
            </div>
          </div>

          <div className="footer-actions">
            <button className="ghost-btn" onClick={handleBack} disabled={currentStep === 0}>
              <FaArrowLeft /> Back
            </button>
            <button className="primary-btn" onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Start Interview" : "Next"} <FaArrowRight />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default InterviewSetup;
