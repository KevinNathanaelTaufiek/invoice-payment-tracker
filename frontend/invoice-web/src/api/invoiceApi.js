import axiosInstance from './axiosInstance';

export const getSummary = () =>
  axiosInstance.get('/api/invoices/summary');

export const getAll = (params = {}) =>
  axiosInstance.get('/api/invoices', { params });

export const getById = (id) =>
  axiosInstance.get(`/api/invoices/${id}`);

export const create = (data) =>
  axiosInstance.post('/api/invoices', data);

export const update = (id, data) =>
  axiosInstance.put(`/api/invoices/${id}`, data);

export const remove = (id) =>
  axiosInstance.delete(`/api/invoices/${id}`);

export const updateStatus = (id, status) =>
  axiosInstance.patch(`/api/invoices/${id}/status`, { status });
