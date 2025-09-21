import axios from 'axios'
import { useAuthService } from './auth'

const API_BASE_URL = (import.meta.env as any).VITE_API_BASE_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use(async (config) => {
  const { getToken } = useAuthService()
  const token = await getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
}

export const videosAPI = {
  getAll: (params?: any) => api.get('/videos', { params }),
  getById: (id: string) => api.get(`/videos/${id}`),
  upload: (formData: FormData) => api.post('/videos', formData),
  uploadFromUrl: (data: { url: string; metadata: any }) => api.post('/videos/import-url', data),
  delete: (id: string) => api.delete(`/videos/${id}`),
  bulkImport: (data: any) => api.post('/videos/bulk-import', data),
}

export const importAPI = {
  youtube: (data: { queries: string[]; filters?: any; tags: string[]; maxResults?: number }) =>
    api.post('/import/youtube', data),
  getJobStatus: (jobId: string) => api.get(`/import/${jobId}/status`),
  urlImport: (data: { url: string; metadata: any }) => api.post('/import/url', data)
}

export const analyticsAPI = {
  getVideoStats: (videoId: string) => api.get(`/analytics/videos/${videoId}`),
  getUserProgress: () => api.get('/analytics/progress'),
}

export default api