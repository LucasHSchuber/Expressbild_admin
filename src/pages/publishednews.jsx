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
  const [readNews, setReadNews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [combinedNews, setCombinedNews] = useState([]);
  const [languageCounts, setLanguageCounts] = useState({
    SE: 0,
    FI: 0,
    DK: 0,
    DE: 0,
    NO: 0,
  });

  const navigate = useNavigate();

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
  }, [news, readNews]);

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
  }, [users]);

  const handleOpenModal = () => {
    setShowModal(true);
    console.log('Modal opened from Index.jsx');
  };

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

  //delete news from database
  const deleteNews = async (id) => {
    console.log('deleted news id:', id);
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
        fetchAllData();
      } else {
        console.log('Error deleting news');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const navigateToNewsdetails = (item) => {
    console.log('navigate to page:', item.news.id);
    navigate(`/newsdetails/${item.news.id}`, { state: { item } });
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
          {combinedNews && combinedNews.length > 0 ? (
            combinedNews
              .slice() 
              .sort((a, b) => {
                // Sorting by created_at in descending order
                const dateA = new Date(a.news.created_at);
                const dateB = new Date(b.news.created_at);
                return dateB - dateA;
              })
              .map((item) => (
                <tr
                  key={item.news.id}
                  className="tr-tbody"
                  onClick={() => navigateToNewsdetails(item)}
                >
                  <td title={item.news.title}>{item.news.title}</td>
                  <td title={item.news.content}>
                    {item.news.content && item.news.content.length > 40
                      ? item.news.content.substring(0, 40) + "..."
                      : item.news.content}
                  </td>
                  <td>
                    {item.news.created_at &&
                      item.news.created_at.substring(0, 10)}
                  </td>
                  <td>
                    {item.news.updated_at &&
                      item.news.updated_at.substring(0, 10)}
                  </td>
                  <td style={{ color: 'green' }}>
                    {item.read_by && item.read_by.length}/
                    {Array.isArray(item.news.lang) && item.news.lang.length > 0
                      ? item.news.lang
                          .map((lang) => languageCounts[lang.trim()])
                          .reduce((a, b) => a + b, 0)
                      : '0'}
                  </td>
                  <td>
                    {Array.isArray(item.news.lang)
                      ? item.news.lang.join(', ')
                      : typeof item.news.lang === 'string'
                        ? item.news.lang
                        : ''}
                  </td>

                  <td>
                    <FontAwesomeIcon
                      className="delete-table"
                      icon={faTrashAlt}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(item.news.id);
                      }}
                    />
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="2">No published news.</td>
            </tr>
          )}
        </tbody>
      </table>

      <Newpostbutton onClick={handleOpenModal} />
      <Newpostmodal
        show={showModal}
        handleClose={handleCloseModal}
        refreshData={fetchAllData}
      />
    </div>
  );
};

export default Publishednews;
