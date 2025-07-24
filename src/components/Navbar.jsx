import { useEffect, useState } from 'react';
import LoginModal from './LoginModal';
import ProfileDropdown from './ProfileDropdown';
import axios from '../api/axios';
import '../styles/Navbar.css'; // ✅ external CSS

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);


  useEffect(() => {
    axios.get('/session')
      .then((res) => {
        if (res.data.user) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleLogout = () => {
    axios.post('/logout')
      .then(() => setIsLoggedIn(false));
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-logo">InterviewPal</h1>

      {isLoggedIn ? (
  <div className="navbar-profile-wrapper">
    <button
      className="profile-toggle-btn"
      onClick={() => setShowDropdown(prev => !prev)}
    >
      Me ▼
    </button>
    {showDropdown && (
      <ProfileDropdown onLogout={() => {
        setIsLoggedIn(false);
        setShowDropdown(false);
      }} />
    )}
  </div>
) : (
  <button onClick={() => setShowModal(true)} className="navbar-login-btn">
    Login
  </button>
)}

      {showModal && (
        <LoginModal
          onClose={() => setShowModal(false)}
          onLogin={() => {
            setIsLoggedIn(true);
            setShowModal(false);
          }}
        />
      )}
    </nav>
  );
}

export default Navbar;
