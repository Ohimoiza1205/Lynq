import { useState } from 'react'
import { QuizQuestion } from '../../../types/video'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

interface QuizQuestionProps {
  question: QuizQuestion
  answer?: string
  onAnswerSubmit: (questionId: string, answer: string) => void
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  isLast: boolean
}

const QuizQuestionComponent = ({
  question,
  answer,
  onAnswerSubmit,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLast
}: QuizQuestionProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState(answer || '')
  const [shortAnswer, setShortAnswer] = useState(answer || '')

  const handleAnswerChange = (newAnswer: string) => {
    if (question.type === 'multiple_choice') {
      setSelectedAnswer(newAnswer)
      onAnswerSubmit(question.id, newAnswer)
    } else {
      setShortAnswer(newAnswer)
    }
  }

  const handleShortAnswerSubmit = () => {
    if (shortAnswer.trim()) {
      onAnswerSubmit(question.id, shortAnswer.trim())
    }
  }

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Question */}
      <div>
        <h4 className="text-lg font-medium text-white mb-2">{question.question}</h4>
        <div className="text-sm text-gray-400">
          Related to timestamp: {formatTimestamp(question.relevantTimestamp)}
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-4">
        {question.type === 'multiple_choice' && question.options ? (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-400'
                }`}>
                  {selectedAnswer === option && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-gray-200">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={shortAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              rows={4}
            />
            {shortAnswer.trim() && !answer && (
              <button
                onClick={handleShortAnswerSubmit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit Answer</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Show explanation if answered */}
      {answer && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h5 className="font-medium text-white mb-2">Explanation:</h5>
          <p className="text-gray-300">{question.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-600">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>{isLast ? 'Finish Quiz' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default QuizQuestionComponent
