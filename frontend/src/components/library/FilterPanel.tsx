import { X, Calendar, Tag, Clock } from 'lucide-react'

interface FilterPanelProps {
  filters: {
    specialty: string
    difficulty: string
    status: string
    duration: { min: number; max: number }
    tags: string[]
    uploadDate: { start: string; end: string }
  }
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

const FilterPanel = ({ filters, onFiltersChange, onClearFilters }: FilterPanelProps) => {
  const specialties = [
    'Cardiothoracic Surgery',
    'General Surgery',
    'Neurosurgery',
    'Orthopedic Surgery',
    'Plastic Surgery',
    'Vascular Surgery',
    'Emergency Medicine',
    'Internal Medicine',
    'Pediatrics',
    'Radiology'
  ]

  const availableTags = [
    'minimally invasive',
    'laparoscopic',
    'robotic surgery',
    'cardiac repair',
    'tumor removal',
    'trauma surgery',
    'pediatric',
    'emergency',
    'diagnostic',
    'therapeutic'
  ]

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const updateDuration = (type: 'min' | 'max', value: number) => {
    onFiltersChange({
      ...filters,
      duration: {
        ...filters.duration,
        [type]: value
      }
    })
  }

  const updateUploadDate = (type: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      uploadDate: {
        ...filters.uploadDate,
        [type]: value
      }
    })
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    
    updateFilter('tags', newTags)
  }

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== '' && v !== 0 && v !== 240)
    }
    return value !== ''
  })

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Specialty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Specialty
          </label>
          <select
            value={filters.specialty}
            onChange={(e) => updateFilter('specialty', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => updateFilter('difficulty', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="ready">Ready</option>
            <option value="processing">Processing</option>
            <option value="uploading">Uploading</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Duration Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Duration (minutes)
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.duration.min || ''}
                onChange={(e) => updateDuration('min', parseInt(e.target.value) || 0)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.duration.max === 240 ? '' : filters.duration.max}
                onChange={(e) => updateDuration('max', parseInt(e.target.value) || 240)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Current: {filters.duration.min}-{filters.duration.max} minutes
            </div>
          </div>
        </div>

        {/* Upload Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Upload Date
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.uploadDate.start}
              onChange={(e) => updateUploadDate('start', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.uploadDate.end}
              onChange={(e) => updateUploadDate('end', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tags Filter */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="inline w-4 h-4 mr-1" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filters.tags.includes(tag)
                    ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {filters.tags.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {filters.tags.length} tag(s) selected
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
