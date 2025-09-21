import { Video, VideoSegment } from '../../../types/video'
import SessionBlock from './SessionBlock'
import { BookOpen, Clock, Target, Download } from 'lucide-react'

interface StudyPlanProps {
  video: Video
  segments: VideoSegment[]
}

const StudyPlan = ({ video, segments }: StudyPlanProps) => {
  // Generate AI-powered study plan based on video content
  const studyPlan = {
    totalDuration: 180, // 3 hours
    estimatedSessions: 3,
    difficulty: video.metadata.difficulty,
    sessions: [
      {
        id: 'session-1',
        title: 'Fundamentals & Preparation',
        duration: 45,
        objectives: [
          'Understand patient positioning and anesthesia protocols',
          'Review preoperative assessment criteria',
          'Study instrument setup and sterilization procedures'
        ],
        activities: [
          'Watch video segments 1-2',
          'Complete fundamentals quiz',
          'Review preparation checklist'
        ],
        relevantSegments: segments.slice(0, 2)
      },
      {
        id: 'session-2',
        title: 'Core Procedure Techniques',
        duration: 75,
        objectives: [
          'Master primary surgical techniques',
          'Understand critical decision points',
          'Recognize potential complications'
        ],
        activities: [
          'Detailed analysis of main procedure',
          'Interactive Q&A session',
          'Complete advanced assessment'
        ],
        relevantSegments: segments.slice(2, 4)
      },
      {
        id: 'session-3',
        title: 'Post-operative & Assessment',
        duration: 60,
        objectives: [
          'Review quality assessment techniques',
          'Understand post-operative care protocols',
          'Complete comprehensive evaluation'
        ],
        activities: [
          'Study outcome evaluation methods',
          'Final competency assessment',
          'Generate completion certificate'
        ],
        relevantSegments: segments.slice(4)
      }
    ]
  }

  const exportStudyPlan = () => {
    const content = `${video.title} - Study Plan
Generated: ${new Date().toLocaleDateString()}
Estimated Duration: ${studyPlan.totalDuration} minutes
Difficulty Level: ${studyPlan.difficulty}
Sessions: ${studyPlan.estimatedSessions}

${studyPlan.sessions.map((session, index) => `
Session ${index + 1}: ${session.title}
Duration: ${session.duration} minutes

Learning Objectives:
${session.objectives.map(obj => `- ${obj}`).join('\n')}

Activities:
${session.activities.map(activity => `- ${activity}`).join('\n')}

Relevant Video Segments:
${session.relevantSegments.map(seg => `- ${seg.title} (${Math.floor(seg.startTime / 60)}:${(seg.startTime % 60).toString().padStart(2, '0')})`).join('\n')}
`).join('\n---\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'study-plan.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">AI Study Plan</h3>
          </div>
          <button
            onClick={exportStudyPlan}
            className="text-gray-400 hover:text-white transition-colors"
            title="Export study plan"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">{video.title}</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 text-blue-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <p className="text-white">{studyPlan.totalDuration}min</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-green-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Sessions</span>
              </div>
              <p className="text-white">{studyPlan.estimatedSessions}</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-yellow-400 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Level</span>
              </div>
              <p className="text-white capitalize">{studyPlan.difficulty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Study Sessions */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Learning Sessions</h4>
        {studyPlan.sessions.map((session, index) => (
          <SessionBlock
            key={session.id}
            session={session}
            sessionNumber={index + 1}
            isCompleted={false}
            progress={0}
          />
        ))}
      </div>

      {/* Learning Path */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Recommended Learning Path</h4>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Begin with fundamentals and preparation overview</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Focus on core techniques with hands-on practice</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Complete with assessment and post-operative care</span>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Prerequisites</h4>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• Basic surgical anatomy knowledge</li>
          <li>• Familiarity with sterile technique</li>
          <li>• Understanding of {video.metadata.specialty.toLowerCase()} principles</li>
        </ul>
      </div>
    </div>
  )
}

export default StudyPlan
