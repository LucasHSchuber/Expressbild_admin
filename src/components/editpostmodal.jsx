// src/components/PostModal.jsx
// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import '../assets/css/components.css';

const Editpostmodal = ({
  show,
  handleClose,
  handleSubmit,
  item,
  refreshData,
}) => {
  if (!show) return null;

  //handle change for ReactQuill text-editor
  const handleChangeContent = (html) => {
    setEditorHtml(html);
    setErrorBoarderContent(false);
    console.log(editorHtml);
  };

  //define states
  const [title, setTitle] = useState(item.news.title);
  const [content, setContent] = useState(item.news.content);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [errorBoarderLang, setErrorBoarderLang] = useState(false);
  const [errorBoarderContent, setErrorBoarderContent] = useState(false);
  const [editorHtml, setEditorHtml] = useState('');

  useEffect(() => {
    setTitle(item.news.title);
    setEditorHtml(item.news.content);
    const initialLanguages = Array.isArray(item.news.lang)
      ? item.news.lang
      : typeof item.news.lang === 'string'
        ? item.news.lang.split(',')
        : [];
    setSelectedLanguages(initialLanguages);
  }, [item]);

  const handleChangeTitle = (e) => setTitle(e.target.value);
  //   const handleChangeContent = (e) => setContent(e.target.value);
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setErrorBoarderLang(false);
    if (value === 'All') {
      setSelectedLanguages(
        checked ? ['All', 'DK', 'DE', 'NO', 'FI', 'SE'] : []
      );
    } else {
      setSelectedLanguages((prevSelected) => {
        const newSelected = checked
          ? [...prevSelected, value]
          : prevSelected.filter((lang) => lang !== value);

        if (newSelected.length === 5) {
          return ['All', ...newSelected];
        }

        return newSelected.filter((lang) => lang !== 'All');
      });
    }
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (selectedLanguages.length === 0) {
      console.log('Choose at least one country');
      setErrorBoarderLang(true);
      return;
    } else {
      let selectedCategories = selectedLanguages.filter(
        (category) => category !== 'All'
      );
      console.log(selectedCategories);
      const post = {
        news_id: item.news.id,
        title,
        content: editorHtml,
        lang: selectedCategories.join(','),
      };
      console.log(post);
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
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h5 className="mb-3">Edit post</h5>
        <form onSubmit={submitForm}>
          <div className="mb-2">
            <div>
              <label>Title:</label>
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
          <div>
            <div>
              <label>Content:</label>
            </div>
            <div>
              <ReactQuill
                className={`form-content-editor ${errorBoarderContent ? 'contenteditor-error-border' : ''}`}
                name="content"
                theme="snow"
                value={editorHtml}
                style={{ marginBottom: '4em' }}
                onChange={handleChangeContent}
                required
              />
            </div>
          </div>
          {/* <div className="mb-2">
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
          </div> */}
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
            <div className="checkbox-container">
              <div>
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="All"
                    checked={selectedLanguages.includes('All')}
                    onChange={handleCheckboxChange}
                  />
                  All
                </label>
              </div>
              <div>
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="DK"
                    checked={selectedLanguages.includes('DK')}
                    onChange={handleCheckboxChange}
                  />
                  Denmark
                </label>
              </div>
              <div>
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="DE"
                    checked={selectedLanguages.includes('DE')}
                    onChange={handleCheckboxChange}
                  />
                  Germany
                </label>
              </div>
              <div>
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="NO"
                    checked={selectedLanguages.includes('NO')}
                    onChange={handleCheckboxChange}
                  />
                  Norway
                </label>
              </div>
              <div>
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="FI"
                    checked={selectedLanguages.includes('FI')}
                    onChange={handleCheckboxChange}
                  />
                  Finland
                </label>
              </div>
              <div>
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="SE"
                    checked={selectedLanguages.includes('SE')}
                    onChange={handleCheckboxChange}
                  />
                  Sweden
                </label>
              </div>
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
