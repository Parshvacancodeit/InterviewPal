// LandingPageV2.jsx
import '../styles/LandingPage.css';
import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';
import Lottie from "lottie-react";
import heroAnimation from "../assets/Rocket Launch.json";

import {
  FaChevronDown,
  FaBrain,
  FaChartBar,
  FaComments,
  FaBullseye,
  FaUserGraduate,
  FaMicrophoneAlt,
  FaRobot,
  FaPlayCircle,
  FaClipboardList,
  FaChartPie,
  FaCogs,
  FaCheckCircle,
  FaRegLightbulb,
  FaTimesCircle

} from 'react-icons/fa';

function useCountUp(end) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    let observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let current = 0;
          const step = end / 40;
          const interval = setInterval(() => {
            current += step;
            if (current >= end) {
              clearInterval(interval);
              setCount(end);
            } else {
              setCount(Math.floor(current));
            }
          }, 30);
          observer.disconnect();
        }
      },
      { threshold: 1 }
    );
    if (ref.current) observer.observe(ref.current);
  }, [end]);
  return [count, ref];
}

function LandingPage() {
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const navigate = useNavigate();
  const [users, usersRef] = useCountUp(5000);
  const [interviews, interviewsRef] = useCountUp(10000);
  const [accuracy, accuracyRef] = useCountUp(98);

  return (
    <div className="landing-v2">
      {/* HERO */}
      <section className="hero">
  <div className="hero-animation">
    <Lottie animationData={heroAnimation} loop autoplay />
  </div>
  <div className="hero-content">
    <h1>Land Your Dream Job. Practice Like a Pro.</h1>
    <p>AI-powered mock interviews built by top engineers to help you crack the toughest interviews.</p>
    <button onClick={() => navigate('/interview')}>Start Preparing</button>
  </div>
</section>

      {/* CREDIBILITY */}
      <section className="credibility" data-aos="fade-up">
        <div className="credibility-text">Trusted by 5000+ learners · Custom Evaluation Engine</div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stat" ref={usersRef}>
          <FaUserGraduate />
          <h3>{users.toLocaleString()}+</h3>
          <p>Learners</p>
        </div>
        <div className="stat" ref={interviewsRef}>
          <FaMicrophoneAlt />
          <h3>{interviews.toLocaleString()}+</h3>
          <p>Mock Interviews</p>
        </div>
        <div className="stat" ref={accuracyRef}>
          <FaRobot />
          <h3>{accuracy}%</h3>
          <p>Feedback Accuracy</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Why Choose InterviewPal?</h2>
        <div className="features-grid">
          <div className="feature-card" data-aos="fade-up">
            <FaBrain />
            <h3>Smart Feedback</h3>
            <p>Receive detailed, AI-generated analysis on your communication and content.</p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
            <FaChartBar />
            <h3>Track Growth</h3>
            <p>Use our visual dashboard to monitor your improvement daily.</p>
          </div>
          <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
            <FaComments />
            <h3>Real Questions</h3>
            <p>Practice with handpicked behavioral and technical interview questions.</p>
          </div>
        </div>
      </section>

      {/* ACTION CARDS */}
      <section className="action-cards" data-aos="fade-up">
        <h2>Your Interview Journey</h2>
        <div className="card-group">
          <div className="card">
            <FaPlayCircle />
            <h4>Take Interview</h4>
            <p>Start a new mock interview based on your goals.</p>
          </div>
          <div className="card">
            <FaClipboardList />
            <h4>My Interviews</h4>
            <p>Access your past sessions and track your journey.</p>
          </div>
          <div className="card">
            <FaChartPie />
            <h4>My Results</h4>
            <p>Analyze AI feedback and improve every time.</p>
          </div>
        </div>
      </section>

      {/* FEEDBACK DEMO */}
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


      {/* TESTIMONIALS */}
      <section className="testimonials" data-aos="fade-up">
        <h2>What Learners Say</h2>
        <div className="testimonial-group">
          <div className="testimonial">
            <p>“InterviewPal gave me confidence I never had. The AI feedback is shockingly accurate.”</p>
            <h5>– Riya S., Placed at Deloitte</h5>
          </div>
          <div className="testimonial">
            <p>“It felt like a real interview. I improved with every session.”</p>
            <h5>– Arjun M., Amazon Intern</h5>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="comparison" data-aos="fade-up">
        <h2>How We Compare</h2>
        <table>
  <tbody>
    <tr>
      <td>Instant AI Feedback</td>
      <td><FaCheckCircle color="green" /></td>
      <td><FaTimesCircle color="red" /></td>
    </tr>
    <tr>
      <td>Progress Dashboard</td>
      <td><FaCheckCircle color="green" /></td>
      <td><FaTimesCircle color="red" /></td>
    </tr>
    <tr>
      <td>24/7 Access</td>
      <td><FaCheckCircle color="green" /></td>
      <td><FaTimesCircle color="red" /></td>
    </tr>
  </tbody>
</table>

      </section>

      {/* NEWSLETTER */}
      <section className="newsletter" data-aos="fade-up">
        <h2>Stay Ahead. Get Interview Tips Weekly.</h2>
        <div className="newsletter-box">
          <input type="email" placeholder="Your email address" />
          <button>Subscribe</button>
        </div>
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