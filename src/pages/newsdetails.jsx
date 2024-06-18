// src/pages/NewsDetail.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';

import Editpostmodal from '../components/editpostmodal';

const Newsdetails = () => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { item } = location.state || {};

  useEffect(() => {
    const fetchNewsDetails = async () => {
      const token = '666ab2a5be8ee1.66302861';
      try {
        const response = await axios.get(
          `/api/index.php/rest/photographer_portal/News`,
          {
            headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setNews(response.data.result);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news details:', error);
        setLoading(false);
      }
    };

    fetchNewsDetails();
  });

  const handleOpenModal = () => {
    setShowModal(true);
    console.log('Modal opened from newsdetails.jsx');
  };


  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmitPost = (post) => {
    console.log('Post submitted:', post);
  };

  if (!item) {
    return <div>No news details available.</div>;
  }

  return (
    <div className="page-wrapper">
      <button className="button cancel mb-5" onClick={() => navigate(-1)}>
      <FontAwesomeIcon icon={faCaretLeft} /> Back
      </button>
      <div className="news-details d-flex">
        <div className="left-box mr-5">
          <h5>
            <b>{item.title}</b>
          </h5>
          <p>{item.content}</p>
          <p>
            <strong>Created at:</strong>{' '}
            {item.created_at && item.created_at.substring(0, 10)}
          </p>
          <p>
            <strong>Updated at:</strong>{' '}
            {item.updated_at && item.updated_at.length > 0
              ? item.updated_at.substring(0, 10)
              : '-'}
          </p>
          <p>
            <strong>Published to:</strong> {item.lang.join(', ')}
          </p>
          <div>
          <button  className="button mr-2 edit" onClick={handleOpenModal}>Edit</button>
          <button  className="button delete" >Delete</button>
          </div>
        </div>
        <div className="right-box d-flex">
          <div>
            <h6 className='mr-3'>Confirmed by</h6>
          </div>
          <div>
            <h6>Not confirmed by</h6>
          </div>
        </div>
      </div>

      < Editpostmodal show={showModal}
        handleClose={handleCloseModal}
        handleSubmit={handleSubmitPost} item={item}/>
    </div>
  );
};

export default Newsdetails;
