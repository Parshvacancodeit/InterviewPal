import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaClipboardList, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import axios from "../api/axios";
import "../styles/ProfileDropdown.css";

const ProfileDropdown = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/session", { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
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
        <FaClipboardList /> My Interviews
      </button>

      <button onClick={() => navigate("/my-reports")}>
        <FaFileAlt /> My Reports
      </button>

      <button
  className="logout-btn"
  onClick={async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
      if (onLogout) onLogout(); // update parent state
    } catch (err) {
      console.error("Logout failed", err);
    }
  }}
>
  <FaSignOutAlt /> Logout
</button>

    </div>
  );
};

export default ProfileDropdown;
