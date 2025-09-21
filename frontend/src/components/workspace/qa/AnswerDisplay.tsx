import { QuestionAnswer } from '../../../types/video'
import { Clock, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState } from 'react'

interface AnswerDisplayProps {
  qa: QuestionAnswer
  onSeek: (time: number) => void
}

const AnswerDisplay = ({ qa, onSeek }: AnswerDisplayProps) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type)
    // In real implementation, send feedback to backend
  }

  return (
    <div className="space-y-3">
      {/* User Question */}
      <div className="bg-blue-600/20 rounded-lg p-3 ml-8">
        <p className="text-white">{qa.question}</p>
        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{new Date(qa.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* AI Answer */}
      <div className="bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">AI</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-200 leading-relaxed">{qa.answer}</p>
            
            {/* Confidence Score */}
            <div className="flex items-center space-x-2 mt-3">
              <span className="text-xs text-gray-400">Confidence:</span>
              <div className="flex-1 bg-gray-600 rounded-full h-2 max-w-24">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${qa.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">{Math.round(qa.confidence * 100)}%</span>
            </div>

            {/* Relevant Segments */}
            {qa.relevantSegments && qa.relevantSegments.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Related video segments:</p>
                <div className="space-y-1">
                  {qa.relevantSegments.map((segment) => (
                    <button
                      key={segment.id}
                      onClick={() => onSeek(segment.startTime)}
                      className="flex items-center space-x-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{formatTime(segment.startTime)} - {segment.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-600">
              <span className="text-xs text-gray-400">Was this helpful?</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFeedback('up')}
                  className={`p-1 rounded transition-colors ${
                    feedback === 'up' 
                      ? 'text-green-400 bg-green-400/20' 
                      : 'text-gray-400 hover:text-green-400'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  className={`p-1 rounded transition-colors ${
                    feedback === 'down' 
                      ? 'text-red-400 bg-red-400/20' 
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnswerDisplay
