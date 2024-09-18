// src/components/PostModal.jsx
// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../assets/css/components.css';

const Editpostknowledgebasemodal = ({ show, handleClose, handleSubmit, item, refreshData, tagsArray}) => {
  if (!show) return null;


  //define states
  const [title, setTitle] = useState(item.title);
  const [tags, setTags] = useState(item.description);
  const [description, setDescription] = useState(item.description);
  const [file, setFile] = useState([]);
  const fileInputRef = useRef(null);

  const [deleteFileArray, setDeleteFileArray] = useState([]);
  const [uploadedFile, setUploadedFile] = useState([]);

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [errorBoarderLang, setErrorBoarderLang] = useState(false);
  const [errorBoarderContent, setErrorBoarderContent] = useState(false);
//   const [editorHtml, setEditorHtml] = useState('');

  const [openNewTag, setOpenNewTag] = useState(false);
//   const [selectedTag, setSelectedTag] = useState('');
  const [newTag, setNewTag] = useState('');


  useEffect(() => {
    console.log('file', file);
  }, [file]);

  useEffect(() => {
    console.log("item:",item)
    setTitle(item.title);
    setTags(item.tags[0]);
    setFile(item?.files);
    setDescription(item.description);
    const initialLanguages = Array.isArray(item.langs)
      ? item.langs
      : typeof item.langs === 'string'
        ? item.langs.split(',')
        : [];
    setSelectedLanguages(initialLanguages);
  }, [item]);


  const submitForm = async (event) => {
    event.preventDefault();

    // const data = {
    //     title: title,
    //     description: description,
    //     tags: newTag !== "" ? newTag : tags,
    //     langs: selectedLanguages,
    //     deletedFiles: deleteFileArray,
    //     uploadedFiles: uploadedFile
    // }
    // console.log('data', data);
    // console.log('id', item.id);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', newTag !== "" ? newTag : tags);
    formData.append('langs', JSON.stringify(selectedLanguages));
    formData.append('deletedFiles', JSON.stringify(deleteFileArray)); 

    console.log("Deleted Files:", deleteFileArray);

    // Append each file to FormData
    uploadedFile.forEach(file => {
      formData.append('uploadedFiles', file); 
    });
    console.log('formData', formData);

    if (selectedLanguages.length === 0) {
      console.log('Choose at least one country');
      setErrorBoarderLang(true);
      return;
    } else {
      // Updating news article 
      console.log("Sending data to db")
      try {
        const token = '666ab2a5be8ee1.66302861';
        const response = await fetch(`http://localhost:3003/api/articles/${item.id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Admin ${token}`,
                // 'Content-Type': 'application/json',
            },
            body: formData,  
        });
        console.log('Update response:', response);

        if (response.status === 200){
          refreshData();
          handleClose();
        }
      } catch (error) {
        console.error('Error updating news:', error);
      }
    }
  };

  

const handleChangeDescription = (value) => {
    console.log('description:', value);
    setDescription(value);
};


const handleChangeTitle = (title) => {
console.log('title:', title);
setTitle(title);
}


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
      : prevSelected.filter((langs) => langs !== value);

    if (newSelected.length === 5) {
      return ['All', ...newSelected];
    }

    return newSelected.filter((langs) => langs !== 'All');
  });
}
};


  const handleSelectChange = (event) => {
    console.log('event.target.value', event.target.value);
    setTags(event.target.value);
};

const handleNewTagChange = (event) => {
    console.log('event.target.value', event.target.value);
    setNewTag(event.target.value);
};

const deleteFile = (fileName) => {
  console.log('adding file to delete filename array', fileName);
  setDeleteFileArray((prevArray) => [...prevArray, fileName]);
  // setFile(prevFiles => prevFiles.filter(file => file.name !== fileName));
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
      setUploadedFile((prevArray) => [...prevArray, file]);
    }
  } else {
    console.log('No file selected.');
  }
};


useEffect(() => {
  console.log('deleteFileArray', deleteFileArray);
  console.log('uploadedFile', uploadedFile);
}, [deleteFileArray, uploadedFile]);



  return (
    <div className="modal-overlay">
      <div className="modal-content">
      <div className='d-flex justify-content-between'>
          <h5 className="mb-3">Edit Article</h5>
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
                style={{ marginTop: '-0.5em' }}
                className="form-input"
                type="text"
                name="title"
                value={title}
                onChange={(e) => handleChangeTitle(e.target.value)}
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
                value={description}
                onChange={(e) => handleChangeDescription(e.target.value)}
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
                    value={tags}
                    onChange={handleSelectChange}
                    required={newTag.trim() === ""}
                >
                    <option value="">Select a tag</option>
                    {tagsArray.map((tag, index) => (
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
          <div className='my-5'>
                <div className='d-flex'>
                    <p className='mr-2'>Files:  </p>
                    <div>
                      <div className='ml-5'>
                        {file.map((file, index) => (
                          !deleteFileArray.includes(file.name) ? (
                            <div key={index} className='d-flex' style={{ alignItems: 'center', marginBottom: '0.5em' }}>
                              <p style={{ margin: '0', padding: '0' }}><i>{file.name}</i></p>
                              <FontAwesomeIcon title='Delete File' style={{ margin: "0 0 0 1em ", fontSize: "0.9em" }} icon={faTrash} onClick={() => deleteFile(file.name)} />
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                </div>
              {/* } */}
                <input 
                    className='hidden-file-input'
                    type='file'
                    id='file-input'
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    // ref={fileInputRef}
                  >
                  </input>
                  <label htmlFor="file-input" 
                    className={`mt-1 mb-3 custom-file-button`}
                    >
                        Add New File
                  </label>
                  {uploadedFile.length > 0 && (
                  <div className='d-flex '>              
                    <h6 className='mr-2'>New Files:</h6>
                    <div className='ml-3'>
                      {uploadedFile.length > 0 && uploadedFile.map((file, index) => (
                        <div key={index} className='d-flex'>
                          <h6><i>{file.name}</i></h6>
                          <FontAwesomeIcon title='Delete File' style={{ margin: "0.2em 0 0 1em ", fontSize: "0.9em" }} icon={faTrash} onClick={() => setUploadedFile(prevFiles => prevFiles.filter(f => f.name !== file.name))} />
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                  {/* <FontAwesomeIcon title='Add New File' icon={faPlus} /> */}
          </div>
          <div>
            <label>Publish to:</label>
            <div className="checkbox-container">
              <div>
                <label>
                  <input
                    className={`checkbox-all ${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                    type="checkbox"
                    name="categories"
                    value="All"
                    checked={selectedLanguages.includes('All')}
                    onChange={handleCheckboxChange}
                  />
                  All
                </label>
              </div>
              <div className='d-flex justify-content-between'>
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
              Update
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

export default Editpostknowledgebasemodal;