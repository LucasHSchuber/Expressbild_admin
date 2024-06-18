// src/components/PostModal.jsx
// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import '../assets/css/components.css';

const Editpostmodal = ({ show, handleClose, handleSubmit, item }) => {
  if (!show) return null;

  const submitForm = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const post = {
      title: formData.get('title'),
      content: formData.get('content'),
      language: formData.get('language'),
      categories: formData.getAll('categories'),
    };
    handleSubmit(post);
    handleClose();
  };

  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h5 className="mb-3">Edit post</h5>
        <form onSubmit={submitForm}>
          <div className="mb-2">
            <div>
              <label>Title</label>
            </div>
            <div>
              <input
                style={{ marginTop: '-0.5em'}}
                className="form-input"
                type="text"
                name="title"
                defaultValue={item.title}
                required
              />
            </div>
          </div>
          <div className="mb-2">
            <div>
              <label>Content</label>
            </div>
            <div>
              <textarea
                style={{ marginTop: '-0.5em' }}
                className="form-textarea"
                name="content"
                defaultValue={item.content}
                required
              ></textarea>
            </div>
          </div>
          <div>
            <label className="mr-2">Publish to:</label>
            <select className="form-select" name="language" required>
              <option value="All">All countries</option>
              <option value="DK">Denmark</option>
              <option value="DE">Germany</option>
              <option value="NO">Norway</option>
              <option value="FI">Finland</option>
              <option value="SE">Sweden</option>
            </select>
          </div>
          <div className="mt-3">
            <button
              className="mr-2 button cancel"
              type="button"
              onClick={handleClose}
            >
              Close
            </button>
            <button className="button standard" type="submit">
              Repost
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Editpostmodal;
