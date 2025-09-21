// frontend/src/components/workspace/qa/QAPanel.tsx
import { useState } from 'react'
import { QuestionAnswer } from '../../../types/video'
import QuestionInput from './QuestionInput'
import AnswerDisplay from './AnswerDisplay'
import { MessageSquare, Sparkles, AlertCircle } from 'lucide-react'
import api from '../../../services/api'

interface QAPanelProps {
  videoId: string
  qaHistory: QuestionAnswer[]
  onAddQA: (qa: QuestionAnswer) => void
  onSeek: (time: number) => void
}

const QAPanel = ({ videoId, qaHistory, onAddQA, onSeek }: QAPanelProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmitQuestion = async (question: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Call real backend Q&A endpoint
      const response = await api.post(`/api/videos/${videoId}/qa`, {
        question: question.trim()
      })

      const qaResponse: QuestionAnswer = response.data

      onAddQA(qaResponse)
      
    } catch (err: any) {
      console.error('Q&A error:', err)
      setError(err.response?.data?.error || 'Failed to process question')
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "What are the key steps in this procedure?",
    "What surgical instruments are being used?", 
    "Are there any complications shown in this video?",
    "What is the standard duration for this type of surgery?",
    "What anatomy is being operated on?",
    "What are the risks associated with this procedure?"
  ]

  const clearError = () => setError(null)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-medium text-white">AI Medical Assistant</h3>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Ask questions about the surgical procedure
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-600/20 border-b border-red-500/30">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
            <button 
              onClick={clearError}
              className="text-red-400 hover:text-red-300 ml-auto"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Q&A History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {qaHistory.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No questions yet</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Try asking:</p>
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmitQuestion(question)}
                  className="block w-full text-left px-3 py-2 text-sm text-blue-400 bg-gray-700/50 rounded hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  "{question}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          qaHistory.map((qa) => (
            <AnswerDisplay
              key={qa.id}
              qa={qa}
              onSeek={onSeek}
            />
          ))
        )}

        {isLoading && (
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <span className="text-gray-400">AI is analyzing the video...</span>
            </div>
            <div className="text-xs text-gray-500">
              • Searching video segments
              <br />
              • Processing with Gemini AI
              <br />
              • Generating timestamp citations
            </div>
          </div>
        )}
      </div>

      {/* Question Input */}
      <div className="border-t border-gray-700">
        <QuestionInput
          onSubmit={handleSubmitQuestion}
          isLoading={isLoading}
          suggestedQuestions={suggestedQuestions}
        />
      </div>
    </div>
  )
}

export default QAPanel