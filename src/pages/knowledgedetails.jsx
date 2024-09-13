// src/pages/NewsDetail.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretLeft,
  faPenToSquare,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

import Editpostmodal from '../components/editpostmodal';

import '../assets/css/global.css';

const Knowledgedetails = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { item } = location.state || {};
  console.log('item', item);
  
 
  
  //define states
  const [showModal, setShowModal] = useState(false);
  const [refreshCount, setRefreshCount] = useState(1);
  const [token, setToken] = useState('');
  

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
  const handleDeleteClick = (newsId) => {
    const userConfirmed = window.confirm(
      'Are you sure you want to delete this article in the Knowledge Base? All data will be lost.'
    );
    if (userConfirmed) {
      deleteArticle(newsId);
    }
  };

  //Method to delete post
  const deleteArticle = async (id) => {
    console.log('deleted article:', id);
    // const token = '666ab2a5be8ee1.66302861';
    // try {
    //   const responseDelete = await axios.delete(
    //     `/api/index.php/rest/photographer_portal/news/${id}`,
    //     {
    //       headers: {
    //         Authorization: `Admin ${token}`,
    //       },
    //     }
    //   );
    //   console.log('Response news deleted:', responseDelete);
    //   if (responseDelete.status === 200 || responseDelete.status === 201) {
    //     console.log('Response news deleted:', responseDelete.data.result);
    //     navigateToPublishednews();
    //   } else {
    //     console.log('Error deleting news');
    //   }
    // } catch (error) {
    //   console.error('Error deleting news:', error);
    // }
  };

//   //Redirect user after delete news
//   const navigateToPublishednews = () => {
//     navigate('/');
//   };

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
                <strong>Created at:</strong>{' '}
                {item.created_at?.substring(0, 10)}
              </p>
              <p>
                <strong>Updated at:</strong>{' '}
                {item.updated_at?.substring(0, 10) || '-'}
              </p>
              <p>
                <strong>Published to:</strong>{' '}
                {item.langs.join(', ')}
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

      <Editpostmodal
        show={showModal}
        handleClose={handleCloseModal}
        item={item}
        // refreshData={fetchAllData}
      />
    </div>
  );
};

export default Knowledgedetails;
