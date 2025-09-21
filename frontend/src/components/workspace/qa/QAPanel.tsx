import { useState } from 'react'
import { QuestionAnswer } from '../../../types/video'
import QuestionInput from './QuestionInput'
import AnswerDisplay from './AnswerDisplay'
import { MessageSquare, Sparkles } from 'lucide-react'

interface QAPanelProps {
  videoId: string
  qaHistory: QuestionAnswer[]
  onAddQA: (qa: QuestionAnswer) => void
  onSeek: (time: number) => void
}

const QAPanel = ({ videoId, qaHistory, onAddQA, onSeek }: QAPanelProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmitQuestion = async (question: string) => {
    setIsLoading(true)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock AI response - in real implementation, this would call Google Gemini API
    const mockAnswer: QuestionAnswer = {
      id: `qa-${Date.now()}`,
      videoId,
      question,
      answer: `Based on the video analysis, ${question.toLowerCase().includes('procedure') 
        ? 'this surgical procedure involves several critical steps including patient preparation, anesthetic administration, and precise surgical technique. The key phases are clearly segmented in the timeline markers.'
        : question.toLowerCase().includes('tool') 
        ? 'the primary surgical instruments used include laparoscopic ports, scissors, graspers, and suturing devices. Each tool serves a specific purpose in the minimally invasive approach.'
        : 'the AI analysis has identified relevant segments that address your question. Please refer to the highlighted timestamps for detailed visual confirmation.'}`,
      relevantSegments: [],
      timestamp: Date.now(),
      confidence: 0.87
    }

    onAddQA(mockAnswer)
    setIsLoading(false)
  }

  const suggestedQuestions = [
    "What are the key steps in this procedure?",
    "What tools are being used in this segment?",
    "Are there any complications shown?",
    "What is the standard duration for this surgery?"
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-medium text-white">Q&A Assistant</h3>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Ask questions about the video content
        </p>
      </div>

      {/* Q&A History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {qaHistory.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No questions yet</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Try asking:</p>
              {suggestedQuestions.slice(0, 2).map((question, index) => (
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
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <span className="text-gray-400">AI is analyzing the video...</span>
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
