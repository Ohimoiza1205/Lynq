import { CheckSquare, Square, Trash2, Download, Tag, Archive, Share2 } from 'lucide-react'

interface BulkActionsProps {
  selectedCount: number
  onSelectAll: () => void
  onDelete: () => void
  onClearSelection: () => void
}

const BulkActions = ({ selectedCount, onSelectAll, onDelete, onClearSelection }: BulkActionsProps) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={onSelectAll}
              className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {selectedCount} video{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bulk Actions */}
          <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>

          <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Tag className="w-4 h-4" />
            <span>Add Tags</span>
          </button>

          <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Archive className="w-4 h-4" />
            <span>Archive</span>
          </button>

          <button className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          <button
            onClick={onDelete}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete ({selectedCount})</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BulkActions
