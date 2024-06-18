// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

import '../assets/css/header.css';

const Header = () => {
  return (
    <header className="header">
      <nav className="nav-nav">
        <ul className="d-flex nav-list">
          <li>
            <Link to="/" className="navlink">
              Home
            </Link>
          </li>
          <li>
            <Link to="/publishednews" className="navlink">
              Published News
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
