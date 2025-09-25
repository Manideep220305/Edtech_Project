import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="nav-title">Dashboard</h1>
          <div className="nav-user">
            <span className="user-welcome">Welcome, {user?.username}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2 className="welcome-title">Welcome to Your Dashboard!</h2>
          <p className="welcome-text">
            You have successfully logged in. This is your secure dashboard page.
          </p>
          
          <div className="user-info">
            <h3 className="info-title">User Information</h3>
            <p className="info-text">
              <strong>Username:</strong> {user?.username}
            </p>
            <p className="info-text">
                <strong>Email:</strong> {user?.email}
            </p>
            <p className="info-text">
              <strong>User ID:</strong> {user?.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;