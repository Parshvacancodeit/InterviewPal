import '../styles/ProfileDropdown.css'; // ✅ new CSS

function ProfileDropdown({ onLogout }) {
  return (
    <div className="profile-dropdown">
      <p>My Interviews</p>
      <p>Results</p>
      <p>Account Settings</p>
      <hr />
      <button onClick={onLogout} className="logout-btn">Logout</button>
    </div>
  );
}

export default ProfileDropdown;
