// fetchTags.js

import axios from 'axios';

const fetchTags = async () => {
  try {
    const response = await axios.get('http://localhost:3003/api/articles/tags');
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
