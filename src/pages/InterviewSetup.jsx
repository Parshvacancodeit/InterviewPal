import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/InterviewSetup.css";
import { FaUser, FaCode, FaTachometerAlt } from "react-icons/fa";
import api from "../api/axios";

function InterviewSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    skill: "",
    difficulty: "",
  });

  const steps = [
    {
      label: "Your Name",
      description: "Give your interview a title. This helps you identify it later and track your progress.",
      icon: <FaUser />,
    },
    {
      label: "Select Skill",
      description: "Which skill would you like to be interviewed for?",
      icon: <FaCode />,
    },
    {
      label: "Select Difficulty",
      description: "Choose your preferred difficulty level for questions.",
      icon: <FaTachometerAlt />,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <input
            type="text"
            placeholder="Enter interview title"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        );
      case 1:
        return (
          <select
            value={formData.skill}
            onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
          >
            <option value="">Choose Skill</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="data-science">Data Science</option>
          </select>
        );
      case 2:
        return (
          <div className="difficulty-options">
            {["Easy", "Medium", "Hard"].map((level) => (
              <button
                key={level}
                className={formData.difficulty === level ? "active" : ""}
                onClick={() => setFormData({ ...formData, difficulty: level })}
              >
                {level}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      try {
        const response = await api.post("/start", {
          tech: formData.skill,
          difficulty: formData.difficulty,
        });

        const { question, interviewId } = response.data;

        if (!interviewId || !question) {
          alert("Invalid response from server. Interview not started.");
          return;
        }

        navigate("/interview", {
          state: {
            ...formData,
            question,
            interviewId, // ✅ Now correctly set
          },
        });
      } catch (error) {
        console.error("Failed to fetch question:", error);
        alert("Could not start interview. Try again.");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="blurred-overlay">
      <div className="interview-modal">
        <h2 className="form-title">Interview Setup</h2>
        <p>Let’s get to know you better so we can tailor the interview experience to match your goals.</p>

        <div className="step-indicator">
          {steps.map((_, index) => (
            <div key={index} className={`step-circle ${index <= currentStep ? "active" : ""}`}>
              {index + 1}
            </div>
          ))}
        </div>

        <div className="step-description">
          {steps[currentStep].icon}
          <p>{steps[currentStep].description}</p>
        </div>

        <div className="form-step">{renderStepContent()}</div>

        <div className="step-buttons">
          {currentStep > 0 && <button onClick={handleBack}>Back</button>}
          <button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Start Interview" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewSetup;
