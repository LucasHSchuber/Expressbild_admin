// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import Newpostbutton from '../components/newpostbutton';
import Newpostmodal from '../components/newpostmodal';

const Index = () => {
  //define states
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    //fetching all news
    const fetchNews = async () => {
      const token = '666ab2a5be8ee1.66302861';
      try {
        const response = await axios.get(
          '/api/index.php/rest/photographer_portal/News',
          {
            headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Fetched news:', response.data.result);
        setNews(response.data.result);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    //fetching all users
    const fetchUsers = async () => {
      const token = '666ab2a5be8ee1.66302861';
      try {
        const responseUsers = await axios.get(
          '/api/index.php/rest/photographer_portal/users',
          {
            headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Fetched users:', responseUsers.data.result);
        setUsers(responseUsers.data.result);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    // //fetching all read post
    // const fetchRead = async () => {
    //     const token = "666ab2a5be8ee1.66302861";
    //     try {
    //       const responseRead = await axios.get('/api/index.php/rest/photographer_portal/newsread', {
    //         headers: {
    //           Authorization: `Admin ${token}`,
    //           'Content-Type': 'application/json',
    //         },
    //       });
    //       console.log('Fetched read:', responseRead.data);
    //     //   setUsers(responseUsers.data.result);
    //     } catch (error) {
    //       console.error('Error fetching read:', error);
    //     }
    //   };

    fetchNews();
    fetchUsers();
    // fetchRead();
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
    console.log('Modal opened from Index.jsx');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

//   const handleSubmitPost = (post) => {
//     console.log('Post submitted:', post);
//   };

  return (
    <div className="page-wrapper">
      <h6 className="mb-4">
        <b>Admin for news</b>
      </h6>
      {/* {news.length !== 0 ? (
        news.map((item) => (
          <div key={item.id} className="mb-4">
            <h6 style={{ color: 'black' }}>{item.title}</h6>
            <p>{item.content}</p>
          </div>
        ))
      ) : (
        <p>No news available.</p>
      )} */}

      <Newpostbutton onClick={handleOpenModal} />
      <Newpostmodal
        show={showModal}
        handleClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
