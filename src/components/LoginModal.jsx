import { useState } from 'react';
import axios from '../api/axios';
import '../styles/LoginModal.css';

function LoginModal({ onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await axios.post('/register', { username: email, password, fullName });
        alert('Registered! Now login.');
        setIsRegister(false);
      } else {
        await axios.post('/login', { username: email, password });
        onLogin();
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <button onClick={onClose} className="login-close-btn" aria-label="Close modal">×</button>
        <h2 className="login-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">{isRegister ? 'Start your journey with us' : 'Login to continue'}</p>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              className="login-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-submit-btn">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="login-toggle-text">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span className="login-toggle-link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? ' Login' : ' Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;
