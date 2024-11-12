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
import '../assets/css/global.css';

import useFetchToken from "../assets/js/fetchToken.js"


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

  const [isAscendingPhotographer, setIsAscendingPhotographer] = useState(null);
  const [isAscendingDate, setIsAscendingDate] = useState(null);

  const { token, isValid } = useFetchToken();
  console.log('token', token);
  console.log('isValid', isValid);




  const fetchAllData = () => {
    //fetching all users
    const fetchUsers = async () => {
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
          setAllActivites(responseActivities.data.result);
          const latestActivities = getLatestActivities(
            responseActivities.data.result
          );

          // const latestActivitiesSE = latestActivities.filter(l => l.photographer.lang === "SE")

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
    if (isValid) {
      fetchAllData();
    }
  }, [token, isValid]);



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

    fetchSearchActivities();
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

  // //order by activity name
  // const orderByActivity = () => {
  //   const sortedActivities = [...latestActivities].sort((a, b) => {
  //     const aA = `${a.activity.project_name}`;
  //     const aB = `${b.activity.project_name}`;
  //     if (aA < aB) return isAscendingActivity ? -1 : 1;
  //     if (aA > aB) return isAscendingActivity ? 1 : -1;
  //     return 0;
  //   });
  //   setIsAscendingActivity(!isAscendingActivity);
  //   setLatestActivities(sortedActivities);
  // };

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
  const handleRowClick = (photographerId) => {
    setExpandedRow(expandedRow === photographerId ? null : photographerId);
    const _allActivitiesByUser = allActivities.filter(
      (r) => r.photographer.id === photographerId
    );
    console.log('All activities by user:', _allActivitiesByUser);
    setDataForControlSheet('');
    setExpandedInnerRow('');
    setAllActivitiesByUser(_allActivitiesByUser);
  };

  //handle inner table inner row click
  const handleInnerRowClick = (photographerId) => {
    setExpandedInnerRow(expandedInnerRow === photographerId ? null : photographerId);
  };

  const handleChangeControlSheet = (e) => {
    console.log(e);
    setDataForControlSheet(e);
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
            style={{ padding: '10px 20px',backgroundColor: '#007bff',color: '#fff',border: 'none',borderRadius: '5px',cursor: 'pointer'}}
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
        <label htmlFor="country" style={{ fontSize: '0.9em' }}>
          <b>Country:{' '}</b>
        </label>
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
              Photographer:{' '}
              <FontAwesomeIcon
                title='Sort on Photographer'
                className="sort-button"
                icon={faArrowDownWideShort}
                onClick={() => orderByPhotographer()}
              />
            </th>
            <th>Email:</th>
            <th>
              Last job:{' '}
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
            latestActivities.map((item) => (
              <React.Fragment key={item.photographer.id}>
                <tr
                  className={`outer-tr ${item.photographer.id === expandedRow ? 'selected-tr' : ''}`}
                  onClick={() => handleRowClick(item.photographer.id)}
                >
                  <td>
                    {item.photographer.firstname} {item.photographer.surname}
                  </td>
                  <td>{item.photographer.username}</td>
                  <td>{item.activity.activity_start.substring(0, 10)}</td>
                </tr>
                {/* opening when clicking on a tr in table */}
                {expandedRow === item.photographer.id && (
                  <tr key={`${item.photographer.id}-details`}>
                    <td colSpan="3" className="expanded-inner-table">
                      <div className="flex-container">
                        <div className="flex-item left-inner-table">
                          <h6 className='mt-3' style={{ fontSize: "1em" }}><b>All activites by {item.photographer.firstname} {item.photographer.surname}:</b> <br></br><em>Click on an activity to open control sheet</em></h6>
                          <table className="control-sheet-table">
                            <thead>
                              <tr>
                                <th>Activity:</th>
                                <th>Date:</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allActivitiesByUser.length > 0 ? (
                                allActivitiesByUser
                                  .sort((a, b) => new Date(b.activity.activity_start) - new Date(a.activity.activity_start))
                                  .map((a) => (
                                  <tr
                                    key={a.activity.project_uuid}
                                    className={`expanded-inner-tr ${a.activity.project_uuid === expandedInnerRow ? "selected-inner-tr" : "" }`}
                                    onClick={() => {handleChangeControlSheet(a); handleInnerRowClick(a.activity.project_uuid)}}
                                  >
                                    <td title={a.activity.project_name + " " + a.activity.activity_name} >
                                      {a.activity.project_name.length > 30 ? a.activity.project_name.substring(0, 30) + ".." : a.activity.project_name}{' '}
                                      ({a.activity.activity_name})
                                    </td>
                                    <td>
                                      {a.activity.activity_start.substring(0, 10)}
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
                          <div
                            className={`flex-item right-inner-table ${dataForControlSheet ? 'show-right-inner-table' : ''}`}
                          >
                            <div>
                              <tr
                                key={`${dataForControlSheet?.photographer?.id}-details`}
                                 className='control-sheet-box'
                              >
                                <td
                                  colSpan="4"
                                  className="inner-table-td"
                                >
                                  <div style={{ paddingTop: '1.5em' }}>
                                    <div className="mb-4  control-sheet-headers">
                                      <h6>
                                        <strong>Activity name:</strong>{' '}
                                        {
                                          dataForControlSheet?.activity
                                            ?.project_name
                                        }{" "} 
                                        {
                                          dataForControlSheet?.activity
                                            ?.activity_name
                                        }
                                      </h6>
                                      <h6>
                                        <strong>Photographer:</strong>{' '}
                                        {
                                          dataForControlSheet?.photographer
                                            ?.firstname
                                        }{' '}
                                        {
                                          dataForControlSheet?.photographer
                                            ?.surname
                                        }
                                      </h6>
                                      <h6>
                                        <strong>Activity date:</strong>{' '}
                                        {dataForControlSheet?.activity?.activity_start?.substring(
                                          0,
                                          10
                                        )}
                                      </h6>
                                      <h6>
                                        <strong>Check point:</strong>{' '}
                                        <a
                                          href={`https://${
                                            dataForControlSheet?.photographer
                                              ?.lang === 'SE'
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
                                          style={{
                                            textDecoration: 'underline',
                                            color: 'blue',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          Click here to navigate to checkpoint
                                        </a>{' '}
                                      </h6>
                                    </div>
                                    <table className="control-sheet-table">
                                      <thead>
                                        <tr>
                                          <th>Team/class name:</th>
                                          <th>Portrait:</th>
                                          <th>Group:</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {dataForControlSheet?.teams?.map(
                                          (team) => (
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
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                    <div className="mt-4 control-sheet-headers">
                                      <div className="mb-2">
                                        <h6>
                                          <strong>Anomaly report:</strong>{' '}
                                        </h6>
                                        <h6>
                                          {dataForControlSheet?.reports.length >
                                          0 ? (
                                            dataForControlSheet?.reports[0]
                                              ?.text
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
                                          {dataForControlSheet?.project
                                            ?.merged_teams ? (
                                            dataForControlSheet?.project
                                              ?.merged_teams
                                          ) : (
                                            <em>Empty</em>
                                          )}
                                        </h6>
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

{
  /* <tr key={`${item.photographer.id}-details`}>
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
        <h6>
          <strong>Check point:</strong>{' '}
          <a
            href={`https://${
              item.photographer.lang === 'SE'
                ? 'shop.expressbild.se'
                : item.photographer.lang === 'FI'
                  ? 'shop.expresskuva.fi'
                  : item.photographer.lang === 'DK'
                    ? 'shop.billedexpressen.dk'
                    : item.photographer.lang === 'NO'
                      ? 'shop.fotoexpressen.no'
                      : item.photographer.lang === 'DE'
                        ? 'shop.bildexpressen.de'
                        : ''
            }/admin/prophoto/jobs/report.php?jobid=${item.activity.project_uuid}&activity=#/tab/8?extra=0&extra2=1`}
            target="_blank"
            style={{
              textDecoration: 'underline',
              color: 'blue',
              cursor: 'pointer',
            }}
          >
            Click here to navigate checkpoint
          </a>{' '}
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
</tr> */
}

export default Recentshot;
