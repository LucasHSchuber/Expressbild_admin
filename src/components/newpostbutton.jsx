// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import '../assets/css/components.css';

const Newpostbutton = ({ onClick }) => {
  // const openNewPostModal = () => {
  //     console.log("open modal");
  // }

  return (
    <div className="newpost" onClick={onClick}>
      <button className="newpost-button"><FontAwesomeIcon icon={faPlus} /></button>
    </div>
  );
};

export default Newpostbutton;
