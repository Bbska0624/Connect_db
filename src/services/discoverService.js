import { get, post } from './api.js';

// GET /api/discover/students
export const getStudents = () => get('/api/discover/students');

// POST /api/discover/connect/:id
export const connectStudent = (id) => post(`/api/discover/connect/${id}`);

// POST /api/discover/pass/:id
export const passStudent = (id) => post(`/api/discover/pass/${id}`);
