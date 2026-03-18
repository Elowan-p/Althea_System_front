import axios from 'axios';

const BASEURL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: BASEURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // @ TODO : change token location into cookies and not localStorage because it is peepee poopoo
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient; b