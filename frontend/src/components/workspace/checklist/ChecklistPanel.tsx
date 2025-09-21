import { useState } from 'react'
import { VideoSegment } from '../../../types/video'
import ProcedureStep from './ProcedureStep'
import { CheckSquare, RotateCcw, Download } from 'lucide-react'

interface ChecklistPanelProps {
  segments: VideoSegment[]
  currentTime: number
  onSeek: (time: number) => void
}

const ChecklistPanel = ({ segments, currentTime, onSeek }: ChecklistPanelProps) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState<Record<string, string>>({})

  const toggleStepCompletion = (segmentId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId)
      } else {
        newSet.add(segmentId)
      }
      return newSet
    })
  }

  const updateNote = (segmentId: string, note: string) => {
    setNotes(prev => ({ ...prev, [segmentId]: note }))
  }

  const resetChecklist = () => {
    setCompletedSteps(new Set())
    setNotes({})
  }

  const exportChecklist = () => {
    const content = segments.map((segment, index) => {
      const isCompleted = completedSteps.has(segment.id)
      const note = notes[segment.id] || ''
      
      return `${index + 1}. ${segment.title}
Status: ${isCompleted ? 'Completed' : 'Pending'}
Description: ${segment.description}
Timestamp: ${Math.floor(segment.startTime / 60)}:${(segment.startTime % 60).toString().padStart(2, '0')}
${note ? `Notes: ${note}` : ''}
---`
    }).join('\n\n')

    const summary = `Procedure Checklist
Completed: ${completedSteps.size}/${segments.length} steps
Progress: ${Math.round((completedSteps.size / segments.length) * 100)}%
Date: ${new Date().toLocaleDateString()}

${content}`

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'procedure-checklist.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const completionPercentage = Math.round((completedSteps.size / segments.length) * 100)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Procedure Checklist</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportChecklist}
              className="text-gray-400 hover:text-white transition-colors"
              title="Export checklist"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={resetChecklist}
              className="text-gray-400 hover:text-white transition-colors"
              title="Reset checklist"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-300">{completedSteps.size}/{segments.length}</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="text-center text-sm text-gray-400">
            {completionPercentage}% Complete
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {segments.map((segment, index) => (
          <ProcedureStep
            key={segment.id}
            step={index + 1}
            segment={segment}
            isCompleted={completedSteps.has(segment.id)}
            isActive={currentTime >= segment.startTime && currentTime <= segment.endTime}
            note={notes[segment.id] || ''}
            onToggleComplete={() => toggleStepCompletion(segment.id)}
            onUpdateNote={(note) => updateNote(segment.id, note)}
            onSeek={onSeek}
          />
        ))}
      </div>

      {/* Summary */}
      {completedSteps.size === segments.length && (
        <div className="p-4 border-t border-gray-700 bg-green-600/10">
          <div className="text-center">
            <CheckSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-green-400 font-medium mb-1">Procedure Complete!</h4>
            <p className="text-sm text-gray-300">All steps have been completed successfully.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChecklistPanel
