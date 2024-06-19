// src/components/PostModal.jsx
// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import '../assets/css/components.css';

const Editpostmodal = ({
  show,
  handleClose,
  handleSubmit,
  item,
  refreshData,
}) => {
  if (!show) return null;

  const [title, setTitle] = useState(item.news.title);
  const [content, setContent] = useState(item.news.content);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  useEffect(() => {
    setTitle(item.news.title);
    setContent(item.news.content);
    const initialLanguages = Array.isArray(item.news.lang)
      ? item.news.lang
      : typeof item.news.lang === 'string'
        ? item.news.lang.split(',')
        : [];
    setSelectedLanguages(initialLanguages);
  }, [item]);

  const handleChangeTitle = (e) => setTitle(e.target.value);
  const handleChangeContent = (e) => setContent(e.target.value);
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    setSelectedLanguages((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((lang) => lang !== value)
        : [...prevSelected, value]
    );
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const post = {
      news_id: item.news.id,
      title,
      content,
      lang: selectedLanguages.join(','),
    };
    // handleSubmit(post);

    try {
      const token = '666ab2a5be8ee1.66302861';
      const id = item.news.id;
      const response = await axios.put(
        `/api/index.php/rest/photographer_portal/news/${id}`,
        post,
        {
          headers: {
            Authorization: `Admin ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Update news response:', response);
      refreshData();
      handleClose();
    } catch (error) {
      console.error('Error updating news:', error);
    }
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
                style={{ marginTop: '-0.5em' }}
                className="form-input"
                type="text"
                name="title"
                value={title}
                onChange={handleChangeTitle}
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
                value={content}
                onChange={handleChangeContent}
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
              <input
                type="checkbox"
                name="categories"
                value="All"
                checked={selectedLanguages.includes('All')}
                onChange={handleCheckboxChange}
              />{' '}
              All
              <input
                type="checkbox"
                name="categories"
                value="DK"
                checked={selectedLanguages.includes('DK')}
                onChange={handleCheckboxChange}
              />{' '}
              Denmark
              <input
                type="checkbox"
                name="categories"
                value="DE"
                checked={selectedLanguages.includes('DE')}
                onChange={handleCheckboxChange}
              />{' '}
              Germany
              <input
                type="checkbox"
                name="categories"
                value="NO"
                checked={selectedLanguages.includes('NO')}
                onChange={handleCheckboxChange}
              />{' '}
              Norway
              <input
                type="checkbox"
                name="categories"
                value="FI"
                checked={selectedLanguages.includes('FI')}
                onChange={handleCheckboxChange}
              />{' '}
              Finland
              <input
                type="checkbox"
                name="categories"
                value="SE"
                checked={selectedLanguages.includes('SE')}
                onChange={handleCheckboxChange}
              />{' '}
              Sweden
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
              Repost
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Editpostmodal;
