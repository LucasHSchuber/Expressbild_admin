import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// import './index.css';
import { HashRouter as Router } from 'react-router-dom';
import Header from './components/header.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Header /> {/* Render the Header component */}
      <App />
    </Router>
  </React.StrictMode>
);
