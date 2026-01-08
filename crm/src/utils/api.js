import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

// Interceptor for JWT
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('crm_user'));
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export const loginUser = async (email, password) => {
    const res = await api.post('auth/login', { email, password });
    return res.data;
};

export const getLeads = async () => {
    const res = await api.get('leads');
    return res.data;
};

export const createManualLead = async (leadData) => {
    const res = await api.post('leads', leadData);
    return res.data;
};

export const getLeadDetail = async (id) => {
    const res = await api.get(`leads/${id}`);
    return res.data;
};

export const assignLead = async (leadId, userId) => {
    const res = await api.post(`leads/${leadId}/assign`, { userId });
    return res.data;
};

export const updateLeadStatus = async (leadId, status, reason) => {
    const res = await api.patch(`leads/${leadId}/status`, { status, reason });
    return res.data;
};

export const updateInventory = async (leadId, items) => {
    const res = await api.patch(`leads/${leadId}/items`, { items });
    return res.data;
};

export const finalizePrice = async (leadId, price, reason) => {
    const res = await api.patch(`leads/${leadId}/price`, { price, reason });
    return res.data;
};

export const getUsers = async () => {
    const res = await api.get('users');
    return res.data;
};

export const createSalesUser = async (userData) => {
    const res = await api.post('users/sales', userData);
    return res.data;
};

export const addLeadNote = async (leadId, note) => {
    const res = await api.post(`leads/${leadId}/notes`, { note });
    return res.data;
};

export const addLeadFollowUp = async (leadId, followUpData) => {
    const res = await api.post(`leads/${leadId}/follow-ups`, followUpData);
    return res.data;
};

export const completeLeadFollowUp = async (leadId, followUpId) => {
    const res = await api.patch(`leads/${leadId}/follow-ups/${followUpId}/complete`);
    return res.data;
};

export default api;
