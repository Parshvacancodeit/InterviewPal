import React from 'react';
import { useNavigate } from 'react-router-dom';

const SkillSelection = () => {
  const navigate = useNavigate();

  const handleSkillSelect = (skill) => {
    localStorage.setItem('selectedSkill', skill); // Save selected skill
    navigate('/interview');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🎤 Welcome to InterviewPal</h1>
      <p>Please select a skill to begin your interview:</p>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => handleSkillSelect('React')} style={buttonStyle}>
          React
        </button>
        <button onClick={() => handleSkillSelect('Python')} style={buttonStyle}>
          Python
        </button>
        <button onClick={() => handleSkillSelect('Machine Learning')} style={buttonStyle}>
          Machine Learning
        </button>
      </div>
    </div>
  );
};

const buttonStyle = {
  margin: '10px',
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
};

export default SkillSelection;
