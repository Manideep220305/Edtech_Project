// src/App.jsx

import React, { useState } from 'react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Planner from './components/Planner/Planner'; 
import TodoList from './components/TodoList/TodoList';
import Timer from './components/Timer/Timer';
import './App.css';

function App() {
  // The default active section is now 'planner'
  const [activeSection, setActiveSection] = useState('planner');
  const [todos, setTodos] = useState([
    { id: 1, text: 'Research APIs', completed: false },
    { id: 2, text: 'Design database schema', completed: false },
    { id: 3, text: 'Discuss frontend', completed: false }
  ]);

  const renderContent = () => {
    switch (activeSection) {
      case 'agents':
        return <div>Agents Content Coming Soon</div>;
      case 'planner':
        return <Planner />;
      case 'todo':
        return <TodoList todos={todos} setTodos={setTodos} />;
      case 'timer':
        return <Timer />;
      case 'settings':
        return <div>Settings Content Coming Soon</div>;
      default:
        // Changed default to planner as well for consistency
        return <Planner />;
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;