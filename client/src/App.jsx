// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/App.css';

// Feature Components
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Planner from './components/Planner/Planner';
import TodoList from './components/TodoList/TodoList';
import Timer from './components/Timer/Timer';
import GroupChatArea from './components/ChatArea/GroupChatArea';

// -------- Main Layout (the actual app after login) --------
function MainLayout() {
  return (
    <div className="main-app">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content-area">
          <Routes>
            <Route path="planner" element={<Planner />} />
            <Route path="todo" element={<TodoList />} />
            <Route path="timer" element={<Timer />} />
            <Route path="agents" element={<GroupChatArea />} />
            <Route path="settings" element={<div>Settings Coming Soon</div>} />
            {/* Default inside app */}
            <Route index element={<Navigate to="planner" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// -------- Protected Route --------
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem("authToken"); // <-- check storage too

  if (isAuthenticated || token) {
    return children;
  }

  return <Navigate to="/login" replace />;
}


// -------- Root App --------
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Private (main app) */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
