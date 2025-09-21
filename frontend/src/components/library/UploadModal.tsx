import { useState } from 'react'
import { X, Upload, FileVideo, AlertCircle, Youtube, Globe } from 'lucide-react'
import { videosAPI, importAPI } from '../../services/api'

interface UploadModalProps {
  onClose: () => void
  onUploadComplete: () => void
}

const UploadModal = ({ onClose, onUploadComplete }: UploadModalProps) => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url' | 'youtube'>('file')
  const [files, setFiles] = useState<File[]>([])
  const [url, setUrl] = useState('')
  const [youtubeQueries, setYoutubeQueries] = useState([''])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [importJobId, setImportJobId] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    specialty: '',
    difficulty: 'intermediate',
    tags: '',
    description: ''
  })

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter(file => 
        file.type.startsWith('video/') && file.size <= 2 * 1024 * 1024 * 1024
      )
      setFiles(prevFiles => [...prevFiles, ...validFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const addYoutubeQuery = () => {
    setYoutubeQueries([...youtubeQueries, ''])
  }

  const updateYoutubeQuery = (index: number, value: string) => {
    const updated = [...youtubeQueries]
    updated[index] = value
    setYoutubeQueries(updated)
  }

  const removeYoutubeQuery = (index: number) => {
    setYoutubeQueries(youtubeQueries.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    setUploading(true)
    
    try {
      if (uploadMethod === 'file') {
        for (const file of files) {
          const formData = new FormData()
          formData.append('video', file)
          formData.append('title', file.name.replace(/\.[^/.]+$/, ""))
          formData.append('metadata', JSON.stringify({
            ...metadata,
            tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          }))

          const fileId = file.name
          setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
          
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const currentProgress = prev[fileId] || 0
              if (currentProgress >= 90) {
                clearInterval(progressInterval)
                return prev
              }
              return { ...prev, [fileId]: currentProgress + 10 }
            })
          }, 200)

          await videosAPI.upload(formData)
          clearInterval(progressInterval)
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        }
      } else if (uploadMethod === 'url') {
        await videosAPI.uploadFromUrl({
          url,
          metadata: {
            ...metadata,
            tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          }
        })
      } else if (uploadMethod === 'youtube') {
        const response = await importAPI.youtube({
          queries: youtubeQueries.filter(q => q.trim()),
          tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          maxResults: 10
        })
        setImportJobId(response.data.jobId)
        
        // Poll for job completion
        const pollInterval = setInterval(async () => {
          try {
            const jobStatus = await importAPI.getJobStatus(response.data.jobId)
            if (jobStatus.data.status === 'completed' || jobStatus.data.status === 'failed') {
              clearInterval(pollInterval)
              onUploadComplete()
              onClose()
            }
          } catch (error) {
            clearInterval(pollInterval)
          }
        }, 3000)
      }

      if (uploadMethod !== 'youtube') {
        onUploadComplete()
        onClose()
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      if (uploadMethod !== 'youtube') {
        setUploading(false)
      }
    }
  }

  const specialties = [
    'Cardiothoracic Surgery', 'General Surgery', 'Neurosurgery', 'Orthopedic Surgery',
    'Plastic Surgery', 'Vascular Surgery', 'Emergency Medicine', 'Internal Medicine',
    'Pediatrics', 'Radiology'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {importJobId ? 'Importing Videos...' : 'Upload Video'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {importJobId ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Importing videos from YouTube... This may take a few minutes.
              </p>
              <p className="text-sm text-gray-500 mt-2">Job ID: {importJobId}</p>
            </div>
          ) : (
            <>
              {/* Upload Method Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 py-2 px-4 rounded transition-colors ${
                    uploadMethod === 'file'
                      ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Files
                </button>
                <button
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 py-2 px-4 rounded transition-colors ${
                    uploadMethod === 'url'
                      ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  From URL
                </button>
                <button
                  onClick={() => setUploadMethod('youtube')}
                  className={`flex-1 py-2 px-4 rounded transition-colors ${
                    uploadMethod === 'youtube'
                      ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Youtube className="w-4 h-4 inline mr-2" />
                  YouTube Import
                </button>
              </div>

              {/* File Upload */}
              {uploadMethod === 'file' && (
                <div>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Drag and drop video files here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports MP4, MOV, AVI up to 2GB each
                    </p>
                  </div>
                  
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />

                  {files.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="flex items-center space-x-3">
                            <FileVideo className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          
                          {uploading && uploadProgress[file.name] !== undefined ? (
                            <div className="w-24">
                              <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[file.name]}%` }}
                                />
                              </div>
                              <p className="text-xs text-center mt-1">{uploadProgress[file.name]}%</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* URL Upload */}
              {uploadMethod === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Thumbnails will be automatically generated from the video
                  </p>
                </div>
              )}

              {/* YouTube Import */}
              {uploadMethod === 'youtube' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Queries
                  </label>
                  {youtubeQueries.map((query, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => updateYoutubeQuery(index, e.target.value)}
                        placeholder="medical surgery training"
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {youtubeQueries.length > 1 && (
                        <button
                          onClick={() => removeYoutubeQuery(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addYoutubeQuery}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add another query
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Videos will be imported with original titles and thumbnails
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specialty
                  </label>
                  <select
                    value={metadata.specialty}
                    onChange={(e) => setMetadata({ ...metadata, specialty: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Specialty</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={metadata.difficulty}
                    onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={metadata.tags}
                  onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                  placeholder="minimally invasive, laparoscopic, cardiac"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  placeholder="Describe the procedure or learning objectives..."
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {!importJobId && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span>Videos will be processed for AI analysis after upload</span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || (uploadMethod === 'file' ? files.length === 0 : uploadMethod === 'url' ? !url : youtubeQueries.filter(q => q.trim()).length === 0)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {uploading ? 'Processing...' : uploadMethod === 'youtube' ? 'Start Import' : 'Upload'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadModal