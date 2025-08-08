import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SkillSelection from './pages/SkillSelection';
import InterviewPage from './pages/InterviewPage';
import ResultPage from './pages/ResultPage';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import InterviewSetup from './pages/InterviewSetup';
import MyInterviews from './components/MyInterviews';
import Report from './components/Report';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/skills" element={<SkillSelection />} />
        <Route path="/interview/setup" element={<InterviewSetup />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/my-interviews" element={<MyInterviews />} />
        <Route path="/report/:interviewId" element={<Report />} />
      </Routes>
    </>
  );
};

export default App;
