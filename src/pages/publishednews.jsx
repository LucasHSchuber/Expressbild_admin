// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Newpostbutton from '../components/newpostbutton';
import Newpostmodal from '../components/newpostmodal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faT,
  faAlignJustify,
  faClock,
  faPenToSquare,
  faGlasses,
  faGlobeAmericas,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

const Publishednews = () => {
  //define states
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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

  const deleteNews = async (id) => {
    console.log('deleted news:', id);
  };

  const navigateToNewsdetails = (item) => {
    console.log('navigate to page:', item.id);
    navigate(`/newsdetails/${item.id}`, { state: { item } });
  };

  return (
    <div className="page-wrapper table-responsive">
      <h6 className="mb-4">
        <b>Published news:</b>
      </h6>
      <table className="table ">
        <thead>
          <tr>
            <th>
              <FontAwesomeIcon icon={faT} />
            </th>
            <th>
              <FontAwesomeIcon icon={faAlignJustify} />
            </th>
            <th>
              <FontAwesomeIcon icon={faClock} />
            </th>
            <th>
              <FontAwesomeIcon icon={faPenToSquare} />
            </th>
            <th>
              <FontAwesomeIcon icon={faGlasses} />
            </th>
            <th>
              <FontAwesomeIcon icon={faGlobeAmericas} />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {news.length !== 0 ? (
            news.map((item) => (
              <tr
                key={item.id}
                className="tr-tbody"
                onClick={() => navigateToNewsdetails(item)}
              >
                <td title={item.title}>{item.title}</td>
                <td title={item.content}>
                  {item.content && item.content.length > 40
                    ? item.content.substring(0, 40)
                    : item.content}
                </td>
                <td>{item.created_at && item.created_at.substring(0, 10)}</td>
                <td>{item.updated_at && item.updated_at.substring(0, 10)}</td>
                <td>x</td>
                <td>{item.lang.join(', ')}</td>
                <td>
                  <FontAwesomeIcon
                    className="delete-table"
                    icon={faTrashAlt}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNews(item.id);
                    }}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No news available.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Newpostbutton onClick={handleOpenModal} />
      <Newpostmodal
        show={showModal}
        handleClose={handleCloseModal}
      />
    </div>
  );
};

export default Publishednews;
