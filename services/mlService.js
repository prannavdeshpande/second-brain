const axios = require('axios');
const FormData = require('form-data');

const mlApi = axios.create({
  baseURL: process.env.ML_API_URL,
});

/**
 * Forwards a file or URL to the Python ML service for ingestion.
 * @param {object} data - The data to send. Can contain a file buffer or a URL.
 * @returns {Promise<object>} The response from the ML service.
 */
exports.ingestContent = async (data) => {
  try {
    const form = new FormData();

    if (data.url) {
      form.append('url', data.url);
    }

    if (data.file) {
      // data.file is a buffer from multer
      form.append('file', data.file.buffer, data.file.originalname);
    }
    
    const response = await mlApi.post('/upload/', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error calling ML ingestion service:', error.response ? error.response.data : error.message);
    throw new Error('Failed to process content with ML service');
  }
};

/**
 * Sends a search query to the Python ML service.
 * @param {string} query - The user's search query.
 * @returns {Promise<object>} The search result from the ML service.
 */
exports.queryModel = async (query) => {
  try {
    const form = new FormData();
    form.append('query', query);

    const response = await mlApi.post('/query/', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calling ML query service:', error.response ? error.response.data : error.message);
    throw new Error('Failed to get search result from ML service');
  }
};