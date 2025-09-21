import { CheckCircle, Clock, Target, Play } from 'lucide-react'

interface Session {
  id: string
  title: string
  duration: number
  objectives: string[]
  activities: string[]
  relevantSegments: any[]
}

interface SessionBlockProps {
  session: Session
  sessionNumber: number
  isCompleted: boolean
  progress: number
}

const SessionBlock = ({ session, sessionNumber, isCompleted, progress }: SessionBlockProps) => {
  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isCompleted 
        ? 'border-green-500/50 bg-green-500/10' 
        : 'border-gray-600 bg-gray-700/30'
    }`}>
      {/* Session Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-green-500' : 'bg-gray-600'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <span className="text-white font-medium">{sessionNumber}</span>
            )}
          </div>
          <div>
            <h5 className="font-medium text-white">{session.title}</h5>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{session.duration} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>{session.objectives.length} objectives</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="text-blue-400 hover:text-blue-300 transition-colors">
          <Play className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Learning Objectives */}
      <div className="mb-4">
        <h6 className="text-sm font-medium text-gray-300 mb-2">Learning Objectives</h6>
        <ul className="space-y-1">
          {session.objectives.map((objective, index) => (
            <li key={index} className="text-sm text-gray-400 flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Activities */}
      <div className="mb-4">
        <h6 className="text-sm font-medium text-gray-300 mb-2">Activities</h6>
        <ul className="space-y-1">
          {session.activities.map((activity, index) => (
            <li key={index} className="text-sm text-gray-400 flex items-start space-x-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>{activity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Related Segments */}
      {session.relevantSegments.length > 0 && (
        <div>
          <h6 className="text-sm font-medium text-gray-300 mb-2">Video Segments</h6>
          <div className="flex flex-wrap gap-2">
            {session.relevantSegments.map((segment, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300"
              >
                {segment.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionBlock
