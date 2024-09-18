// src/pages/Home.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Newpostbutton from '../components/newpostbutton';
import Newpostknowledgebasemodal from '../components/newpostknowledgebasemodal';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faT,
  faAlignJustify,
  faClock,
  faPenToSquare,
  faGlasses,
  faGlobeAmericas,
  faTrashAlt,
  faPlus,
  faFile,
  faTag
} from '@fortawesome/free-solid-svg-icons';

import '../assets/css/main_knowledgebase.css';
import '../assets/css/global.css';

import fetchTags from "../assets/js/fetchTags.js"




const Knowledgebase = () => {
  //define states   
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [combinedNews, setCombinedNews] = useState([]);
  const [languageCounts, setLanguageCounts] = useState({
    SE: 0,
    FI: 0,
    DK: 0,
    DE: 0,
    NO: 0,
  });
  const [token, setToken] = useState("");
  const [tags, setTags] = useState([]);

  const navigate = useNavigate();


 
  const fetchData = async () => {
    try {
    const response = await fetch('http://localhost:3003/api/articles');
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Fetched data:', data);
    setKnowledgeBase(data)
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


  



  // Fetch token from URL query parameters
  useEffect(() => {
    const fetchToken = () => {
      // Check if the environment is development
      if (process.env.NODE_ENV === 'development') {
        setToken('666ab2a5be8ee1.66302861');
      } else {
        // Fetch token from URL query parameters
        const location = useLocation();
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token'); 
        console.log(token);
        setToken(token); 
      }
    };
    fetchToken();
  }, []);
  
  


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
  const handleDeleteClick = (id) => {
    const userConfirmed = window.confirm(
      'Are you sure you want to delete this article?'
    );
    if (userConfirmed) {
      deleteArticle(id);
    }
  };

  //delete news from database
  const deleteArticle = async (id) => {
    console.log('deleted article id:', id);
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
      const result = await responseDelete.json();
      console.log('Article deletion result:', result);
    //   fetchData()
      
      console.log('Response article deleted:', responseDelete);
      if (result.status === 200) {
        console.log('Article marked as deleted successfully');
        fetchData()
    
        console.log('Showing success toast');
      } else {
        console.log('Error deleting article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Error deleting article');
    }
  };

  const navigateToKnowledgedetails = (item) => {
    console.log('navigate to page:', item.id);
    let itemId = item.id;
    // navigate(`/newsdetails/${item.news.id}`, { state: { item } });
    navigate(`/knowledgedetails/${item.id}/?token=${token}`, { state: { itemId } });

  };

  return (
    <div className="page-wrapper table-responsive">
      <div className='header-box d-flex justify-content-between' style={{ height: "5em" }}>
            <h6 className="mb-4">
                <b>Knowledge Base:</b>
            </h6>
            <button className='new-article-button' onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faPlus} className='mr-1'/>
                New Article
            </button>
      </div>
      <table className="table ">
        <thead>
          <tr>
            <th title='Title'>
              <FontAwesomeIcon icon={faT} />
            </th>
            <th title='Description'>
              <FontAwesomeIcon icon={faAlignJustify} />
            </th>
            <th title='Files'>
              <FontAwesomeIcon icon={faFile} />
            </th>
            <th title='Tags'>
              <FontAwesomeIcon icon={faTag} />
            </th>
            <th title='Created At'>
              <FontAwesomeIcon icon={faClock} />
            </th>
            <th title='Updated At'>
              <FontAwesomeIcon icon={faPenToSquare} />
            </th>
            <th title='Selected Countries'>
              <FontAwesomeIcon icon={faGlobeAmericas} />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {knowledgeBase && knowledgeBase.length > 0 ? (
            knowledgeBase
              .slice()
              .sort((a, b) => {
                // Sorting by created_at in descending order
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return dateB - dateA;
              })
              .map((item) => (
                <tr
                  key={item.id}
                  className="tr-tbody"
                  onClick={() => navigateToKnowledgedetails(item)}
                >
                  <td title={item.title}>{item.title && item.title}</td>
                  <td title={item.description}>
                    {item.description && item.description.length > 40
                      ? item.description.substring(0, 40) + '...'
                      : item.description}
                  </td>
                  <td>
                    {item.files && item.files.map(file => (
                        <p><i>{file.name}</i></p>
                    ))}
                  </td>
                  <td>
                    {item.tags && item.tags.map(tag => (
                        tag
                    ))}
                  </td>
                  <td>
                    {item.created_at && item.created_at &&
                      item.created_at.substring(0, 10)}
                  </td>
                  <td>
                    {item.updated_at && item.updated_at &&
                      item.updated_at.substring(0, 10)}
                  </td>
                  <td>
                    {Array.isArray(item.langs)
                      ? item.langs.join(', ')
                      : typeof item.langs === 'string'
                        ? item.langs
                        : ''}
                  </td>
                  <td>
                    <FontAwesomeIcon
                      className="delete-table"
                      icon={faTrashAlt}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(item.id);
                      }}
                    />
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="2">There are no published articles in Knowlege Base.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* <Newpostbutton onClick={handleOpenModal} /> */}
      <Newpostknowledgebasemodal
        show={showModal}
        handleClose={handleCloseModal}
        refreshData={fetchData}
        tags={tags}
        
      />

        <ToastContainer 
				position="bottom-left"
				autoClose={3000}
				hideProgressBar={false}
				// transition={Slide}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="colored"
				style={{ fontSize: '15px', height: "3em", width: "18em", margin: "0 0 3em 0" }}
		/>

    </div>
  );
};

export default Knowledgebase;
