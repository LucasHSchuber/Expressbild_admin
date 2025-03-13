// src/pages/NewsDetail.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowDownWideShort, faCheck, faXmark, faThumbsUp, faThumbsDown, faCircleExclamation, faQuestion } from '@fortawesome/free-solid-svg-icons';

import '../assets/css/main_recentshot.css';
import '../assets/css/global.css';

import useFetchToken from "../assets/js/fetchToken.js"

import ENV from "../../env.js"
console.log('ENV', ENV);
console.log('ENV.isProduction', ENV.isProduction);


const Recentshot = () => {
  //define states
  const [users, setUsers] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('SE');
  const [allActivities, setAllActivites] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [allActivitiesByUser, setAllActivitiesByUser] = useState([]);
  const [searchString, setSearchString] = useState([]);
  const [dataForControlSheet, setDataForControlSheet] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedInnerRow, setExpandedInnerRow] = useState(null);
  const [activityUuid, setActivityUuid] = useState("");

  const [isAscendingPhotographer, setIsAscendingPhotographer] = useState(null);
  const [isAscendingDate, setIsAscendingDate] = useState(null);

  const { token, isValid } = useFetchToken();
  console.log('token', token);
  console.log('isValid', isValid);




  const fetchAllData = () => {
    //fetching all users
    const fetchUsers = async () => {
      try {
        const responseUsers = await axios.get(`${ENV.isProduction ? "https://backend.expressbild.org" : "/api"}/index.php/rest/photographer_portal/users`, {
            headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Fetched users from "/users":', responseUsers.data.result);
        setUsers(responseUsers.data.result);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    // const fetchProjects = async () => {
    //   try {
    //     let response = await axios.get(`${ENV.isProduction ? "https://backend.expressbild.org" : "/api"}/index.php/rest/teamleader/projects`, {
    //         headers: {
    //           Authorization: `Admin ${token}`,
    //           'Content-Type': 'application/json',
    //         },
    //       }
    //     );
    //     console.log('response from "/projects"', response);
    //     if (response && response.data) {
    //       console.log('Fetched projects:', response.data.result);
    //       return response.data; 
    //     } else {
    //       console.error('Empty response received');
    //       return null;
    //     }
    //   } catch (error) {
    //     console.error('Error fetching projects:', error.message);
    //   }
    // };
    const fetchActivities = async () => {
      try {
        let responseActivities = await axios.get(`${ENV.isProduction ? "https://backend.expressbild.org" : "/api"}/index.php/rest/photographer_portal/activities`, {
            headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log("responseActivities from /activities", responseActivities)
        if (responseActivities && responseActivities.data) {
          console.log('Fetched activites:', responseActivities.data.result);
          setAllActivites(responseActivities.data.result);
          const latestActivities = getLatestActivities(responseActivities.data.result);

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
    // fetchProjects();
    fetchActivities();
  };
  useEffect(() => {
    if (isValid) {
      fetchAllData();
    }
  }, [token, isValid]);



  // Method to fetch qms-data
  const fetchQmsData = async (activityUuids, allActivitiesByUser) => {
    if (!activityUuids || activityUuids.length === 0) {
      console.warn("Activity UUIDs are missing. Cannot fetch qms-data.");
      return;
    }
    const uuidQueryString = activityUuids.join(",");

    try {
      const response = await fetch(`${ENV.API_URL}api/qms/data?activity_uuids=${uuidQueryString}`, {
          method: 'GET',
          headers: {
              Authorization: `Admin ${token}`,
              // 'Content-Type': 'application/json',
          },
      });

      const data = await response.json(); 
      console.log('Parsed json:', data);

      if (!response.ok) {
        console.error(`Error: Received status ${response.status}`);
        createFinalArray(null, allActivitiesByUser);
        return;
      }
      if (data.qmsData && data.qmsData.length > 0) {
        console.log('Successfully fetched qms-data from database:', data.qmsData);
        createFinalArray(data.qmsData, allActivitiesByUser)
      } else {
        console.log('Qms-data not found for activityUuid');
        createFinalArray(null, allActivitiesByUser);
      }
    } catch (error) {
      console.error('Error fetching qms-data:', error);
      createFinalArray(null, allActivitiesByUser);

    }
  }

  // create final array
  const createFinalArray = (qmsData, allActivitiesByUser) => {
    console.log('qmsData', qmsData);
    console.log('allActivitiesByUser', allActivitiesByUser);
  
    if (!qmsData || !Array.isArray(qmsData)) {
      allActivitiesByUser.forEach(activity => {
        if (activity.project) {
          activity.qmsData = null;
        }
      });
    } else {
      allActivitiesByUser.forEach(activity => {
        if (!activity.project) return;
  
        const projects = Array.isArray(activity.project) ? activity.project : [activity.project];
        const matchingQmsData = qmsData.find(qms => 
          projects.some(proj => qms.activity_uuid === proj.activity_uuid)
        );
        activity.qmsData = matchingQmsData || null;
      });
    }
  
    console.log('Updated allActivitiesByUser:', allActivitiesByUser);
    setAllActivitiesByUser(allActivitiesByUser);
  };
  


  



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




  //if search is entered
    const fetchSearchActivities = async () => {
      try {
        let responseActivities = await axios.get(`${ENV.isProduction ? "https://backend.expressbild.org" : "/api"}/index.php/rest/photographer_portal/activities`,{
            headers: {
              Authorization: `Admin ${token}`,
              'Content-Type': 'application/json',
            },
        });
        console.log('responseActivities from "activities"', responseActivities);
        if (responseActivities && responseActivities.data) {
          console.log('Fetched activities:', responseActivities.data.result);

          let latestActivities = getLatestActivities(responseActivities.data.result);

          console.log('latestActivities:', latestActivities);
          if (searchString !== '') {
            latestActivities = latestActivities.filter((searchData) => {
              const fullName = `${searchData.photographer.firstname.toLowerCase()} ${searchData.photographer.surname.toLowerCase()}`;
              const username = searchData.photographer.username.toLowerCase();
              // const activity = searchData.activity.project_name.toLowerCase();
              return (
                (fullName.includes(searchString) ||
                  username.includes(searchString)) &&
                searchData.photographer.lang === selectedCountry
              );
            });
          } else {
            latestActivities = latestActivities.filter(
              (searchData) => searchData.photographer.lang === selectedCountry
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

    useEffect(() => {
        if (isValid) {
          fetchSearchActivities();
        }
    }, [searchString, selectedCountry]);


  //handleChangeCountry
  const handleChangeCountry = (e) => {
      console.log(e.target.value);
      setSelectedCountry(e.target.value);
  };

  //order by photographer
  const orderByPhotographer = () => {
      const sortedActivities = [...latestActivities].sort((a, b) => {
        const nameA = `${a.photographer.firstname.toLowerCase()} ${a.photographer.surname.toLowerCase()}`;
        const nameB = `${b.photographer.firstname.toLowerCase()} ${b.photographer.surname.toLowerCase()}`;
        if (nameA < nameB) return isAscendingPhotographer ? -1 : 1;
        if (nameA > nameB) return isAscendingPhotographer ? 1 : -1;
        return 0;
      });
      setIsAscendingPhotographer(!isAscendingPhotographer);
      setLatestActivities(sortedActivities);
  };


  // //order by date
  const orderByDate = () => {
      const sortedActivities = [...latestActivities].sort((a, b) => {
        const dateA = `${a.activity.activity_start}`;
        const dateB = `${b.activity.activity_start}`;
        if (dateA < dateB) return isAscendingDate ? -1 : 1;
        if (dateA > dateB) return isAscendingDate ? 1 : -1;
        return 0;
      });
      setIsAscendingDate(!isAscendingDate);
      setLatestActivities(sortedActivities);
  };

  //handle table row click
  const handleRowClick = (photographerId, activity_id) => {
      setExpandedRow(expandedRow === photographerId ? null : photographerId);
      const _allActivitiesByUser = allActivities.filter((r) => r.photographer.id === photographerId);
      console.log('All activities by user:', _allActivitiesByUser);
      const uuidArray = createUuidArray(_allActivitiesByUser);
      fetchQmsData(uuidArray, _allActivitiesByUser)
      setDataForControlSheet('');
      setExpandedInnerRow('');
      setActivityUuid(activity_id);
  };

  const createUuidArray = (_allActivitiesByUser) => {
      const projects =_allActivitiesByUser.map(item => item.project)
      const uuids = projects.flatMap(item => item.activity_uuid)
      return uuids;
  }

  //handle inner table inner row click
  const handleInnerRowClick = (activity_id) => {
      console.log('activity_id', activity_id);
      setExpandedInnerRow(expandedInnerRow === activity_id ? null : activity_id);
  };

  const handleChangeControlSheet = (e) => {
      console.log(e);
      setDataForControlSheet(e);
  };


  const handleSearchChange = (e) => {
      console.log(e.target.value);
      setSearchString(e.target.value.toLowerCase());
  };




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
            style={{ padding: '10px 20px',backgroundColor: '#007bff',color: '#fff',border: 'none',borderRadius: '5px', cursor: 'pointer'}}
        >
            Refresh Page
        </button>
    </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className='header-box'>
        <h6 className="header-box mb-5">
          <b>Recent shot:</b>
        </h6>
       </div>
      {/* select box */}
      <div className="mb-2">
        <label htmlFor="country" style={{ fontSize: '1.2em' }}>Country:</label>
        <select
          id="country"
          className="select-box"
          defaultValue={selectedCountry}
          onChange={handleChangeCountry}
        >
          <option value="SE">Sweden</option>
          <option value="NO">Norway</option>
          <option value="DK">Denmark</option>
          <option value="DE">Germany</option>
          <option value="FI">Finland</option>
        </select>
      </div>

      <hr></hr>

      {/* search bar */}
      <div>
        <input
          className="search-bar mb-3 mt-4"
          placeholder="Search for photographer or email.."
          value={searchString}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* main table */}
      <table className="table ">
        <thead>
          <tr>
            <th>
              Photographer
              <FontAwesomeIcon
                title='Sort on Photographer'
                className="sort-button"
                icon={faArrowDownWideShort}
                onClick={() => orderByPhotographer()}
              />
            </th>
            <th>Email</th>
            <th>
              Last job
              <FontAwesomeIcon
                title='Sort Last Job'
                className="sort-button"
                icon={faArrowDownWideShort}
                onClick={() => orderByDate()}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {latestActivities && latestActivities.length > 0 ? (
            latestActivities.map((item, index) => (
              <React.Fragment key={`${item.photographer.id + index}-photographer-details`}>
                <tr
                  className={`outer-tr ${item.photographer.id === expandedRow ? 'selected-tr' : ''}`}
                  onClick={() => handleRowClick(item.photographer.id, item.project.activity_uuid)}
                >
                  <td>
                    {item.photographer.firstname} {item.photographer.surname}
                  </td>
                  <td>{item.photographer.username}</td>
                  <td>{item.activity.activity_start.substring(0, 10)}</td>
                </tr>
                {/* opening when clicking on a tr in table */}
                {expandedRow === item.photographer.id && (
                  <tr key={`${item.photographer.id + index}`}>
                    <td colSpan="3" className="expanded-inner-table">
                      <div className="flex-container">
                        <div className="flex-item left-inner-table">
                          <table className="control-sheet-table">
                            <thead>
                              <tr>
                                <th>Activity</th>
                                <th>Date</th>
                                <th title='Portrait/Group/Admin'>QMS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allActivitiesByUser.length > 0 ? (
                                allActivitiesByUser
                                  .sort((a, b) => new Date(b.activity.activity_start) - new Date(a.activity.activity_start))
                                  .map((a, index) => (
                                  <tr
                                    key={`${a.activity.project_uuid + a.project.activity_uuid}-data+${index}`}
                                    className={`expanded-inner-tr ${a.project.activity_uuid === expandedInnerRow ? "selected-inner-tr" : "" }`}
                                    onClick={() => {handleChangeControlSheet(a); handleInnerRowClick(a.project.activity_uuid)}}
                                  >
                                    <td title={a.activity.project_name + " " + a.activity.activity_name} >
                                      {a.activity.project_name.length > 30 ? a.activity.project_name.substring(0, 30) + ".." : a.activity.project_name}{' '}
                                      ({a.activity.activity_name})
                                    </td>
                                    <td>
                                      {a.activity.activity_start.substring(0, 10)}
                                    </td>
                                    <td className='d-flex'>
                                        {a.qmsData === null ? "?"
                                          : a.qmsData.portraits_statuses.includes("Job OK") ?  <FontAwesomeIcon className='okqmsdata-icon' icon={faThumbsUp}/> 
                                          : a.qmsData.portraits_statuses.includes("Major Error") ? <FontAwesomeIcon className='errorqmsdata-icon' icon={faThumbsDown}/>  
                                          : <FontAwesomeIcon className='warningqmsdata-icon' icon={faCircleExclamation}/>}
                                        |
                                        {a.qmsData === null ? "?" 
                                          : a.qmsData.grouppicture_statuses.includes("Job OK") ? <FontAwesomeIcon className='okqmsdata-icon' icon={faThumbsUp}/>  
                                          : a.qmsData.grouppicture_statuses.includes("Major Error") ? <FontAwesomeIcon className='errorqmsdata-icon' icon={faThumbsDown}/>
                                          : <FontAwesomeIcon className='warningqmsdata-icon' icon={faCircleExclamation}/>}
                                        | 
                                        {a.qmsData === null ? "?"
                                          : a.qmsData?.admin_statuses === null || a.qmsData?.admin_statuses === "" ? "?"
                                          : a.qmsData?.admin_statuses?.includes("Job OK") ? <FontAwesomeIcon className='okqmsdata-icon' icon={faThumbsUp}/>  
                                          : a.qmsData?.admin_statuses?.includes("Major Error") ? <FontAwesomeIcon className='errorqmsdata-icon' icon={faThumbsDown}/>
                                          : <FontAwesomeIcon className='warningqmsdata-icon' icon={faCircleExclamation}/>}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="2">No activities found.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* <h6>Control sheet: </h6> */}
                        {dataForControlSheet && (
                          <div className={`flex-item right-inner-table ${dataForControlSheet ? 'show-right-inner-table' : ''}`}>
                            <div>
                              <tr key={`${dataForControlSheet?.photographer?.id}-details`} className='control-sheet-box'>
                                <td colSpan="4" className="inner-table-td">
                                  <div style={{ paddingTop: '1.5em' }}>
                                  <h5 className='mb-3'><b>Control Sheet</b></h5>
                                    <div className="mb-4  control-sheet-headers">
                                      <h6>
                                        <strong>Activity name: </strong>
                                        {dataForControlSheet?.activity ?.project_name}
                                        {dataForControlSheet?.activity ?.activity_name}
                                      </h6>
                                      <h6>
                                        <strong>Photographer: </strong>{dataForControlSheet?.photographer?.firstname}
                                        {dataForControlSheet?.photographer ?.surname}
                                      </h6>
                                      <h6>
                                        <strong>Activity date: </strong>
                                        {dataForControlSheet?.activity?.activity_start?.substring(0,10)}
                                      </h6>
                                      <h6>
                                        <strong>Check point: </strong>
                                        <a
                                          href={`https://${dataForControlSheet?.photographer ?.lang === 'SE'
                                              ? 'shop.expressbild.se'
                                              : dataForControlSheet
                                                    ?.photographer?.lang ===
                                                  'FI'
                                                ? 'shop.expresskuva.fi'
                                                : dataForControlSheet
                                                      ?.photographer?.lang ===
                                                    'DK'
                                                  ? 'shop.billedexpressen.dk'
                                                  : dataForControlSheet
                                                        ?.photographer?.lang ===
                                                      'NO'
                                                    ? 'shop.fotoexpressen.no'
                                                    : dataForControlSheet
                                                          ?.photographer
                                                          ?.lang === 'DE'
                                                      ? 'shop.bildexpressen.de'
                                                      : ''
                                          }/admin/prophoto/jobs/report.php?jobid=${dataForControlSheet?.activity?.project_uuid}&activity=#/tab/8?extra=0&extra2=1`}
                                          target="_blank"
                                          style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer',
                                          }}
                                        > Click here to navigate to checkpoint</a>
                                      </h6>
                                    </div>
                                      <table className="control-sheet-table">
                                        <thead>
                                          <tr>
                                            <th>Team/class name</th>
                                            <th>Portrait</th>
                                            <th>Group</th>
                                            <th>Calendar</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {dataForControlSheet?.teams?.map(
                                            (team) => (
                                              <tr key={team.id}>
                                                <td>{team.team}</td>
                                                <td>
                                                  {team.took_portrait === true ? (<FontAwesomeIcon icon={faCheck} style={{ color: 'green' }}/>
                                                  ) : (
                                                    <FontAwesomeIcon icon={faXmark} style={{ color: 'red' }}/>
                                                  )}
                                                </td>
                                                <td>
                                                  {team.took_group === true ? (<FontAwesomeIcon icon={faCheck} style={{ color: 'green' }}/>
                                                  ) : (
                                                    <FontAwesomeIcon icon={faXmark} style={{ color: 'red' }}/>
                                                  )}
                                                </td>
                                                <td>
                                                {team.num_calendars > 0 ? (
                                                    <FontAwesomeIcon icon={faCheck} style={{ color: 'green' }}/>
                                                  ) : (
                                                    <FontAwesomeIcon icon={faXmark} style={{ color: 'red' }}/>
                                                  )}
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                      <hr></hr>
                                      <div className="mt-3 mb-5 control-sheet-headers">
                                        <div className="mb-2">
                                          <h6>
                                            <strong>Anomaly report:</strong>{' '}
                                          </h6>
                                          <h6>
                                            {dataForControlSheet?.reports.length > 0 ? ( dataForControlSheet?.reports[0] ?.text
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
                                            {dataForControlSheet?.project ?.merged_teams ? ( dataForControlSheet?.project ?.merged_teams
                                            ) : (
                                              <em>Empty</em>
                                            )}
                                          </h6>
                                        </div>
                                      </div>
                                      <hr></hr>
                                      {/* QMS DATA */}
                                      <div className='mt-4'>
                                          <h5 className='mb-3'><b>QMS Retoucher</b></h5>
                                          <div className='mb-4'>
                                              <h6><b>Portrait Statuses:</b> {dataForControlSheet?.qmsData?.portraits_statuses}</h6>
                                              <h6><b>Portrait Comment:</b> <em>{dataForControlSheet?.qmsData?.portraits_comments}</em></h6>
                                              <h6><b>Group Statuses:</b> {dataForControlSheet?.qmsData?.grouppicture_statuses}</h6>
                                              <h6><b>Group Comment:</b> <em>{dataForControlSheet?.qmsData?.grouppicture_comments}</em></h6>
                                          </div>

                                          <h5 className='mb-3'><b>QMS admin</b></h5>
                                          <div className='mb-4'>
                                              <h6><b>Admin Statuses:</b> {dataForControlSheet?.qmsData?.admin_statuses}</h6>
                                              <h6><b>Admin Comment:</b> <em>{dataForControlSheet?.qmsData?.admin_comments}</em></h6>
                                          </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </div>
                          </div>
                        )}

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="3">
                Could not find any photographers in choosen country.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Recentshot;
