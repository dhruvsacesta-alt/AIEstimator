import axios from 'axios';

const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    if (!url.endsWith('/')) url += '/';
    if (!url.includes('/api/')) url += 'api/';
    return url;
};

const api = axios.create({
    baseURL: getBaseURL(),
});

/**
 * Submits the assessment data.
 * @param {FormData} data - The multipart form data prepared by the caller.
 */
export const submitAssessment = async (data) => {
    const response = await api.post('leads/assessments', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export default api;
