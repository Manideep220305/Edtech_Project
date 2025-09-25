import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title"># Hackathon</h1>
        <nav className="header-nav">
          <span className="nav-item">Home</span>
        </nav>
      </div>
    </header>
  );
};

export default Header;