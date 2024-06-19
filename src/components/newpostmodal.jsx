// src/components/PostModal.jsx
// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import '../assets/css/components.css';

const Newpostmodal = ({ show, handleClose, refreshData }) => {
  if (!show) return null;

  const submitForm = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const selectedCategories = formData.getAll('categories');
    const lang = selectedCategories.join(',');
    const post = {
      title: formData.get('title'),
      content: formData.get('content'),
      //   language: formData.get('language'),
      lang: lang,
    };
    handleSubmitPost(post);
    handleClose();
  };

  const handleSubmitPost = async (post) => {
    console.log('Post submitted:', post);
    const token = '666ab2a5be8ee1.66302861';
    try {
      const response = await axios.post(
        '/api/index.php/rest/photographer_portal/news',
        post,
        {
          headers: {
            Authorization: `Admin ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Post news response:', response);
      refreshData();
    } catch (error) {
      console.error('Error posting news:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h5 className="mb-3">Create a new post</h5>
        <form onSubmit={submitForm}>
          <div className="mb-2">
            <div>
              <label>Title</label>
            </div>
            <div>
              <input
                style={{ marginTop: '-0.5em', width: '20em' }}
                className="form-input"
                type="text"
                name="title"
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
                style={{ marginTop: '-0.5em', width: '20em' }}
                className="form-textarea"
                name="content"
                required
              ></textarea>
            </div>
          </div>
          {/* <div>
            <label className="mr-2">Publish to:</label>
            <select className="form-select" name="language" required>
              <option value="All">All countries</option>
              <option value="DK">Denmark</option>
              <option value="DE">Germany</option>
              <option value="NO">Norway</option>
              <option value="FI">Finland</option>
              <option value="SE">Sweden</option>
            </select>
          </div> */}
          <div>
            <label>Publish to:</label>
            <div>
              <label>
                <input type="checkbox" name="categories" value="All" /> All
              </label>
              <br />
              <label>
                <input type="checkbox" name="categories" value="DK" /> Denmark
              </label>
              <br />
              <label>
                <input type="checkbox" name="categories" value="DE" /> Germany
              </label>
              <br />
              <label>
                <input type="checkbox" name="categories" value="NO" /> Norway
              </label>
              <br />
              <label>
                <input type="checkbox" name="categories" value="FI" /> Finland
              </label>
              <br />
              <label>
                <input type="checkbox" name="categories" value="SE" /> Sweden
              </label>
            </div>
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
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Newpostmodal;
