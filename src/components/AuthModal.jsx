import { useState } from 'react';
import axios from '../api/axios';
import '../styles/LoginModal.css';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Business from '../assets/Business analyst.json'
import Lottie from "lottie-react";

function AuthModal({ onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await axios.post('/register', { username: email, password, fullName });
        alert('Registration successful! Please login now.');
        setIsRegister(false);
        setFullName('');
        setPassword('');
        setEmail('');
      } else {
        await axios.post('/login', { username: email, password });
        onLogin();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="login-overlay">
  <div className="login-modal">
    <button onClick={onClose} className="login-close-btn">×</button>

    {/* Top animation area */}
    <div className="login-animation">
      {/* You can replace this div with <Lottie animationData={...} /> later */}
     <Lottie animationData={Business} loop autoplay />
    </div>

    {/* Form area */}
    <div className="login-form-container">
      <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
      <p>{isRegister ? 'Start your journey' : 'Login to continue'}</p>

      <form onSubmit={handleSubmit} className="login-form">
        {isRegister && (
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {!isRegister && <span className="login-forgot">Forgot Password?</span>}

        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>

      <p className="login-toggle-text">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}
        <span onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? ' Login' : ' Register'}
        </span>
      </p>
    </div>
  </div>
</div>

  );
}

export default AuthModal;
