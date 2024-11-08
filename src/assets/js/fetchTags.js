// fetchTags.js

import axios from 'axios';

import ENV from '../../../env.js'; 
console.log('ENV', ENV);
console.log('ENV.API_URL', ENV.API_URL);

const fetchTags = async () => {
  try {
    const response = await axios.get(`${ENV.API_URL}api/articles/tags`);
    if (response.data && response.data.status === 200) {
      return response.data.tags;
    } else {
      console.error('Unexpected response structure:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching tags from db:', error);
    return [];
  }
};

export default fetchTags;
