// src/components/LoginModal.jsx
import { useState } from 'react';
import axios from '../api/axios';

function LoginModal({ onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        await axios.post('/register', {
          username: email,
          password,
          fullName,
        });
        alert('Registered! Now login.');
        setIsRegister(false);
      } else {
        await axios.post('/login', {
          username: email,
          password,
        });
        onLogin(); // inform Navbar that user is logged in
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              style={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <button type="submit" style={styles.btn}>
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsRegister(!isRegister)} style={styles.toggle}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
        <button onClick={onClose} style={styles.close}>X</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  modal: {
    background: 'white', padding: '2rem', borderRadius: '8px', position: 'relative', width: '300px'
  },
  input: {
    display: 'block', width: '100%', padding: '0.5rem', margin: '0.5rem 0'
  },
  btn: {
    width: '100%', padding: '0.6rem', background: '#007bff', color: 'white', border: 'none'
  },
  toggle: {
    color: '#007bff', cursor: 'pointer'
  },
  close: {
    position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontWeight: 'bold'
  }
};

export default LoginModal;
