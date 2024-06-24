// src/pages/NewsDetail.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDownWideShort,
  faCheck,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import '../assets/css/main_recentshot.css';

const Newsdetails = () => {
  //define states
  const [users, setUsers] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [latestActivities, setLatestActivities] = useState([]);
  const [searchString, setSearchString] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

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
        let response = await axios.get(
          'api/index.php/rest/teamleader/projects'
        );

        if (response && response.data) {
          console.log('Fetched projects:', response.data.result);
          return response.data; // Return the fetched data
        } else {
          console.error('Empty response received');
          return null;
        }
      } catch (error) {
        console.error('Error fetching projects:', error.message);
      }
    };
    const fetchActivities = async () => {
      const token = '666ab2a5be8ee1.66302861';
      try {
        let responseActivities = await axios.get(
          'api/index.php/rest/photographer_portal/activities',
          {
            headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (responseActivities && responseActivities.data) {
          console.log('Fetched activites:', responseActivities.data.result);

          const latestActivities = getLatestActivities(
            responseActivities.data.result
          );

          console.log('Latest activities:', latestActivities);
          setLatestActivities(latestActivities);

          return latestActivities;
        } else {
          console.error('Empty response received');
          return null;
        }
      } catch (error) {
        console.error('Error fetching activites:', error.message);
      }
    };

    fetchUsers();
    fetchProjects();
    fetchActivities();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getLatestActivities = (data) => {
    console.log(data);
    const latestActivities = {};

    data.forEach((activity) => {
      const photographerId = activity.photographer.id;
      const activityStart = new Date(activity.activity.activity_start);

      if (
        !latestActivities[photographerId] ||
        activityStart >
          new Date(latestActivities[photographerId].activity.activity_start)
      ) {
        latestActivities[photographerId] = activity;
      }
    });

    return Object.values(latestActivities);
  };

  const handleSearchChange = (e) => {
    console.log(e.target.value);
    setSearchString(e.target.value.toLowerCase());
  };

  //if search is entered
  useEffect(() => {
    const token = '666ab2a5be8ee1.66302861';

    const fetchSearchActivities = async () => {
      try {
        let responseActivities = await axios.get(
          'api/index.php/rest/photographer_portal/activities',
          {
            headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (responseActivities && responseActivities.data) {
          console.log('Fetched activities:', responseActivities.data.result);

          let latestActivities = getLatestActivities(
            responseActivities.data.result
          );

          console.log('Latest activities:', latestActivities);

          if (searchString !== '') {
            latestActivities = latestActivities.filter((activity) => {
              const fullName = `${activity.photographer.firstname.toLowerCase()} ${activity.photographer.surname.toLowerCase()}`;
              const username = activity.photographer.username.toLowerCase();
              return (
                (fullName.includes(searchString) ||
                  username.includes(searchString)) &&
                activity.photographer.lang === selectedCountry
              );
            });
          } else {
            latestActivities = latestActivities.filter(
              (activity) => activity.photographer.lang === selectedCountry
            );
          }

          setLatestActivities(latestActivities);
        } else {
          console.error('Empty response received');
          return null;
        }
      } catch (error) {
        console.error('Error fetching activities:', error.message);
      }
    };

    fetchSearchActivities();
  }, [searchString, selectedCountry]);

  //handleChangeCountry
  const handleChangeCountry = (e) => {
    console.log(e.target.value);
    setSelectedCountry(e.target.value);
  };
  //order by photographer
  const orderByPhotographer = () => {
    console.log('order by photographer');
  };
  //opening expanded inner tr
  const handleRowClick = (photographerId) => {
    setExpandedRow(expandedRow === photographerId ? null : photographerId);
  };

  return (
    <div className="page-wrapper">
      <h6 className="mb-4">
        <b>Recent shot:</b>
      </h6>

      <div className="mb-4">
        <label htmlFor="country" style={{ fontSize: "0.9em" }}>Select a country: </label>
        <select
          id="country"
          className='select-box'
          value={selectedCountry}
          onChange={handleChangeCountry}
        >
          <option selected value="SE">
            Sweden
          </option>
          <option value="NO">Norway</option>
          <option value="DK">Denmark</option>
          <option value="DE">Germany</option>
          <option value="FI">Finland</option>
        </select>
      </div>

      <div>
        <input
          className="search-bar mb-4"
          placeholder="Search for photographer or email"
          value={searchString}
          onChange={handleSearchChange}
        />
      </div>

      <table className="table ">
        <thead>
          <tr>
            <th>
              Photographer:{' '}
              <FontAwesomeIcon
                icon={faArrowDownWideShort}
                onClick={() => orderByPhotographer()}
              />
            </th>
            <th>Email:</th>
            <th>Activity name:</th>
            <th>Date:</th>
          </tr>
        </thead>
        <tbody>
          {latestActivities ? (
            latestActivities.map((item) => (
              <>
                <tr
                  key={item.photographer.id}
                  className={`tr-tbody ${item.photographer.id === expandedRow ? 'selected-tr' : ''}`}
                  onClick={() => handleRowClick(item.photographer.id)}
                >
                  <td>
                    {item.photographer.firstname} {item.photographer.surname}
                  </td>
                  <td>{item.photographer.username}</td>
                  <td>{item.activity.project_name}</td>
                  <td>{item.activity.activity_start.substring(0, 10)}</td>
                </tr>
                {expandedRow === item.photographer.id && (
                  <tr key={`${item.photographer.id}-details`}>
                    <td colSpan="4" className="expanded-inner-table">
                      <div>
                        <div className="mb-4 control-sheet-headers">
                          <h6>
                            <strong>Activity Name:</strong>{' '}
                            {item.activity.project_name}
                          </h6>
                          <h6>
                            <strong>Activity date:</strong>{' '}
                            {item &&
                              item.activity.activity_start.substring(0, 10)}
                          </h6>
                          <h6>
                            <strong>Photographer:</strong>{' '}
                            {item.photographer.firstname}{' '}
                            {item.photographer.surname}
                          </h6>
                        </div>
                        <table className="control-sheet-table">
                          <thead>
                            <tr>
                              <th>Team name:</th>
                              <th>Portrait:</th>
                              <th>Group:</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.teams.map((team) => (
                              <tr key={team.id}>
                                <td>{team.team}</td>
                                <td>
                                  {team.took_portrait === true ? (
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      style={{ color: 'green' }}
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faXmark}
                                      style={{ color: 'red' }}
                                    />
                                  )}
                                </td>
                                <td>
                                  {team.took_group === true ? (
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      style={{ color: 'green' }}
                                    />
                                  ) : (
                                    <FontAwesomeIcon
                                      icon={faXmark}
                                      style={{ color: 'red' }}
                                    />
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="mt-4 control-sheet-headers">
                          <div className="mb-2">
                            <h6>
                              <strong>Anomaly report:</strong>{' '}
                            </h6>
                            <h6>
                              {item.report ? (
                                item.reports[0].text
                              ) : (
                                <em>Empty</em>
                              )}
                            </h6>
                          </div>
                          <div>
                            <h6>
                              <strong>Merged teams:</strong>{' '}
                            </h6>
                            <h6>
                              {item.project.merged_teams ? (
                                item.project.merged_teams
                              ) : (
                                <em>Empty</em>
                              )}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))
          ) : (
            <tr>
              <td colSpan="4">No published activities.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Newsdetails;
