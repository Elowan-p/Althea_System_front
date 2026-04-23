import apiClient from "./client";

export const userAuthService = {
    login: async (email, password) => apiClient.post('/auth/login', { email, password }),
    register: async (email, password) =>  apiClient.post('/auth/register', { email, password }),
    logout: async () => {
        localStorage.removeItem('token');
        apiClient.post('/auth/logout');
    },
    getInfo: async (id) => apiClient.get(`/auth/info/${id}`),
    // @TODO Rajouter les ofnctions que tu veux ici EN RAPPORT AVEC LES USERS SEULEMENT FDPPP 
}