// src/pages/NewsDetail.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';


import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretLeft,
  faPenToSquare,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

import Editpostknowledgebasemodal from '../components/editpostknowledgebasemodal';

import '../assets/css/global.css';

import fetchTags from '../assets/js/fetchTags.js';



const Knowledgedetails = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { itemId } = location.state || {};
  console.log('itemId', itemId);
  
 
  //define states
  const [showModal, setShowModal] = useState(false);
  const [refreshCount, setRefreshCount] = useState(1);
  const [token, setToken] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);

  const [item, setItem] = useState({});
  const [tags, setTags] = useState([]);



  
  const fetchData = async () => {
    try {
    const response = await fetch(`http://localhost:3003/api/articles/${itemId}`);
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Fetched data:', data);
    setItem(data)
    getTags();
    } catch (error) {
    console.log('error:', error);
    }
  };

  const getTags = async () => {
    const fetchedTags = await fetchTags();
    setTags(fetchedTags); 
  console.log('fetchedTags', fetchedTags);
  };

  useEffect(() => {
    fetchData();
  }, [token]);



  // Decode base64 string and create Blob URL
  const viewFile = (base64String, filename) => {
    try {
        console.log('filename:', filename);
        console.log('Base64 String (first 100 characters):', base64String.substring(0, 100)); // Log only the first 100 characters for brevity

        const blob = base64ToBlob(base64String);
        console.log('Blob:', blob);

        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error viewing file:', error);
    }

  };
  function base64ToBlob(base64, contentType = 'application/pdf') {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters).map(char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
}



  // Fetch token from URL query parameters
  useEffect(() => {
    const fetchToken = () => {
      // Check if the environment is development
      if (process.env.NODE_ENV === 'development') {
        setToken('666ab2a5be8ee1.66302861');
      } else {
        // Fetch token from URL query parameters
        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromQuery = queryParams.get('token');
        console.log(tokenFromQuery);
        setToken(tokenFromQuery !== undefined ? tokenFromQuery : ''); 
      }
    };
    fetchToken();
  }, []);

  
  //handle open modal
  const handleOpenModal = () => {
    setShowModal(true);
    console.log('Modal opened from newsdetails.jsx');
  };
  //handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  //delete confrim
  const handleDeleteClick = (id) => {
    const userConfirmed = window.confirm(
      'Are you sure you want to delete this article in the Knowledge Base?'
    );
    if (userConfirmed) {
      deleteArticle(id);
    }
  };

  //Method to delete post
  const deleteArticle = async (id) => {
    console.log('deleted article:', id);
    const token = '666ab2a5be8ee1.66302861';
    try {
        const responseDelete = await fetch(`http://localhost:3003/api/articles/${id}`, {
              method: 'DELETE',
              headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
              },
          }
        );
          // Check if response is ok
        if (!responseDelete.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('responseDelete:', responseDelete)
        const result = await responseDelete.json();
        console.log('Article deletion result:', result)
        if (result.status === 200) {
          console.log('Article marked as deleted successfully');
          navigateToPublishednews();
        } else {
          console.log('Error deleting article');
        }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  //Redirect user after delete news
  const navigateToPublishednews = () => {
    navigate('/knowledgebase');
  };


  if (!item) {
    return <div>No data details available.</div>;
  }



  return (
    <div className="page-wrapper">
      <button className="back mb-5" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faCaretLeft} />
      </button>

      <div className="knowledge-details d-flex">
        {item && (
          <div className="left-box mr-5 ">
              <h5>
                <b>{item.title}</b> 
              </h5>
              <p>{item.description}</p>
              <p>
                <strong>Tags:</strong>{' '}
                <span>
                    {item.tags && item.tags.join(", ")}
                </span>
              </p>
              <p>
                <strong>Files:</strong>{' '}
                {item.files && item.files.map((file) => (
                <span key={file.id}>
                    <button className='file-button ' title='Open File' onClick={() => viewFile(file.path, file.name)}>{file.name}</button>
                </span>
              ))}
              </p>
              <p>
                <strong>Created at:</strong>{' '}
                {item.created_at?.substring(0, 10)}
              </p>
              <p>
                <strong>Updated at:</strong>{' '}
                {item.updated_at?.substring(0, 10) || '-'}
              </p>
              <p>
                <strong>Published to:</strong>{' '}
                {item.langs && item.langs.join(", ")}
              </p>
              <div className="mt-4">
                <button
                  className="button mr-2 standard"
                  onClick={handleOpenModal}
                >
                  <FontAwesomeIcon icon={faPenToSquare} /> Edit
                </button>
                <button
                  className="button delete"
                  onClick={() => handleDeleteClick(item.id)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete
                </button>
              </div>
          </div>
        )}

      </div>

      <Editpostknowledgebasemodal
        show={showModal}
        handleClose={handleCloseModal}
        item={item}
        tagsArray={tags}
        refreshData={fetchData}
      />

      
    </div>
  );
};

export default Knowledgedetails;
