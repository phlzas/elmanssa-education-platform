import { apiRequest } from "./client";

export const getAdminStats = () => apiRequest("/admin/stats");

export const getStudents = (page = 1) => apiRequest(`/admin/students?page=${page}&perPage=20`);
export const deleteStudent = (id: string) => apiRequest(`/admin/students/${id}`, { method: "DELETE" });

export const getTeachers = (page = 1) => apiRequest(`/admin/teachers?page=${page}&perPage=20`);
export const deleteTeacher = (id: string) => apiRequest(`/admin/teachers/${id}`, { method: "DELETE" });

export const getAdminCourses = (page = 1) => apiRequest(`/admin/courses?page=${page}&perPage=20`);
export const deleteCourse = (id: string) => apiRequest(`/admin/courses/${id}`, { method: "DELETE" });

export const getAdminOrders = (page = 1) => apiRequest(`/admin/orders?page=${page}&perPage=20`);
export const deleteOrder = (id: string) => apiRequest(`/admin/orders/${id}`, { method: "DELETE" });

export const getAdminStreams = (page = 1) => apiRequest(`/admin/streams?page=${page}&perPage=20`);
export const deleteStream = (id: string | number) => apiRequest(`/admin/streams/${id}`, { method: "DELETE" });

export const createUser = (data: { name: string; email: string; password: string; role: string; phoneNumber?: string; bio?: string }) =>
  apiRequest("/admin/users", { method: "POST", body: JSON.stringify(data) });

export const toggleUserActive = (id: string) =>
  apiRequest(`/admin/users/${id}/toggle-active`, { method: "PATCH" });
