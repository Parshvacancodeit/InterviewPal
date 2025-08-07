import { useEffect, useState } from 'react';
import LoginModal from './LoginModal';
import ProfileDropdown from './ProfileDropdown';
import axios from '../api/axios';
import '../styles/Navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/session')
      .then((res) => {
        if (res.data.user) setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleLogout = () => {
    axios.post('/logout').then(() => setIsLoggedIn(false));
  };

  return (
    <>
  <nav className="navbar" role="navigation" aria-label="Main">
    <div className="navbar-logo" onClick={() => navigate('/')}>
      InterviewPal
    </div>

    <div className="navbar-right">
      {isLoggedIn ? (
        <div className="navbar-profile-wrapper">
          <button
            className="profile-toggle-btn"
            onClick={() => setShowDropdown(prev => !prev)}
            aria-label="Profile menu"
          >
            <img
              src="https://api.dicebear.com/6.x/initials/svg?seed=IP"
              alt="User Avatar"
              className="user-avatar"
            />
            <span>Me</span>
            <span className="dropdown-icon">▼</span>
          </button>
          {showDropdown && (
            <ProfileDropdown
              onLogout={() => {
                setIsLoggedIn(false);
                setShowDropdown(false);
              }}
            />
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="navbar-login-btn"
          aria-label="Login"
        >
          Login
        </button>
      )}
    </div>
  </nav>

  {/* ✅ Move the modal OUTSIDE the nav here */}
  {showModal && (
    <LoginModal
      onClose={() => setShowModal(false)}
      onLogin={() => {
        setIsLoggedIn(true);
        setShowModal(false);
      }}
    />
  )}
</>

  );
}

export default Navbar;
