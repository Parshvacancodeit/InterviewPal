import { useEffect, useRef, useState } from 'react';
import AuthModal from './AuthModal';
import ProfileDropdown from './ProfileDropdown';
import axios from '../api/axios';
import '../styles/Navbar.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  useEffect(() => {
    axios.get('/session')
      .then((res) => {
        if (res.data.user) setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <img src={logo} alt="Lexara Logo" className="navbar-logo-img" />
        </div>

        <div className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(prev => !prev)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`navbar-right ${menuOpen ? 'show' : ''}`}>
          {isLoggedIn ? (
            <div className="navbar-profile-wrapper" ref={dropdownRef}>
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

      {showModal && (
        <AuthModal
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
