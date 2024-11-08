// src/components/PostModal.jsx
// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import '../assets/css/components.css';

import useFetchToken from "../assets/js/fetchToken.js"


const Newpostmodal = ({ show, handleClose, refreshData }) => {
  if (!show) return null;

  //define states
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [errorBoarderLang, setErrorBoarderLang] = useState(false);
  const [errorBoarderContent, setErrorBoarderContent] = useState(false);
  const [editorHtml, setEditorHtml] = useState('');

  const { token, isValid } = useFetchToken();
  console.log('token', token);
  console.log('isValid', isValid);



  //handle change for ReactQuill text-editor
  const handleChange = (html) => {
    setEditorHtml(html);
    setErrorBoarderContent(false);
    console.log(editorHtml);
  };

  //submit new post form
  const submitForm = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const selectedCategories = formData
      .getAll('categories')
      .filter((category) => category !== 'All');
    const lang = selectedCategories.join(',');
    if (editorHtml === '' || editorHtml === '<p><br></p>') {
      console.log('Missing content');
      setErrorBoarderContent(true);
      return;
    }
    if (lang === '') {
      console.log('Choose at least one country');
      setErrorBoarderLang(true);
      return;
    } else {
      const post = {
        title: formData.get('title'),
        content: editorHtml,
        //   language: formData.get('language'),
        lang: lang,
      };
      handleSubmitPost(post);
      handleClose();
    }
  };

  //submitting post
  const handleSubmitPost = async (post) => {
    console.log('Post submitted:', post);
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
      setSelectedLanguages([]);
      setEditorHtml('');
    } catch (error) {
      console.error('Error posting news:', error);
    }
  };

  //handle checkbox change
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
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

  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className='d-flex justify-content-between'>
          <h5 className="mb-3">News: Create new article</h5>
          <h6 
            className='closemodal-button'
            onClick={handleClose}
          >
             <FontAwesomeIcon icon={faTimes} />
          </h6>
        </div>
        <form onSubmit={submitForm}>
          <div className="mb-2">
            <div>
              <label>Title:</label>
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
          {/* <div className="mb-2">
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
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label>Publish to:</label>
            <div className="checkbox-container">
              <label>
                <input
                  className={`checkbox-all ${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                  type="checkbox"
                  name="categories"
                  value="All"
                  checked={selectedLanguages.includes('All')}
                  onChange={handleCheckboxChange}
                />{' '}
                All
              </label>
              <br />
              <div className='d-flex justify-content-between'>
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="DK"
                    checked={selectedLanguages.includes('DK')}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Denmark
                </label>
                {/* <br /> */}
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="DE"
                    checked={selectedLanguages.includes('DE')}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Germany
                </label>
                {/* <br /> */}
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="NO"
                    checked={selectedLanguages.includes('NO')}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Norway
                </label>
                {/* <br /> */}
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="FI"
                    checked={selectedLanguages.includes('FI')}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Finland
                </label>
                {/* <br /> */}
                <label>
                  <input
                    className={`${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="SE"
                    checked={selectedLanguages.includes('SE')}
                    onChange={handleCheckboxChange}
                  />{' '}
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
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Newpostmodal;
