import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Download, Search, MessageSquare, Brain, CheckSquare, FileText, Play, Pause } from 'lucide-react'

interface VideoSegment {
  id: string
  startSec: number
  endSec: number
  text: string
  confidence: number
  labels: string[]
}

interface QuizQuestion {
  id: string
  type: 'mcq' | 'short' | 'identify'
  question: string
  options?: string[]
  correctAnswer: string
  timestamp: number
  explanation: string
}

interface ChecklistItem {
  id: string
  title: string
  description: string
  timestamp: number
  completed: boolean
  required: boolean
}

const AdvancedVideoWorkspace = () => {
  const { videoId } = useParams()
  const [activeTab, setActiveTab] = useState('transcript')
  const [video, setVideo] = useState<any>(null)
  const [segments, setSegments] = useState<VideoSegment[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [qaHistory, setQaHistory] = useState<any[]>([])
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideo()
  }, [videoId])

  const loadVideo = async () => {
    try {
      setLoading(true)
      
      // Load video details
      const videoResponse = await fetch(`/api/videos/${videoId}`)
      const videoData = await videoResponse.json()
      setVideo(videoData)

      // Load transcript segments
      const segmentsResponse = await fetch(`/api/videos/${videoId}/transcript`)
      const segmentsData = await segmentsResponse.json()
      setSegments(segmentsData.transcript || [])

      // Generate initial quiz and checklist
      await generateQuiz()
      await generateChecklist()

    } catch (error) {
      console.error('Failed to load video:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQuiz = async () => {
    try {
      const response = await fetch(`/api/training/${videoId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questionCount: 10,
          includeTimestamps: true,
          difficulty: 'mixed'
        })
      })
      const quizData = await response.json()
      setQuiz(quizData.questions || [])
    } catch (error) {
      console.error('Quiz generation failed:', error)
    }
  }

  const generateChecklist = async () => {
    try {
      const response = await fetch(`/api/training/${videoId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const checklistData = await response.json()
      setChecklist(checklistData.items || [])
    } catch (error) {
      console.error('Checklist generation failed:', error)
    }
  }

  const askQuestion = async (question: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      const qaResponse = await response.json()
      setQaHistory(prev => [...prev, qaResponse])
      return qaResponse
    } catch (error) {
      console.error('Q&A failed:', error)
    }
  }

  const seekToTime = (time: number) => {
    setCurrentTime(time)
    // In real implementation, this would control video player
  }

  const exportData = async (type: 'transcript' | 'quiz' | 'checklist') => {
    try {
      const response = await fetch(`/api/export/videos/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, format: 'pdf' })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${video?.title}_${type}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const filteredSegments = segments.filter(segment =>
    !searchQuery || segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

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
          <button 
            onClick={() => window.history.back()}
            className="text-blue-400 hover:text-blue-300"
          >
            Return to Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">{video.title}</h1>
              <p className="text-sm text-gray-400">{video.specialty} • {video.difficulty}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportData('transcript')}
              className="flex items-center space-x-1 px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Video Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="w-full max-w-4xl aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p>Video Player</p>
                <p className="text-sm mt-2">Duration: {formatTime(video.durationSec || 0)}</p>
              </div>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="bg-gray-800 p-4">
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${(currentTime / (video.durationSec || 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(video.durationSec || 0)}</span>
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-gray-700">
            <nav className="flex">
              {[
                { id: 'transcript', label: 'Transcript', icon: FileText, count: segments.length },
                { id: 'qa', label: 'Q&A', icon: MessageSquare, count: qaHistory.length },
                { id: 'quiz', label: 'Quiz', icon: Brain, count: quiz.length },
                { id: 'checklist', label: 'Checklist', icon: CheckSquare, count: checklist.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-3 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-1" />
                  <span>{tab.label}</span>
                  <span className="ml-1 text-xs bg-gray-600 px-1.5 py-0.5 rounded">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'transcript' && (
              <TranscriptTab 
                segments={filteredSegments}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSeek={seekToTime}
                currentTime={currentTime}
              />
            )}
            {activeTab === 'qa' && (
              <QATab 
                qaHistory={qaHistory}
                onAskQuestion={askQuestion}
                onSeek={seekToTime}
              />
            )}
            {activeTab === 'quiz' && (
              <QuizTab 
                quiz={quiz}
                onSeek={seekToTime}
                videoId={videoId || ''}
              />
            )}
            {activeTab === 'checklist' && (
              <ChecklistTab 
                checklist={checklist}
                onSeek={seekToTime}
                onUpdateChecklist={setChecklist}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Transcript Tab Component
const TranscriptTab = ({ segments, searchQuery, onSearchChange, onSeek, currentTime }: any) => (
  <div className="h-full flex flex-col">
    <div className="p-4 border-b border-gray-700">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transcript..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
    
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {segments.map((segment: any) => {
        const isActive = currentTime >= segment.startSec && currentTime <= segment.endSec
        const isHighlighted = searchQuery && segment.text.toLowerCase().includes(searchQuery.toLowerCase())
        
        return (
          <div
            key={segment.id}
            onClick={() => onSeek(segment.startSec)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              isActive
                ? 'bg-blue-600/20 border border-blue-500/50'
                : isHighlighted
                ? 'bg-yellow-600/20 border border-yellow-500/50'
                : 'bg-gray-700/50 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-400 font-mono">
                {Math.floor(segment.startSec / 60)}:{String(Math.floor(segment.startSec % 60)).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-400">
                {Math.round(segment.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-gray-200 leading-relaxed text-sm">{segment.text}</p>
            {segment.labels && segment.labels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {segment.labels.map((label: string, idx: number) => (
                  <span key={idx} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  </div>
)

// Q&A Tab Component  
const QATab = ({ qaHistory, onAskQuestion, onSeek }: any) => {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    setLoading(true)
    await onAskQuestion(question)
    setQuestion('')
    setLoading(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white mb-2">AI Medical Assistant</h3>
        <p className="text-sm text-gray-400">Ask questions about the procedure</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {qaHistory.map((qa: any, idx: number) => (
          <div key={idx} className="bg-gray-700/50 rounded-lg p-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-blue-400">Q: </span>
              <span className="text-gray-200">{qa.question}</span>
            </div>
            <div className="mb-3">
              <span className="text-sm font-medium text-green-400">A: </span>
              <span className="text-gray-200">{qa.answer}</span>
            </div>
            {qa.sources && qa.sources.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs text-gray-400">Sources:</span>
                {qa.sources.map((source: any, srcIdx: number) => (
                  <button
                    key={srcIdx}
                    onClick={() => onSeek(source.startTime)}
                    className="block text-xs text-blue-400 hover:text-blue-300"
                  >
                    {source.timestamp} - {source.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about the procedure..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Quiz Tab Component
const QuizTab = ({ quiz, onSeek, videoId }: any) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const calculateScore = () => {
    let correct = 0
    quiz.forEach((q: QuizQuestion) => {
      if (answers[q.id] === q.correctAnswer) correct++
    })
    return Math.round((correct / quiz.length) * 100)
  }

  if (quiz.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No quiz available</p>
      </div>
    )
  }

  const question = quiz[currentQuestion]

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Medical Quiz</h3>
          <span className="text-sm text-gray-400">
            {currentQuestion + 1} / {quiz.length}
          </span>
        </div>
      </div>

      {!showResults ? (
        <div className="flex-1 p-4">
          <div className="mb-4">
            <button
              onClick={() => onSeek(question.timestamp)}
              className="text-xs text-blue-400 hover:text-blue-300 mb-2"
            >
              Jump to {Math.floor(question.timestamp / 60)}:{String(Math.floor(question.timestamp % 60)).padStart(2, '0')}
            </button>
            <h4 className="text-white font-medium mb-4">{question.question}</h4>
          </div>

          {question.type === 'mcq' && question.options && (
            <div className="space-y-2 mb-6">
              {question.options.map((option: string, idx: number) => (
                <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    className="text-blue-500"
                  />
                  <span className="text-gray-200">{option}</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded transition-colors"
            >
              Previous
            </button>
            
            {currentQuestion === quiz.length - 1 ? (
              <button
                onClick={() => setShowResults(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Finish Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete</h3>
            <p className="text-xl text-blue-400">Score: {calculateScore()}%</p>
          </div>
          
          <div className="space-y-4">
            {quiz.map((q: QuizQuestion, idx: number) => (
              <div key={q.id} className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">{q.question}</h4>
                <p className="text-sm text-gray-300 mb-1">
                  Your answer: <span className={answers[q.id] === q.correctAnswer ? 'text-green-400' : 'text-red-400'}>
                    {answers[q.id] || 'No answer'}
                  </span>
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  Correct answer: <span className="text-green-400">{q.correctAnswer}</span>
                </p>
                {q.explanation && (
                  <p className="text-xs text-gray-400">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Checklist Tab Component
const ChecklistTab = ({ checklist, onSeek, onUpdateChecklist }: any) => {
  const toggleItem = (itemId: string) => {
    onUpdateChecklist((prev: ChecklistItem[]) =>
      prev.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const completedCount = checklist.filter((item: ChecklistItem) => item.completed).length

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white mb-1">Procedure Checklist</h3>
        <p className="text-sm text-gray-400">
          {completedCount} / {checklist.length} completed
        </p>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / checklist.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {checklist.map((item: ChecklistItem) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border transition-colors ${
              item.completed
                ? 'bg-green-600/20 border-green-500/50'
                : item.required
                ? 'bg-red-600/10 border-red-500/30'
                : 'bg-gray-700/50 border-gray-600'
            }`}
          >
            <div className="flex items-start space-x-3">
              <button
                onClick={() => toggleItem(item.id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  item.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-400 hover:border-gray-300'
                }`}
              >
                {item.completed && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium ${item.completed ? 'text-green-400' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  {item.required && (
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Required</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                
                <button
                  onClick={() => onSeek(item.timestamp)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  View at {Math.floor(item.timestamp / 60)}:{String(Math.floor(item.timestamp % 60)).padStart(2, '0')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdvancedVideoWorkspace