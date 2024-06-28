// src/pages/NewsDetail.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretLeft,
  faPenToSquare,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

import Editpostmodal from '../components/editpostmodal';

const Newsdetails = () => {
  //define states
  const [loading, setLoading] = useState(true);

  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [readNews, setReadNews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [combinedNews, setCombinedNews] = useState([]);
  const [pulledNews, setPulledNews] = useState([]);
  const [languageCounts, setLanguageCounts] = useState({
    SE: 0,
    FI: 0,
    DK: 0,
    DE: 0,
    NO: 0,
  });
  const [refreshCount, setRefreshCount] = useState(1);

  const location = useLocation();
  
  const navigate = useNavigate();
  const { item } = location.state || {};
 
  const { id } = useParams();
  
  useEffect(() => {
    console.log('ID from URL:', id);
  }, [id]);

  const fetchAllData = () => {
    //fetching all news
    const fetchNews = async () => {
      const token = '666ab2a5be8ee1.66302861';
      try {
        const response = await axios.get(
          '/api/index.php/rest/photographer_portal/news',
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

    //fetching all read post
    const fetchReadAllNews = async () => {
      const token = '666ab2a5be8ee1.66302861';
      try {
        const responseRead = await axios.get(
          '/api/index.php/rest/photographer_portal/newsread',
          {
            headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Fetched read-news:', responseRead.data.result);
        setReadNews(responseRead.data.result);
      } catch (error) {
        console.error('Error fetching read-news:', error);
      }
    };

    fetchNews();
    fetchUsers();
    fetchReadAllNews();
    setRefreshCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    // Merge arrays
    const mergeNewsIntoReadNews = () => {
      const newsToAdd = news.filter((newsItem) => {
        const exists = readNews.some(
          (readItem) => readItem.news.id === newsItem.id
        );
        return !exists;
      });

      // Append filtered news items to readNews
      const updatedReadNews = [
        ...readNews,
        ...newsToAdd.map((item) => ({ news: { ...item }, read_by: [] })),
      ];
      setCombinedNews(updatedReadNews);
      console.log('Combines news array:', updatedReadNews);
    };

    mergeNewsIntoReadNews();
  }, [news, readNews, refreshCount]);

  useEffect(() => {
    const countSumCountries = () => {
      const counts = {
        SE: 0,
        FI: 0,
        DK: 0,
        DE: 0,
        NO: 0,
      };

      users.forEach((user) => {
        switch (user.lang) {
          case 'SE':
            counts.SE++;
            break;
          case 'FI':
            counts.FI++;
            break;
          case 'DK':
            counts.DK++;
            break;
          case 'DE':
            counts.DE++;
            break;
          case 'NO':
            counts.NO++;
            break;
          default:
            break;
        }
      });

      setLanguageCounts(counts);
      console.log('languageCounts', languageCounts);
    };

    if (users.length > 0) {
      countSumCountries();
    }
  }, [users, refreshCount]);

  useEffect(() => {
    const pullNewsFromCombinedNews = () => {
      const pulled = combinedNews.find((r) => r.news.id === item.news.id);
      setPulledNews(pulled);
      filterUsersByConfirm();
    };

    if (combinedNews.length > 0) {
      pullNewsFromCombinedNews();
      console.log('pulledNews:', pulledNews);
    }
  }, [combinedNews, item.news.id]);

  //run filterUserByConfirm if pulledNews is updated
  useEffect(() => {
    if (pulledNews) {
      filterUsersByConfirm();
    }
  }, [pulledNews, users]);

  //filter out all users that have read news
  const filterUsersByConfirm = () => {
    const fetchedUsers = users;
    const filteredUsers = fetchedUsers.filter((user) => {
      return pulledNews?.news?.lang.includes(user.lang);
    });
    console.log('Filtered users:', filteredUsers);
    // // Remove users from filteredUsers who are also in pulledNews.read_by
    const finalFilteredUsers = filteredUsers.filter((user) => {
      return !pulledNews?.read_by.some((readUser) => readUser.id === user.id);
    });
    console.log('Final filtered users:', finalFilteredUsers);
    setFilteredUsers(finalFilteredUsers);
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
  const handleDeleteClick = (newsId) => {
    const userConfirmed = window.confirm(
      'Are you sure you want to delete this news item?'
    );
    if (userConfirmed) {
      deleteNews(newsId);
    }
  };

  //Method to delete post
  const deleteNews = async (id) => {
    console.log('deleted news:', id);
    const token = '666ab2a5be8ee1.66302861';
    try {
      const responseDelete = await axios.delete(
        `/api/index.php/rest/photographer_portal/news/${id}`,
        {
          headers: {
            Authorization: `Admin ${token}`,
          },
        }
      );
      console.log('Response news deleted:', responseDelete);
      if (responseDelete.status === 200 || responseDelete.status === 201) {
        console.log('Response news deleted:', responseDelete.data.result);
        navigateToPublishednews();
      } else {
        console.log('Error deleting news');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  //Redirect user after delete news
  const navigateToPublishednews = () => {
    navigate('/');
  };

  if (!item) {
    return <div>No news details available.</div>;
  }

  return (
    <div className="page-wrapper">
      <button className="back mb-5" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faCaretLeft} />
      </button>

      <div className="news-details d-flex">
        {pulledNews && (
          <div className="left-box mr-5 ">
            <div className="inner-left-box">
              <h5>
                <b>{pulledNews?.news?.title}</b> {/* Display the title */}
              </h5>
              <div
                dangerouslySetInnerHTML={{ __html: pulledNews?.news?.content }}
              ></div>
              <hr></hr>
              <p>
                <strong>Created at:</strong>{' '}
                {pulledNews?.news?.created_at?.substring(0, 10)}
              </p>
              <p>
                <strong>Updated at:</strong>{' '}
                {pulledNews?.news?.updated_at?.substring(0, 10) || '-'}
              </p>
              <p>
                <strong>Published to:</strong>{' '}
                {pulledNews?.news?.lang.join(', ')}
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
                  onClick={() => handleDeleteClick(pulledNews?.news?.id)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {pulledNews && (
          <div className="right-box d-flex">
            <div className="mr-4">
              <h6
                style={{ borderBottom: '0.5px solid #dcdcdc' }}
                className="mr-3"
              >
                Confirmed by:
                <span
                  className="ml-2"
                  style={{ color: 'green', fontSize: '0.8em' }}
                >
                  ({item.read_by && item.read_by.length}/
                  {Array.isArray(item.news.lang) && item.news.lang.length > 0
                    ? item.news.lang
                        .map((lang) => languageCounts[lang.trim()])
                        .reduce((a, b) => a + b, 0)
                    : '0'}
                  )
                </span>
              </h6>
              <div>
                {pulledNews?.read_by?.map((user) => (
                  <>
                    <h6 style={{ fontSize: '0.8em', color: 'green' }}>
                      {user.firstname} {user.surname}
                    </h6>
                  </>
                ))}
              </div>
            </div>
            <div>
              <h6 style={{ borderBottom: '0.5px solid #dcdcdc' }}>
                Not confirmed by:
                <span
                  className="ml-2"
                  style={{ color: 'red', fontSize: '0.8em' }}
                >
                  ({filteredUsers && filteredUsers.length}/
                  {Array.isArray(item.news.lang) && item.news.lang.length > 0
                    ? item.news.lang
                        .map((lang) => languageCounts[lang.trim()])
                        .reduce((a, b) => a + b, 0)
                    : '0'}
                  )
                </span>
              </h6>
              <span>
                {filteredUsers.length > 0 && filteredUsers ? (
                  filteredUsers.map((user) => (
                    <h6
                      style={{ fontSize: '0.8em', color: 'red' }}
                      key={user.id}
                    >
                      {user.firstname} {user.surname}
                    </h6>
                  ))
                ) : (
                  <></>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <Editpostmodal
        show={showModal}
        handleClose={handleCloseModal}
        item={pulledNews}
        refreshData={fetchAllData}
      />
    </div>
  );
};

export default Newsdetails;
