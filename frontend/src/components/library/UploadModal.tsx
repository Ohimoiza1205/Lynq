// Replace your frontend UploadModal component
import { useState } from 'react'
import { X, Upload, Link, Youtube, Plus } from 'lucide-react'
import api from '../../services/api'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: () => void
}

const UploadModal = ({ isOpen, onClose, onUploadComplete }: UploadModalProps) => {
  const [activeTab, setActiveTab] = useState<'files' | 'url' | 'youtube'>('youtube')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // YouTube Import State
  const [queries, setQueries] = useState(['surgery'])
  const [maxResults, setMaxResults] = useState(3)
  const [tags, setTags] = useState('medical, surgical, training')
  const [description, setDescription] = useState('')

  // URL Import State
  const [videoUrl, setVideoUrl] = useState('')

  if (!isOpen) return null

  const handleYouTubeImport = async () => {
    if (queries.length === 0 || queries[0].trim() === '') {
      setError('At least one search query is required')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await api.post('/api/import/youtube', {
        queries: queries.filter(q => q.trim() !== ''),
        maxResults,
        tags: tags.split(',').map(t => t.trim()).filter(t => t !== '')
      })

      setSuccess(`Successfully imported ${response.data.videos?.length || 0} videos`)
      setTimeout(() => {
        onUploadComplete?.()
        onClose()
      }, 2000)

    } catch (err: any) {
      console.error('YouTube import error:', err)
      setError(err.response?.data?.error || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUrlImport = async () => {
    if (!videoUrl.trim()) {
      setError('Video URL is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/api/videos/import-url', {
        url: videoUrl.trim(),
        metadata: {
          tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
          description: description.trim()
        }
      })

      setSuccess('Video imported successfully')
      setTimeout(() => {
        onUploadComplete?.()
        onClose()
      }, 2000)

    } catch (err: any) {
      console.error('URL import error:', err)
      setError(err.response?.data?.error || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const addQuery = () => {
    setQueries([...queries, ''])
  }

  const updateQuery = (index: number, value: string) => {
    const newQueries = [...queries]
    newQueries[index] = value
    setQueries(newQueries)
  }

  const removeQuery = (index: number) => {
    if (queries.length > 1) {
      setQueries(queries.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Upload Video</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'youtube'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube Import</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'url'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Link className="w-4 h-4" />
              <span>From URL</span>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'files'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Files</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-500/30 rounded text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* YouTube Import Tab */}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Queries
                </label>
                {queries.map((query, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => updateQuery(index, e.target.value)}
                      placeholder="e.g., cardiac surgery, laparoscopic procedure"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    {queries.length > 1 && (
                      <button
                        onClick={() => removeQuery(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addQuery}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add another query</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Results per Query
                </label>
                <input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value) || 3)}
                  min="1"
                  max="10"
                  className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="medical, surgical, training"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* URL Import Tab */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supports direct video links and YouTube URLs
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="medical, surgical, training"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the procedure or learning objectives..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* File Upload Tab */}
          {activeTab === 'files' && (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">File upload coming soon</p>
              <p className="text-sm text-gray-500">Use URL or YouTube import for now</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          {activeTab === 'youtube' && (
            <button
              onClick={handleYouTubeImport}
              disabled={loading || queries[0]?.trim() === ''}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              {loading ? 'Importing...' : 'Import Videos'}
            </button>
          )}
          {activeTab === 'url' && (
            <button
              onClick={handleUrlImport}
              disabled={loading || !videoUrl.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              {loading ? 'Importing...' : 'Import Video'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadModal