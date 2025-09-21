import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useVideo } from '../../hooks/useVideo'
import VideoPlayer from './player/VideoPlayer'
import Timeline from './player/Timeline'
import Transcript from './transcript/Transcript'
import QAPanel from './qa/QAPanel'
import QuizPanel from './quiz/QuizPanel'
import ChecklistPanel from './checklist/ChecklistPanel'
import StudyPlan from './studyplan/StudyPlan'
import { ArrowLeft, Maximize2 } from 'lucide-react'
import { Link } from 'react-router-dom'

type TabType = 'transcript' | 'qa' | 'quiz' | 'checklist' | 'study'

const VideoWorkspace = () => {
  const { videoId } = useParams<{ videoId: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('transcript')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const {
    video,
    segments,
    transcript,
    currentTime,
    isPlaying,
    loading,
    qaHistory,
    seekTo,
    togglePlayPause,
    setCurrentTime,
    addQuestionAnswer
  } = useVideo(videoId || '')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading video analysis...</p>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Video not found</p>
          <Link to="/library" className="text-blue-400 hover:text-blue-300">
            Return to Library
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'transcript', label: 'Transcript', count: transcript?.segments.length },
    { id: 'qa', label: 'Q&A', count: qaHistory.length },
    { id: 'quiz', label: 'Quiz', count: 12 },
    { id: 'checklist', label: 'Checklist', count: segments.length },
    { id: 'study', label: 'Study Plan', count: 3 }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/library" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">{video.title}</h1>
              <p className="text-sm text-gray-400">{video.metadata.specialty} • {video.metadata.difficulty}</p>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Video Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center">
            <VideoPlayer
              video={video}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTimeUpdate={setCurrentTime}
              onTogglePlayPause={togglePlayPause}
              onSeek={seekTo}
            />
          </div>
          
          <div className="bg-gray-800 p-4">
            <Timeline
              duration={video.duration}
              currentTime={currentTime}
              segments={segments}
              onSeek={seekTo}
            />
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-700">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-1 text-xs bg-gray-600 px-1.5 py-0.5 rounded">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'transcript' && (
              <Transcript
                transcript={transcript}
                currentTime={currentTime}
                onSeek={seekTo}
              />
            )}
            {activeTab === 'qa' && (
              <QAPanel
                videoId={video.id}
                qaHistory={qaHistory}
                onAddQA={addQuestionAnswer}
                onSeek={seekTo}
              />
            )}
            {activeTab === 'quiz' && (
              <QuizPanel
                videoId={video.id}
                onSeek={seekTo}
              />
            )}
            {activeTab === 'checklist' && (
              <ChecklistPanel
                segments={segments}
                currentTime={currentTime}
                onSeek={seekTo}
              />
            )}
            {activeTab === 'study' && (
              <StudyPlan
                video={video}
                segments={segments}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoWorkspace
