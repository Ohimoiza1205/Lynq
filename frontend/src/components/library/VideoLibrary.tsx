import { useState, useEffect } from 'react'
import { Search, Filter, Grid, List, Upload, Video as VideoIcon } from 'lucide-react'
import VideoCard from './VideoCard'
import VideoList from './VideoList'
import FilterPanel from './FilterPanel'
import BulkActions from './BulkActions'
import UploadModal from './UploadModal'
import { Video } from '../../types/video'
import { videosAPI } from '../../services/api'

const VideoLibrary = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('uploadDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filters state
  const [filters, setFilters] = useState({
    specialty: '',
    difficulty: '',
    status: '',
    duration: { min: 0, max: 240 },
    tags: [] as string[],
    uploadDate: { start: '', end: '' }
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    applyFiltersAndSearch()
  }, [videos, searchQuery, filters, sortBy, sortOrder])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await videosAPI.getAll()
      setVideos(response.data)
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      // Mock data for demo
      setVideos([
        {
          id: '1',
          title: 'Advanced Cardiac Surgery - Mitral Valve Repair',
          description: 'Comprehensive surgical procedure demonstrating minimally invasive mitral valve repair techniques',
          duration: 3847,
          url: '/videos/cardiac-surgery-demo.mp4',
          thumbnailUrl: '/thumbnails/cardiac-surgery.jpg',
          status: 'ready',
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-01-15T11:45:00Z',
          metadata: {
            procedure: 'Cardiac Surgery',
            specialty: 'Cardiothoracic Surgery',
            difficulty: 'advanced',
            tags: ['mitral valve', 'minimally invasive', 'cardiac repair']
          }
        },
        {
          id: '2',
          title: 'Laparoscopic Appendectomy Procedure',
          description: 'Step-by-step laparoscopic appendectomy with detailed anatomical guidance',
          duration: 1920,
          url: '/videos/laparoscopic-appendectomy.mp4',
          thumbnailUrl: '/thumbnails/appendectomy.jpg',
          status: 'processing',
          createdAt: '2025-01-14T14:20:00Z',
          updatedAt: '2025-01-14T14:20:00Z',
          metadata: {
            procedure: 'Appendectomy',
            specialty: 'General Surgery',
            difficulty: 'intermediate',
            tags: ['laparoscopic', 'appendix', 'minimally invasive']
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...videos]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        video.metadata.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply filters
    if (filters.specialty) {
      filtered = filtered.filter(video => video.metadata.specialty === filters.specialty)
    }
    if (filters.difficulty) {
      filtered = filtered.filter(video => video.metadata.difficulty === filters.difficulty)
    }
    if (filters.status) {
      filtered = filtered.filter(video => video.status === filters.status)
    }
    if (filters.duration.min > 0 || filters.duration.max < 240) {
      filtered = filtered.filter(video => 
        video.duration >= filters.duration.min * 60 && 
        video.duration <= filters.duration.max * 60
      )
    }
    if (filters.tags.length > 0) {
      filtered = filtered.filter(video => 
        filters.tags.some(tag => video.metadata.tags.includes(tag))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'duration':
          aValue = a.duration
          bValue = b.duration
          break
        case 'uploadDate':
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredVideos(filtered)
  }

  const handleVideoSelect = (videoId: string, selected: boolean) => {
    const newSelected = new Set(selectedVideos)
    if (selected) {
      newSelected.add(videoId)
    } else {
      newSelected.delete(videoId)
    }
    setSelectedVideos(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedVideos.size === filteredVideos.length) {
      setSelectedVideos(new Set())
    } else {
      setSelectedVideos(new Set(filteredVideos.map(v => v.id)))
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all([...selectedVideos].map(id => videosAPI.delete(id)))
      await fetchVideos()
      setSelectedVideos(new Set())
    } catch (error) {
      console.error('Failed to delete videos:', error)
    }
  }

  const stats = {
    total: videos.length,
    ready: videos.filter(v => v.status === 'ready').length,
    processing: videos.filter(v => v.status === 'processing').length,
    selected: selectedVideos.size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Video Library</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and analyze your medical training videos ({stats.total} total, {stats.ready} ready)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Video</span>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              showFilters 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos, procedures, specialties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="uploadDate">Upload Date</option>
            <option value="title">Title</option>
            <option value="duration">Duration</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() => setFilters({
            specialty: '',
            difficulty: '',
            status: '',
            duration: { min: 0, max: 240 },
            tags: [],
            uploadDate: { start: '', end: '' }
          })}
        />
      )}

      {/* Bulk Actions */}
      {selectedVideos.size > 0 && (
        <BulkActions
          selectedCount={selectedVideos.size}
          onSelectAll={handleSelectAll}
          onDelete={handleBulkDelete}
          onClearSelection={() => setSelectedVideos(new Set())}
        />
      )}

      {/* Videos Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <VideoIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No videos found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))
              ? 'Try adjusting your search or filters'
              : 'Upload your first medical training video to get started'
            }
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Upload Video
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredVideos.map((video) => (
            viewMode === 'grid' ? (
              <VideoCard
                key={video.id}
                video={video}
                selected={selectedVideos.has(video.id)}
                onSelect={(selected) => handleVideoSelect(video.id, selected)}
              />
            ) : (
              <VideoList
                key={video.id}
                video={video}
                selected={selectedVideos.has(video.id)}
                onSelect={(selected) => handleVideoSelect(video.id, selected)}
              />
            )
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploadComplete={fetchVideos}
        />
      )}
    </div>
  )
}

export default VideoLibrary
