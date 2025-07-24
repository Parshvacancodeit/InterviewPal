// src/pages/LandingPage.jsx
import '../styles/LandingPage.css';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';

// React Icons
import { FaChevronDown, FaBrain, FaChartBar, FaComments, FaBullseye } from 'react-icons/fa';

function LandingPage() {
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);
const navigate = useNavigate();
  return (
    <div className="landing-container">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Master Interviews with Confidence</h1>
          <p>AI-powered mock interviews tailored just for you.</p>
          <button
            className="cta-button"
            onClick={() => navigate('/interview')} // ✅ Navigate on click
          >
            Start Preparing
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <h2 className="section-title">Why Choose InterviewPal?</h2>
        <div className="features-grid">
          <div className="feature-card" data-aos="fade-up">
            <FaBrain className="feature-icon" />
            <h3>AI Feedback</h3>
            <p>Real-time analysis of your responses with intelligent feedback.</p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
            <FaChartBar className="feature-icon" />
            <h3>Track Progress</h3>
            <p>Visual dashboards help you improve consistently.</p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
            <FaComments className="feature-icon" />
            <h3>Mock Questions</h3>
            <p>Practice behavioral & technical questions with confidence.</p>
          </div>
        </div>
      </section>

      {/* SPLIT SECTION */}
      <section className="split-section">
        <div className="split-text" data-aos="fade-right">
          <h2>Built for Job Seekers</h2>
          <p>
            We understand the anxiety of interviews. InterviewPal provides structured practice, personalized insights, and AI-driven guidance to help you shine.
          </p>
        </div>
        <div className="split-image" data-aos="fade-left">
          <FaBullseye className="target-icon" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" data-aos="fade-up">
        <h2 className="section-title">How It Works</h2>
        <div className="timeline">
          <div className="step">
            <div className="circle">1</div>
            <p>Sign Up and select your goal</p>
          </div>
          <div className="line" />
          <div className="step">
            <div className="circle">2</div>
            <p>Take mock interviews with our AI</p>
          </div>
          <div className="line" />
          <div className="step">
            <div className="circle">3</div>
            <p>Get feedback and improve every day</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" data-aos="fade-up">
        <h2 className="section-title">FAQs</h2>
        <details>
          <summary>
            Is this free to use?
            <span className="faq-icon"><FaChevronDown /></span>
          </summary>
          <p>Yes! InterviewPal is free for individual learners.</p>
        </details>
        <details>
          <summary>
            Can I track my progress?
            <span className="faq-icon"><FaChevronDown /></span>
          </summary>
          <p>Absolutely. Our dashboard keeps you updated on your growth.</p>
        </details>
        <details>
          <summary>
            What kind of questions are asked?
            <span className="faq-icon"><FaChevronDown /></span>
          </summary>
          <p>Both behavioral and technical questions tailored to your profile.</p>
        </details>
      </section>

      {/* LOGIN CTA */}
      <section className="login-cta" data-aos="fade-up">
        <h2>Ready to Ace Your Interview?</h2>
        <button className="cta-button">Login / Sign Up</button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#">Home</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
        <p>&copy; 2025 InterviewPal</p>
      </footer>
    </div>
  );
}

export default LandingPage;
