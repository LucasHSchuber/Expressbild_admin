// src/components/PostModal.jsx
// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';

import { BeatLoader, RingLoader } from 'react-spinners'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTrash, faTimes, faUpload, faPenNib } from '@fortawesome/free-solid-svg-icons';

import ENV from '../../env.js'; 
console.log('ENV', ENV);
console.log('ENV.API_URL', ENV.API_URL);

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../assets/css/components.css';

import useFetchToken from "../assets/js/fetchToken.js"


const Editpostknowledgebasemodal = ({ show, handleClose, handleSubmit, item, refreshData, tagsArray}) => {
  if (!show) return null;
  //define states
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [tags, setTags] = useState([]);
  const [description, setDescription] = useState(item.description);
  const [file, setFile] = useState([]);
  const fileInputRef = useRef(null);

  const [deleteFileArray, setDeleteFileArray] = useState([]);
  const [uploadedFile, setUploadedFile] = useState([]);

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [errorBoarderLang, setErrorBoarderLang] = useState(false);

  const [openNewTag, setOpenNewTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newTagSelect, setNewTagSelect] = useState('');

  const { token, isValid } = useFetchToken();



  useEffect(() => {
    setTitle(item.title);
    setTags(item.tags);
    setFile(item?.files);
    setDescription(item.description);
    const initialLanguages = Array.isArray(item.langs)
      ? item.langs
      : typeof item.langs === 'string'
        ? item.langs.split(',')
        : [];
    setSelectedLanguages(initialLanguages);
  }, [item]);



  // Submit form and upload files and data
  const submitForm = async (event) => {
    event.preventDefault();
    if (selectedLanguages.length === 0) {
      console.log('Choose at least one country');
      setErrorBoarderLang(true);
      return;
    } else {
      setUploading(true);
      const fileResponses = []
      for (const _file of uploadedFile) {
        // console.log('_file', _file);
        const fileData = new FormData();
        fileData.append('file', _file)

        // Upload files to file server
        const file = await uploadToFileServer(fileData);
        console.log('File uploaded:', file);
        if (file) {
          fileResponses.push(file); 
        }
        console.log('fileResponses', fileResponses);
      }

      // Updating news article 
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags.join(", "));
      formData.append('langs', JSON.stringify(selectedLanguages));
      formData.append('deletedFiles', JSON.stringify(deleteFileArray)); 
      fileResponses.forEach(({ name, id }) => {
        formData.append('uploadedFiles', JSON.stringify({ name, id })); 
      });

      try {
        const response = await fetch(`${ENV.API_URL}api/articles/${item.id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Admin ${token}`,
                // 'Content-Type': 'application/json',
            },
            body: formData,  
        });
        const data = await response.json();
        console.log('response', response);
        console.log('data', data);
    
        if (data.status = 502){
          console.log("File Duplicate exists in database");
          toast.error(data.error);
          setUploading(false);
        }
        if (response.status === 200){
          refreshData();
          handleClose();
        }
      } catch (error) {
        console.error('Error updating news:', error);
        setUploading(false);
      }
    }
};

const uploadToFileServer = async (fileData) => {
  try {
    const FTPresponse = await axios.post("https://fs.ebx.nu/upload", fileData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Admin ${token}`,
      },
    });
    if (FTPresponse.status === 200) {
      console.log('FTPresponse', FTPresponse);
      return FTPresponse.data;  
    }
  } catch (error) {
    console.error(`Upload attempt failed`, error);
    setUploading(false);
  }
};


  

// handle change description
const handleChangeDescription = (value) => {
    console.log('description:', value);
    setDescription(value);
};
// handle change title
const handleChangeTitle = (title) => {
  console.log('title:', title);
setTitle(title);
}
// handle change checkbox - countries
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
// handle change tags
const handleSelectChange = (event) => {
    console.log('select tag', event.target.value);
    setNewTagSelect(event.target.value);
};
// handle new tag
const handleNewTagChange = (event) => {
    console.log('event.target.value', event.target.value);
    setNewTag(event.target.value);
};
// handle delete files
const deleteFile = (fileName) => {
  console.log('adding file to delete filename array', fileName);
  setDeleteFileArray((prevArray) => [...prevArray, fileName]);
};
// handle file cahange
const handleFileChange = (file) => { 
  console.log('file', file);
  if (file) {
    const maxSize = 210 * 1024 * 1024; 
    if (file.size > maxSize) {
      toast.error('File size cannot exceed 200 MB in file size');
      event.target.value = ''; 
    } else {
      console.log('File selected:', file);
      setUploadedFile((prevArray) => [...prevArray, file]);
    }
  } else {
    console.log('No file selected.');
  }
};
// add tag
const addTag = (tag) => {
  console.log('tag', tag);
  if (tag !== "" && !tags.includes(tag)){
  setTags((prevArray) => [...prevArray, tag]);
  setNewTag("");
  }  else {
    console.log('Tag already exists or is empty');
  }
};




  return (
    <div className="modal-overlay">

      {uploading && (
        <div className='uploading-box'> 
         <BeatLoader className='mb-3' color="#000" loading={uploading} size={15} />
          <h3><b>Uploading new data & files</b></h3> 
          <h5>Please wait...</h5> 
        </div>
      )}

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
              <label><b>Title:</b></label>
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
              <label><b>Description:</b></label>
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
          <div className='mt-4 mb-2 d-flex justify-content-between'>
            <div>
                <label htmlFor="tag-select"><b>Tag:</b></label>
                <select
                    className='mx-2 form-select'
                    id="tag-select"
                    name='tag'
                    value={newTagSelect}
                    onChange={handleSelectChange}
                    // required={newTag.trim() === ""}
                >
                    <option value="">Select a tag</option>
                    {tagsArray.map((tag, index) => (
                        <option key={index} value={tag}>
                            {tag}
                        </option>
                    ))}
                </select>
                <button disabled={uploading} className='standard add-button' title='Add Tag'  type="button"   onClick={() => addTag(newTagSelect)}> <FontAwesomeIcon icon={faPlus} /> </button>
                <button disabled={uploading} className='standard add-button' title='Create New Tag'  type="button" onClick={() => setOpenNewTag(!openNewTag)} > <FontAwesomeIcon  icon={faPenNib} /> </button>
            </div>
            {openNewTag && (
            <div className=''>
                <label htmlFor="new-tag">New tag:</label>
                <input
                    style={{ width: "10em" }}
                    className='mx-2'
                    id="new-tag"
                    type="text"
                    value={newTag}
                    onChange={handleNewTagChange} 
                />
                <button className='standard add-button' title='Add Tag'  type="button"   onClick={() => addTag(newTag)}> <FontAwesomeIcon icon={faPlus} /> </button>
            </div>
            )}
          </div>
          <div className='mb-4'>
            {tags.length > 0 && (
              <div className='ml-2'>
              {/* <h6><b>Tags:</b></h6> */}
                {tags.map((tag, index) => (
                  <div key={index}>
                    {index + 1}. {" "} {tag}
                    <FontAwesomeIcon title='Delete Tag' className='delete-icon ml-2' icon={faTrash} onClick={() => setTags(prevArray => prevArray.filter(f => f !== tag))} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <hr></hr>
          <div className='mt-2 mb-2'>
                <div className='d-flex'>
                    <p className='mr-2'><b>Files:</b></p>
                    <div>
                      <div className='ml-5'>
                        {file.map((file, index) => (
                          !deleteFileArray.includes(file.name) ? (
                            <div key={index} className='d-flex' style={{ alignItems: 'center', marginBottom: '0.5em' }}>
                              <p style={{ margin: '0', padding: '0' }}><i>{index+1}. {" "}{file.name}</i></p>
                              <FontAwesomeIcon title='Delete File' className='delete-icon ml-2' icon={faTrash} onClick={() => deleteFile(file.name)} />
                            </div>
                          ) : null
                        ))}
                      </div>
                    </div>
                </div>
              {/* } */}
                  {uploadedFile.length > 0 && (
                  <div className='d-flex mt-2'>              
                    <h6 className='mr-2'>New Files:</h6>
                    <div className='ml-3'>
                      {uploadedFile.length > 0 && uploadedFile.map((file, index) => (
                        <div key={index} className='d-flex'>
                          <h6><i>{index+1}. {" "} {file.name}</i></h6>
                          <FontAwesomeIcon title='Delete File' className='delete-icon ml-2' icon={faTrash} onClick={() => setUploadedFile(prevFiles => prevFiles.filter(f => f.name !== file.name))} />
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                  <input 
                    className='hidden-file-input'
                    type='file'
                    id='file-input'
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    // ref={fileInputRef}
                  >
                  </input>
                  <label htmlFor="file-input" 
                    className={`mt-1 custom-file-button`}
                    >
                        <FontAwesomeIcon title='Upload File' icon={faUpload} />
                  </label>
          </div>
          <hr></hr>
          <div>
            <label><b>Publish to:</b></label>
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
