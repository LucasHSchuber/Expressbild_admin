// src/pages/NewsDetail.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Newsdetails = () => {
  //define states
  const [users, setUsers] = useState([]);

  const fetchAllData = () => {
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
    const fetchProjects = async () => {
        try {
          let response = await axios.get('api/index.php/rest/teamleader/projects');
      
          if (response && response.data) {
            console.log('Fetched projects:', response.data);
            return response.data; // Return the fetched data
          } else {
            console.error('Empty response received');
            return null;
          }
        } catch (error) {
            console.error('Error fetching projects:', error.message);
          }
          
        }


    fetchUsers();
    fetchProjects();
  };

  useEffect(() => {
    fetchAllData();
  }, []);


  return (
    <div className="page-wrapper">
     <h6 className="mb-4">
        <b>Recent shot:</b>
        <ul>
        {users && users.map((user) => (
            <>
                <li>{user.firstname}</li>
            </>
        ))}
        </ul>
      </h6>
    </div>
  );
};

export default Newsdetails;
