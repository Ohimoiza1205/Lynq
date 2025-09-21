import { VideoSegment } from '../../../types/video'
import { Check, Play, Edit3, Save } from 'lucide-react'
import { useState } from 'react'

interface ProcedureStepProps {
  step: number
  segment: VideoSegment
  isCompleted: boolean
  isActive: boolean
  note: string
  onToggleComplete: () => void
  onUpdateNote: (note: string) => void
  onSeek: (time: number) => void
}

const ProcedureStep = ({
  step,
  segment,
  isCompleted,
  isActive,
  note,
  onToggleComplete,
  onUpdateNote,
  onSeek
}: ProcedureStepProps) => {
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [noteText, setNoteText] = useState(note)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'procedure_step': return 'border-blue-500/50 bg-blue-500/10'
      case 'key_moment': return 'border-yellow-500/50 bg-yellow-500/10'
      case 'anomaly': return 'border-red-500/50 bg-red-500/10'
      case 'milestone': return 'border-green-500/50 bg-green-500/10'
      default: return 'border-gray-500/50 bg-gray-500/10'
    }
  }

  const saveNote = () => {
    onUpdateNote(noteText)
    setIsEditingNote(false)
  }

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isActive 
        ? 'border-blue-500 bg-blue-500/20' 
        : isCompleted 
        ? 'border-green-500/50 bg-green-500/10' 
        : getStepTypeColor(segment.type)
    }`}>
      {/* Step Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <button
            onClick={onToggleComplete}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isCompleted
                ? 'border-green-500 bg-green-500'
                : 'border-gray-400 hover:border-green-500'
            }`}
          >
            {isCompleted && <Check className="w-4 h-4 text-white" />}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-400">Step {step}</span>
              <span className="text-xs px-2 py-1 bg-gray-600 rounded text-gray-300">
                {segment.type.replace('_', ' ')}
              </span>
            </div>
            <h4 className={`font-medium ${isCompleted ? 'text-green-400' : 'text-white'}`}>
              {segment.title}
            </h4>
            <p className="text-sm text-gray-300 mt-1">{segment.description}</p>
          </div>
        </div>

        <button
          onClick={() => onSeek(segment.startTime)}
          className="flex items-center space-x-1 px-2 py-1 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Play className="w-3 h-3" />
          <span className="text-xs">{formatTime(segment.startTime)}</span>
        </button>
      </div>

      {/* Confidence Indicator */}
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-xs text-gray-400">AI Confidence:</span>
        <div className="flex-1 bg-gray-600 rounded-full h-1 max-w-20">
          <div 
            className="bg-blue-500 h-1 rounded-full"
            style={{ width: `${segment.confidence * 100}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-400">{Math.round(segment.confidence * 100)}%</span>
      </div>

      {/* Notes Section */}
      <div className="border-t border-gray-600 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Notes</span>
          {!isEditingNote && (
            <button
              onClick={() => setIsEditingNote(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}
        </div>

        {isEditingNote ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add notes about this step..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none text-sm"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={saveNote}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setIsEditingNote(false)
                  setNoteText(note)
                }}
                className="px-2 py-1 text-gray-400 hover:text-white text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-300">
            {note || <span className="text-gray-500 italic">No notes added</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProcedureStep
