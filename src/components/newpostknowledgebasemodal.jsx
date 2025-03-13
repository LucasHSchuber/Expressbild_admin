// src/components/PostModal.jsx
// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import { BeatLoader, RingLoader } from 'react-spinners'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faMinus, faTrash, faUpload, faPenNib } from '@fortawesome/free-solid-svg-icons';

import ENV from '../../env.js'; 
console.log('ENV', ENV);
console.log('ENV.API_URL', ENV.API_URL);

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../assets/css/components.css';

import useFetchToken from "../assets/js/fetchToken.js"


const Newpostmodal = ({ show, handleClose, refreshData, tags }) => {
  if (!show) return null;
  //define states
  const [uploading, setUploading] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [file, setFile] = useState([]);
  const [tagsArray, setTagsArray] = useState([]);
  const [errorBoarderLang, setErrorBoarderLang] = useState(false);
  const [errorTags, setErrorTags] = useState(false);

  const [openNewTag, setOpenNewTag] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [newTag, setNewTag] = useState('');

  const { token, isValid } = useFetchToken();
  console.log('token', token);
  console.log('isValid', isValid);



  
  //submit new post form
  const submitForm = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const selectedLang = formData
      .getAll('lang')
      .filter((category) => category !== 'All');
    const lang = selectedLang.join(',');
    const tags = tagsArray.join(", ");

    if (formData.get('description') === "") {
      console.log('Missing description');
      return;
    }
    if (lang === '') {
      console.log('Choose at least one country');
      setErrorBoarderLang(true);
      return;
    } 
    if (tags === '') {
      console.log('Choose at least one tag');
      setErrorTags(true);
      return;
    } 
    if (tagsArray.length === 0) {
        console.log('Missing tag');
        return;
    }
    else {
      const post = {
        title: formData.get('title'),
        description: formData.get('description'),
        tags: tags,
        langs: lang,
      };
      handleSubmitPost(post);
    }
  };

  //submitting post
  const handleSubmitPost = async (post) => {
    setUploading(true);
    const fileResponses = []
    console.log('Post submitted:', post);
    // Step 1: Upload file/files to FTP
    for (const _file of file) {
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

    if (fileResponses.length === file.length){
          // Step 2: If response OK from FTP then upload to db
            const formData = new FormData();
            formData.append('title', post.title);
            formData.append('description', post.description);
            formData.append('tags', post.tags);
            formData.append('langs', post.langs);
            fileResponses.forEach(({ name, id }) => {
              formData.append('files', JSON.stringify({ name, id })); 
            });
            const response = await fetch(`${ENV.API_URL}api/articles`, {
                method: 'POST',
                headers: {
                    Authorization: `Admin ${token}`,
                },
                body: formData, 
            });
            const result = await response.json();
            if (!response.ok) {
              console.log('Response not ok', response);
              console.log('Response not ok', result);
              setUploading(false);
              throw new Error('Network response was not ok');
            }
            console.log('Article added:', result);
            handleClose();
            setTagsArray([]);
            refreshData();
            setUploading(false);
    } else{
      console.log('error adding file to File-server', error);
      setUploading(false);
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



  // handle file cahnge
  const handleFileChange = (file) => {
    // const file = event.target.files[0]; 
    console.log('file', file);
    // setFile((prevArray) => [...prevArray, file]);
    if (file) {
      const maxSize = 210 * 1024 * 1024; 
      if (file.size > maxSize) {
        console.log("Too large file");
        toast.error('File size cannot exceed 200 MB in file size');
        event.target.value = ''; 
      } else {
        console.log('File selected:', file);
        setFile((prevArray) => [...prevArray, file]);
      }
    } else {
      console.log('No file selected.');
    }
  };
  

  // set tag
  const handleSelectChange = (tag) => {
      console.log('tag', tag);
      setErrorTags(false)
      console.log('tag', tag);
      if (tag !== "" && !tagsArray.includes(tag)){
      setTagsArray((prevArray) => [...prevArray, tag]);
      setNewTag("");
      }  else {
        console.log('Tag already exists or is empty');
      }
      // setSelectedTag(event.target.value);
  };
  // set new tag
  const handleNewTagChange = (event) => {
      console.log('event.target.value', event.target.value);
      setNewTag(event.target.value);
  };
  const addTag = (tag) => {
    console.log('tag', tag);
    if (tag !== "" && !tagsArray.includes(tag)){
    setTagsArray((prevArray) => [...prevArray, tag]);
    setNewTag("");
    }  else {
      console.log('Tag already exists or is empty');
    }
  };


  useEffect(() => {
    console.log('tagsArray', tagsArray);
  }, [tagsArray]);



  return (
    <div className="modal-overlay">

      {uploading && (
        <div className='uploading-box'> 
         <BeatLoader className='mb-3' color="#000" loading={uploading} size={15} />
          <h3><b>Uploading data & files</b></h3> 
          <h5>Please wait...</h5> 
        </div>
      )}
     
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
              <label><b>Title:</b></label>
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
              <label><b>Description:</b></label>
            </div>
            <div>
              <textarea
                className={`form-textarea`}
                name="description"
                // required
              />
            </div>
          </div>
          <div className='my-4 d-flex justify-content-between'>
            <div>
                <label htmlFor="tag-select"><b>Tags:</b></label>
                <select
                    className='mx-2 form-select'
                    id="tag-select"
                    name='tag'
                    value={selectedTag}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    required={tagsArray.length === 0}
                >
                    <option value="">Select a tag</option>
                    {tags.map((tag, index) => (
                        <option key={index} value={tag}>
                            {tag}
                        </option>
                    ))}
                </select>
                {/* <button disabled={uploading} className='standard add-button' title='Add Tag'  type="button"  onClick={() => addTag(selectedTag)}>  <FontAwesomeIcon icon={faPlus} /> </button> */}
                <button disabled={uploading} className='standard add-button' title='Create New Tag'  type="button"  onClick={() => setOpenNewTag(!openNewTag)}><FontAwesomeIcon  icon={faPenNib} /></button>
                {tagsArray.length > 0 && (
                  <div className='ml-2'>
                  {/* <h6><b>Tags:</b></h6> */}
                    {tagsArray.map((tag, index) => (
                      <div key={index}>
                        {index + 1}. {" "} {tag}
                        <FontAwesomeIcon title='Delete Tag' className='delete-icon ml-2' icon={faTrash} onClick={() => setTagsArray(prevArray => prevArray.filter(f => f !== tag))} />
                      </div>
                    ))}
                  </div>
                )}
                {errorTags && (
                    <h6 style={{ color: "red", marginTop: "0.5em" }}>Press '+'-button to add the selected tag</h6>
                )}
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
                {/* {newTag.length > 0 && ( */}
                  <button className='standard add-button' title='Add Tag'  type="button"  onClick={() => addTag(newTag)}> <FontAwesomeIcon icon={faPlus} /> </button>
                {/* )} */}
            </div>
            )}
        </div>
        <hr></hr>
          <div className='mb-4 mt-4 '>
            <input 
              className='hidden-file-input'
                type='file'
                id='file-input'
                onChange={(e) => handleFileChange(e.target.files[0])}
            >
            </input>
            <label><b>Files:</b></label>
            <label htmlFor="file-input" 
              className={`ml-2 custom-file-button`}
              >
              {/* Upload */}
              <FontAwesomeIcon title='Upload File' icon={faUpload} />
            </label>
            {file.length > 0 && (
            <div className='ml-2' style={{ width: "20em" }}>              
              {/* <h6><b>Files:</b></h6> */}
              {file.length > 0 && file.map((file, index) => (
                <div key={index} className='d-flex'>
                  <h6>{index + 1}. {" "} {file.name}</h6>
                  <FontAwesomeIcon title='Delete File' className='delete-icon ml-2' icon={faTrash} onClick={() => setFile(prevFiles => prevFiles.filter(f => f.name !== file.name))} />
                </div>
               ))}
            </div>
            )}
          </div>
          <hr></hr>
          <div>
            <label><b>Publish to:</b></label>
            <div className="checkbox-container">
              <label>
                <input
                  className={`checkbox-all ${errorBoarderLang ? 'checkbox-error-border' : ''}`}
                  type="checkbox"
                  name="lang"
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
                    name="lang"
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
                    name="lang"
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
                    name="lang"
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
                    name="lang"
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
                    name="lang"
                    value="SE"
                    checked={selectedLanguages.includes('SE')}
                    onChange={handleCheckboxChange}
                  />{' '}
                  Sweden
                </label>
              </div>
            </div>
          </div>
          <div className="mt-4">
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
