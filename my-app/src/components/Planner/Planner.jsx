// src/components/Planner/Planner.jsx

import React, { useState } from 'react';
import './Planner.css';

const Planner = () => {
  const [view, setView] = useState('main');
  const [selectedGroup, setSelectedGroup] = useState(null);

  const groups = [
    { id: 1, name: 'Project Alpha' },
    { id: 2, name: 'Team Beta' },
    { id: 3, name: 'Dev Squad' },
  ];

  const handlePersonalClick = () => setView('personal');
  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setView('group');
  };
  const handleBackClick = () => setView('main');

  if (view === 'personal') {
    return (
      <div className="blank-page-container">
        <h2>Personal Progress</h2>
        <button onClick={handleBackClick} className="back-btn">← Go Back</button>
      </div>
    );
  }

  if (view === 'group') {
    return (
      <div className="blank-page-container">
        <h2>{selectedGroup.name}</h2>
        <button onClick={handleBackClick} className="back-btn">← Go Back</button>
      </div>
    );
  }

  return (
    <div className="planner-container">
      <div className="leaderboard-header">
        <h2>LEADERBOARDS</h2>
      </div>

      <div className="planner-content">
        <div className="personal-section">
          <h3>Personal</h3>
          <div className="card personal-card" onClick={handlePersonalClick}>
            <div className="icon">👤</div>
            <p>Personal Progress</p>
          </div>
        </div>
        
        <div className="group-section">
          <div className="group-header">
            <h3>Group</h3>
            <h3>All Groups</h3>
          </div>
          <div className="group-cards">
            {groups.map(group => (
              <div key={group.id} className="card group-card" onClick={() => handleGroupClick(group)}>
                <div className="icon small-icon">👥</div>
                <p>{group.name}</p>
              </div>
            ))}
          </div>
          <button className="add-group-btn">
            + Add New Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default Planner;