import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SkillSelection from './pages/SkillSelection';
import InterviewPage from './pages/InterviewPage';
import ResultPage from './pages/ResultPage';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import InterviewSetup from './pages/InterviewSetup';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/skills" element={

            <SkillSelection />

        } />
        <Route path="/interview/setup" element={<InterviewSetup />} />

        <Route path="/interview" element={

            <InterviewPage />
          
        } />
        <Route path="/result" element={

            <ResultPage />

        } />
      </Routes>
    </>
  );
};

export default App;
