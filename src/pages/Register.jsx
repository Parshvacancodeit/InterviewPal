// src/pages/Register.jsx
import React, { useState } from "react";
import axios from "axios";

function Register({ onAuthSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/register", {
        username,
        password,
      }, { withCredentials: true });

      alert(res.data.message);
      if (res.status === 201) onAuthSuccess();  // e.g., redirect to dashboard
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} required />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
