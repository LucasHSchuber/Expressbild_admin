// src/pages/NewsDetail.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

import ENV from '../../env.js'; 
console.log('ENV', ENV);
console.log('ENV.API_URL', ENV.API_URL);

import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretLeft,
  faPenToSquare,
  faTrashAlt,
  faFile
} from '@fortawesome/free-solid-svg-icons';

import Editpostknowledgebasemodal from '../components/editpostknowledgebasemodal';

import '../assets/css/global.css';

import fetchTags from '../assets/js/fetchTags.js';
import useFetchToken from "../assets/js/fetchToken.js"



const Knowledgedetails = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { itemId } = location.state || {};
  console.log('itemId', itemId);
  
  //define states
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [item, setItem] = useState({});
  const [tags, setTags] = useState([]);

  const { token, isValid } = useFetchToken();
  console.log('token', token);
  console.log('isValid', isValid);


  // method to fetch data for spcific article with id
  const fetchData = async () => {
    setLoading(true);
    try {
    const response = await fetch(`${ENV.API_URL}api/articles/${itemId}`);
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Fetched data:', data);
    setItem(data)
    getTags();
    } catch (error) {
    console.log('error:', error);
    setLoading(false);
    }
  };
  useEffect(() => {
    if (isValid) {
      fetchData();
    }
  }, [token, isValid]);
  // method to fetch existing tags
  const getTags = async () => {
    const fetchedTags = await fetchTags();
    setTags(fetchedTags); 
    console.log('fetchedTags', fetchedTags);
    setLoading(false);
  };



  // View file from file-server
  const viewFile = async (file_server_id) => {
    let fileURL = 'https://fs.ebx.nu/view/' + file_server_id
    window.open(fileURL);
  };



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
        const responseDelete = await fetch(`${ENV.API_URL}api/articles/${id}`, {
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

  // If missing token SHOW:
  if (isValid === false) {
    return (
        <div className='page-wrapper' >
        <h2 style={{ color: '#ff4d4d', marginBottom: '10px' }}>Missing or Invalid Token</h2>
        <h5 style={{ color: '#666', marginBottom: '20px' }}>
            Please contact IT if the issue persists.
        </h5>
        <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px',backgroundColor: '#007bff',color: '#fff',border: 'none',borderRadius: '5px',cursor: 'pointer'}}
        >
            Refresh Page
        </button>
    </div>
    );
  }

  return (
    <div className="page-wrapper">

      <button className="back mb-5" title='Back' onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faCaretLeft} />
      </button>

      <div className="knowledge-details">

        {item ? (
          <div className="knowledge-details-box d-flex">
             <div className='knowledge-details-left-box'>
                  <strong>Title:</strong>{' '}<br></br>
                  <p>{item.title}</p>
                  <strong>Description:</strong>{' '}
                  <p>{item.description}</p>
                  <p>
                    <strong>Tags:</strong>{' '}
                    <span>
                        {item.tags && item.tags.join(", ")}
                    </span>
                  </p>
                  <p>
                    <strong>Files:</strong>{' '}<br></br>
                    {item.files && item.files.map((file) => (
                    <span key={file.id}>
                        <button className='file-button ' title='Open File' onClick={() => viewFile(file.file_server_id)}><FontAwesomeIcon style={{ color: "#008e9b" }} className='mr-2' icon={faFile} />{file.name}</button>
                    </span>
                  ))}
                  </p>
                  <div className="mt-5">
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
              <div className='knowledge-details-right-box'>
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
              </div>
          </div>
        ) : null } 
      

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
