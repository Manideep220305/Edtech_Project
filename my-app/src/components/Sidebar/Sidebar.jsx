import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'agents', label: 'Agents', icon: '🤖' },
    { id: 'planner', label: 'Planner', icon: '📋' },
    { id: 'todo', label: 'To-Do', icon: '✅' },
    { id: 'timer', label: 'Timer', icon: '⏱️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;