// src/components/PostModal.jsx
// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import '../assets/css/components.css';

const Newpostmodal = ({ show, handleClose, refreshData, tags }) => {
  //define states
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [file, setFile] = useState([]);
  const [errorBoarderLang, setErrorBoarderLang] = useState(false);
  const [description, setDescription] = useState('');

  const [openNewTag, setOpenNewTag] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [newTag, setNewTag] = useState('');


  if (!show) return null;





  
  //submit new post form
  const submitForm = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const selectedCategories = formData
      .getAll('categories')
      .filter((category) => category !== 'All');
    const lang = selectedCategories.join(',');
    if (formData.get('description') === "") {
      console.log('Missing description');
      return;
    }
    if (formData.get('description') === "") {
      console.log('Missing description');
      return;
    }
    if (lang === '') {
      console.log('Choose at least one country');
      setErrorBoarderLang(true);
      return;
    } 
    if (formData.get('tag') === "" && newTag === "") {
        console.log('Missing tag');
        return;
    }
    else {
      const post = {
        title: formData.get('title'),
        description: formData.get('description'),
        tags: formData.get('tag'),
        langs: lang,
      };
      handleSubmitPost(post);
      
      handleClose();
    }
  };

  //submitting post
  const handleSubmitPost = async (post) => {
    console.log('Post submitted:', post);
    const token = '666ab2a5be8ee1.66302861';
    try {
        // Create FormData to include both post data and file
        const formData = new FormData();
        formData.append('title', post.title);
        formData.append('description', post.description);
        if (post.tags && post.tags.trim() !== "") {
            formData.append('tags', post.tags);
        } else if (newTag && newTag.trim() !== "") {
            formData.append('tags', newTag);
        }
        formData.append('langs', post.langs);

        // Append files to the FormData
        // const fileInput = document.querySelector('input[type="file"]');
        // if (fileInput && fileInput.files.length > 0) {
        //     for (let i = 0; i < fileInput.files.length; i++) {
        //         formData.append('files', fileInput.files[i]);
        //     }
        // }
        // console.log('fileInput.files:', fileInput.files);
        if (file.length > 0) {
          for (let i = 0; i < file.length; i++) {
              formData.append('files', file[i]);
          }
      }
      console.log('Files:', file);
        // Log FormData content
        for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
        }
        const response = await fetch('http://localhost:3003/api/articles', {
            method: 'POST',
            headers: {
                Authorization: `Admin ${token}`,
            },
            body: formData, 
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log('Article added:', result);
        refreshData();
        
    } catch (error) {
        console.error('Error adding article:', error);
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

  const handleFileChange = (file) => {
    // const file = event.target.files[0]; 
    console.log('file', file);
    if (file) {
      const maxSize = 0.75 * 1024 * 1024; 
      if (file.size > maxSize) {
        console.log("Too large file");
        toast.error('File size cannot exceed 750 kB in file size');
        event.target.value = ''; 
      } else {
        console.log('File selected:', file);
        setFile((prevArray) => [...prevArray, file]);
      }
    } else {
      console.log('No file selected.');
    }
  };
  

    const handleSelectChange = (event) => {
        setSelectedTag(event.target.value);
    };

    const handleNewTagChange = (event) => {
        console.log('event.target.value', event.target.value);
        setNewTag(event.target.value);
    };


  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className='d-flex justify-content-between'>
          <h5 className="mb-3">Knowledge Base: Create new article</h5>
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
          <div>
            <div>
              <label>Description:</label>
            </div>
            <div>
              <textarea
                className={`form-textarea`}
                name="description"
                // theme="snow"
                // value={description}
                // onChange={() => handleChange()}
                required
              />
            </div>
          </div>
          <div className='my-4 d-flex justify-content-between'>
            <div>
                <label htmlFor="tag-select">Tag:</label>
                <select
                    className='mx-2 form-select'
                    id="tag-select"
                    name='tag'
                    value={selectedTag}
                    onChange={handleSelectChange}
                    required={newTag.trim() === ""}
                >
                    <option value="">Select a tag</option>
                    {tags.map((tag, index) => (
                        <option key={index} value={tag}>
                            {tag}
                        </option>
                    ))}
                </select>
                <button className='standard' title='Create New Tag'  type="button"  onClick={() => setOpenNewTag(!openNewTag)}> {!openNewTag ? <FontAwesomeIcon icon={faPlus} /> : <FontAwesomeIcon icon={faMinus} /> } </button>
            </div>
                {openNewTag && (
                <div className='mr-5'>
                    <label htmlFor="new-tag">New tag:</label>
                    <input
                        style={{ width: "10em" }}
                        className='mx-2'
                        id="new-tag"
                        type="text"
                        value={newTag}
                        onChange={handleNewTagChange} 
                    />
                    {/* <button onClick={handleAddTag}>Add Tag</button> */}
                </div>
                )}
        </div>
          <div className='mb-4 mt-5 d-flex'>
            <input 
              className='hidden-file-input'
                type='file'
                id='file-input'
                onChange={(e) => handleFileChange(e.target.files[0])}
            >
            </input>
            <label>Files:</label>
            <label htmlFor="file-input" 
              className={`ml-2 custom-file-button`}
              >
                  Choose File
            </label>
            {file.length > 0 && (
            <div className='ml-5' style={{ width: "20em" }}>              
              <h6><b>Files:</b></h6>
              {file.length > 0 && file.map((file, index) => (
                <div key={index} className='d-flex'>
                  <h6>{index + 1}. {" "} {file.name}</h6>
                  <FontAwesomeIcon title='Delete File' style={{ margin: "0.2em 0 0 1em ", fontSize: "0.9em" }} icon={faTrash} onClick={() => setFile(prevFiles => prevFiles.filter(f => f.name !== file.name))} />
                </div>
               ))}
            </div>
            )}
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
              Create
            </button>
          </div>
        </form>
      </div>

      <ToastContainer 
				position="bottom-left"
				autoClose={6000}
				hideProgressBar={false}
				// transition={Slide}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="colored"
				style={{ fontSize: '15px', height: "3em", width: "22em", margin: "0 0 3em 0" }}
		/>

    </div>
  );
};

export default Newpostmodal;
