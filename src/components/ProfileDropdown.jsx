import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa"; // ✅ user icon
import axios from "../api/axios";
import "../styles/ProfileDropdown.css";

const ProfileDropdown = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/session", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user); // 👈 user contains fullName and username
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  return (
    <div className="profile-dropdown">
      {user && (
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <div className="user-details">
            <p className="user-name">{user.fullName}</p>
            <p className="user-email">{user.username}</p>
          </div>
        </div>
      )}

      <button onClick={() => navigate("/my-interviews")}>
        My Interviews
      </button>

      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
};

export default ProfileDropdown;
