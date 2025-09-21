export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface DashboardStats {
  totalVideos: number
  activeUsers: number
  hoursAnalyzed: number
  quizzesCreated: number
}

export interface RecentActivity {
  id: string
  type: 'upload' | 'quiz' | 'analysis' | 'completion'
  description: string
  timestamp: string
  userId?: string
  videoId?: string
}
