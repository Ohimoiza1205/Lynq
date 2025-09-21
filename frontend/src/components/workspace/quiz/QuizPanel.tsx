import { useState, useEffect } from 'react'
import { Quiz, QuizQuestion } from '../../../types/video'
import QuizQuestion as QuizQuestionComponent from './QuizQuestion'
import QuizResults from './QuizResults'
import { Brain, RefreshCw, Play } from 'lucide-react'

interface QuizPanelProps {
  videoId: string
  onSeek: (time: number) => void
}

const QuizPanel = ({ videoId, onSeek }: QuizPanelProps) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock quiz data
  const mockQuiz: Quiz = {
    id: 'quiz-1',
    videoId,
    generatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What is the primary goal of minimally invasive cardiac surgery?',
        options: [
          'Reduce patient recovery time',
          'Minimize surgical complications',
          'Decrease surgical site infections',
          'All of the above'
        ],
        correctAnswer: 'All of the above',
        explanation: 'Minimally invasive cardiac surgery aims to achieve all these benefits through smaller incisions and advanced techniques.',
        relevantTimestamp: 120
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Which tool is essential for port placement in laparoscopic procedures?',
        options: [
          'Trocar',
          'Grasper',
          'Scissors',
          'Suture'
        ],
        correctAnswer: 'Trocar',
        explanation: 'A trocar is specifically designed to create ports for laparoscopic access while minimizing tissue trauma.',
        relevantTimestamp: 340
      },
      {
        id: 'q3',
        type: 'short_answer',
        question: 'Describe the key safety considerations when performing electrocautery near vital structures.',
        options: [],
        correctAnswer: 'Maintain safe distance from nerves and vessels, use appropriate power settings, ensure proper grounding',
        explanation: 'Safety requires careful technique, appropriate settings, and awareness of anatomical structures.',
        relevantTimestamp: 890
      }
    ]
  }

  useEffect(() => {
    // Simulate loading existing quiz
    setQuiz(mockQuiz)
  }, [videoId])

  const generateNewQuiz = async () => {
    setIsGenerating(true)
    setShowResults(false)
    setAnswers({})
    setCurrentQuestionIndex(0)

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 3000))

    // In real implementation, call Gemini API to generate questions
    setQuiz(mockQuiz)
    setIsGenerating(false)
  }

  const handleAnswerSubmit = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const goToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowResults(true)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = () => {
    if (!quiz) return 0
    const correct = quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length
    return Math.round((correct / quiz.questions.length) * 100)
  }

  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-2">Generating Quiz</h3>
          <p className="text-gray-400">AI is analyzing the video content to create personalized questions...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Quiz Available</h3>
          <p className="text-gray-400 mb-4">Generate AI-powered questions based on video content</p>
          <button
            onClick={generateNewQuiz}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <QuizResults
        quiz={quiz}
        answers={answers}
        score={calculateScore()}
        onRestart={() => {
          setShowResults(false)
          setAnswers({})
          setCurrentQuestionIndex(0)
        }}
        onGenerateNew={generateNewQuiz}
        onSeek={onSeek}
      />
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">AI Quiz</h3>
          </div>
          <button
            onClick={generateNewQuiz}
            className="text-gray-400 hover:text-white transition-colors"
            title="Generate new quiz"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <button
            onClick={() => onSeek(currentQuestion.relevantTimestamp)}
            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>Watch</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto">
        <QuizQuestionComponent
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswerSubmit={handleAnswerSubmit}
          onNext={goToNextQuestion}
          onPrevious={goToPreviousQuestion}
          canGoNext={currentQuestionIndex < quiz.questions.length - 1 || answers[currentQuestion.id]}
          canGoPrevious={currentQuestionIndex > 0}
          isLast={currentQuestionIndex === quiz.questions.length - 1}
        />
      </div>
    </div>
  )
}

export default QuizPanel
