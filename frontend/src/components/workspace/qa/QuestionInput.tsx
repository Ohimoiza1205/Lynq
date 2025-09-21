import { useState } from 'react'
import { Send, Lightbulb } from 'lucide-react'

interface QuestionInputProps {
  onSubmit: (question: string) => void
  isLoading: boolean
  suggestedQuestions: string[]
}

const QuestionInput = ({ onSubmit, isLoading, suggestedQuestions }: QuestionInputProps) => {
  const [question, setQuestion] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim() && !isLoading) {
      onSubmit(question.trim())
      setQuestion('')
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="p-4">
      {/* Suggestions */}
      {showSuggestions && (
        <div className="mb-3 space-y-1">
          {suggestedQuestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="block w-full text-left px-3 py-2 text-sm text-gray-300 bg-gray-700/50 rounded hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the video..."
            className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="absolute bottom-3 right-3 p-2 text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            <Lightbulb className="w-3 h-3" />
            <span>Suggestions</span>
          </button>
          
          <div className="text-xs text-gray-500">
            Powered by AI
          </div>
        </div>
      </form>
    </div>
  )
}

export default QuestionInput
