// LandingPageV2.jsx
import '../styles/LandingPage.css';
import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from 'react-router-dom';
import Lottie from "lottie-react";
import heroAnimation from "../assets/Businessman flies up with rocket.json";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectCoverflow } from "swiper/modules"; // ✅ Correct
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { FaBrain, FaChartBar, FaComments, FaClipboardList, FaStar, FaHistory } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi"; // slanted arrow
import api from "../api/axios"


import {
  FaChevronDown,
  FaBullseye,
  FaUserGraduate,
  FaMicrophoneAlt,
  FaRobot,
  FaPlayCircle,
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
  const features = [
    { icon: <FaBrain />, title: "Personalized Interview Analyzer", desc: "AI-powered insights on your interview performance." },
    { icon: <FaChartBar />, title: "Track Progress", desc: "Monitor your growth with clean, visual reports." },
    { icon: <FaComments />, title: "Real Question Bank", desc: "Practice with curated behavioral & technical questions." },
    { icon: <FaClipboardList />, title: "Reference Answers", desc: "Compare responses with expert-crafted answers." },
    { icon: <FaStar />, title: "Skill Ratings", desc: "Get scored across 18+ critical interview skills." },
    { icon: <FaHistory />, title: "Past Reports", desc: "Revisit and analyze your previous interviews." }
  ];
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
  {/* Animation on left */}
  <div className="hero-animation">
    <Lottie animationData={heroAnimation} loop autoplay />
  </div>

  {/* Content on right */}
  <div className="hero-content">
    <h1>Land Your <span>Dream</span> Job. Practice Like a Pro.</h1>
    <p>AI-powered mock interviews built by top engineers to help you crack the toughest interviews.</p>
    <div className="hero-buttons">
      <button className="primary" onClick={() => navigate('/interview')}>Start Preparing</button>
      <button className="secondary" onClick={() => navigate('/learn-more')}>Learn More</button>
    </div>
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
<section className="features-carousel" data-aos="fade-up">
      <h2>Why Choose Lexara?</h2>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 2500 }}
        loop={true}
        spaceBetween={24}
        slidesPerView={1}
        grabCursor={true}   // 👈 enables hand cursor & drag/swipe
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
      >
        {features.map((f, index) => (
          <SwiperSlide key={index}>
            <div className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>



      {/* ACTION CARDS */}
       <section className="action-dashboard" data-aos="fade-up">
      <h2>Your Interview Journey</h2>
      <div className="nav-grid">
        <div className="nav-item" onClick={() => navigate("/interview")}>
          <FaPlayCircle className="nav-icon" />
          <div>
            <h4>Take Interview</h4>
            <p>Start a new mock interview based on your goals.</p>
          </div>
          <span className="arrow">→</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/my-interviews")}>
          <FaClipboardList className="nav-icon" />
          <div>
            <h4>My Interviews</h4>
            <p>Access your past sessions and track your journey.</p>
          </div>
          <span className="arrow">→</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/my-reports")}>
          <FaChartPie className="nav-icon" />
          <div>
            <h4>My Reports</h4>
            <p>Analyze AI feedback and improve every time.</p>
          </div>
          <span className="arrow">→</span>
        </div>
      </div>
    </section>

      {/* FEEDBACK DEMO */}
      {/* HOW IT WORKS */}
{/* HOW IT WORKS */}
<section className="how-it-works-bg">
  <div className="how-it-works" data-aos="fade-up">
    <h2 className="section-title">How It Works</h2>

    <div className="timeline">
      <div className="timeline-step left" data-aos="fade-right">
        <span className="timeline-number">1</span>
        <div className="timeline-content">
          <FaUserGraduate className="timeline-icon" />
          <h3>Create Your Account</h3>
          <p>Sign up, set your career goal, and let us tailor your interview plan.</p>
        </div>
      </div>

      <div className="timeline-step right" data-aos="fade-left">
        <span className="timeline-number">2</span>
        <div className="timeline-content">
          <FaMicrophoneAlt className="timeline-icon" />
          <h3>Take AI-Powered Interviews</h3>
          <p>Answer real questions with our AI interviewer — anytime, anywhere.</p>
        </div>
      </div>

      <div className="timeline-step left" data-aos="fade-right">
        <span className="timeline-number">3</span>
        <div className="timeline-content">
          <FaRegLightbulb className="timeline-icon" />
          <h3>Get Actionable Feedback</h3>
          <p>Receive detailed insights and tips to improve with every session.</p>
        </div>
      </div>
    </div>
  </div>
</section>





<section className="trending-carousel" data-aos="fade-up">
  <h2>🔥 Trending Interviews</h2>
  <Swiper
  modules={[Pagination, Autoplay, EffectCoverflow]}
  effect="coverflow"
  centeredSlides
  centeredSlidesBounds
  slidesPerView="auto"
  spaceBetween={18}
  coverflowEffect={{ rotate: 8, stretch: 0, depth: 120, modifier: 1.2, slideShadows: false }}
  pagination={{ clickable: true }}
  autoplay={{ delay: 3000, disableOnInteraction: false }}
  loop
  watchSlidesProgress
  slideToClickedSlide
  speed={550}
>

    {[
      { label: "React Interview", tech: "React", difficulty: "Medium", desc: "Test your frontend React.js skills with real-world questions." },
      { label: "Python Interview", tech: "Python", difficulty: "Easy", desc: "Sharpen your Python coding and logic-building skills." },
      { label: "DSA Interview", tech: "DSA", difficulty: "Hard", desc: "Ace Data Structures & Algorithms with complex challenges." },
      { label: "SQL Interview", tech: "MySQL", difficulty: "Medium", desc: "Prepare for common database and query-based interview questions." },
      { label: "Machine Learning Interview", tech: "MachineLearning", difficulty: "Hard", desc: "Get ready for ML fundamentals and scenario-based questions." },
    ].map((item) => (
      <SwiperSlide key={item.tech}>
        <div className="trending-card">
          <div className="trending-header">
            <h3>{item.label}</h3>
            <FaPlayCircle
              className="start-logo"
              onClick={async () => {
                try {
                  const randomNum = Math.floor(1000 + Math.random() * 9000);
                  const name = `${item.tech}-Interview-${randomNum}`;
                  const { data } = await api.post("/start", {
                    tech: item.tech,
                    difficulty: item.difficulty,
                    name,
                  });
                  const { question, interviewId } = data;
                  if (!interviewId || !question) {
                    alert("Interview could not be started.");
                    return;
                  }
                  navigate("/interview", {
                    state: {
                      name,
                      skill: item.tech,
                      difficulty: item.difficulty,
                      question,
                      interviewId,
                    },
                  });
                } catch (err) {
                  console.error("Failed to start trending interview:", err);
                  alert("Something went wrong. Try again.");
                }
              }}
            />
          </div>
          <p className="difficulty">Difficulty: {item.difficulty}</p>
          <p className="desc">{item.desc}</p>

          {/* Slanted Arrow (visible on hover) */}
          <FiArrowUpRight className="hover-arrow" />
        </div>
      </SwiperSlide>
    ))}
  </Swiper>
</section>




{/* FAQ */}
<section className="faq-section" data-aos="fade-up">
  <h2 className="section-title">Frequently Asked Questions</h2>

  <details>
    <summary>
      Is Lexara free to use?
      <span className="faq-icon"><FaChevronDown /></span>
    </summary>
    <p>Yes, Lexara is free for individual learners. We also provide advanced features under premium plans for teams and institutions.</p>
  </details>

  <details>
    <summary>
      Can I track my progress with Lexara?
      <span className="faq-icon"><FaChevronDown /></span>
    </summary>
    <p>Definitely. Your personalized dashboard shows clear insights about your performance, growth trends, and areas to improve.</p>
  </details>

  <details>
    <summary>
      What kind of questions does Lexara provide?
      <span className="faq-icon"><FaChevronDown /></span>
    </summary>
    <p>Lexara includes both behavioral and technical interview questions, designed to match your skills and career goals.</p>
  </details>

  <details>
    <summary>
      Do I need to install anything?
      <span className="faq-icon"><FaChevronDown /></span>
    </summary>
    <p>No installation is required — Lexara works seamlessly in your browser with a clean and responsive experience.</p>
  </details>
</section>




      {/* COMPARISON */}
<section className="comparison" data-aos="fade-up">
  <h2 className="section-title">How We Compare</h2>

  <table>
    <tbody>
      <tr>
        <td>Instant AI Feedback</td>
        <td><FaCheckCircle className="icon-check" /></td>
        <td><FaTimesCircle className="icon-times" /></td>
      </tr>
      <tr>
        <td>Progress Dashboard</td>
        <td><FaCheckCircle className="icon-check" /></td>
        <td><FaTimesCircle className="icon-times" /></td>
      </tr>
      <tr>
        <td>24/7 Access</td>
        <td><FaCheckCircle className="icon-check" /></td>
        <td><FaTimesCircle className="icon-times" /></td>
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