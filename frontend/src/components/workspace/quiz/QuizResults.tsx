import { Quiz } from '../../../types/video'
import { Trophy, RefreshCw, Download, Play } from 'lucide-react'

interface QuizResultsProps {
  quiz: Quiz
  answers: Record<string, string>
  score: number
  onRestart: () => void
  onGenerateNew: () => void
  onSeek: (time: number) => void
}

const QuizResults = ({ quiz, answers, score, onRestart, onGenerateNew, onSeek }: QuizResultsProps) => {
  const correctAnswers = quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length
  const totalQuestions = quiz.questions.length

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Outstanding! You have excellent understanding of the procedure.'
    if (score >= 80) return 'Great job! You demonstrate strong comprehension.'
    if (score >= 70) return 'Good work! Consider reviewing the highlighted areas.'
    if (score >= 60) return 'Fair performance. Additional study recommended.'
    return 'Needs improvement. Please review the material carefully.'
  }

  const exportResults = () => {
    const results = quiz.questions.map((q, index) => {
      const userAnswer = answers[q.id] || 'No answer'
      const isCorrect = userAnswer === q.correctAnswer
      return `Question ${index + 1}: ${q.question}
Your Answer: ${userAnswer}
Correct Answer: ${q.correctAnswer}
Result: ${isCorrect ? 'Correct' : 'Incorrect'}
Explanation: ${q.explanation}
---`
    }).join('\n\n')

    const content = `Quiz Results
Score: ${correctAnswers}/${totalQuestions} (${score}%)
Date: ${new Date().toLocaleDateString()}

${results}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quiz-results.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Score Display */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
        <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>
          {score}%
        </div>
        <p className="text-gray-400 mb-4">
          {correctAnswers} out of {totalQuestions} correct
        </p>
        <p className="text-gray-300 text-sm max-w-sm mx-auto">
          {getScoreMessage(score)}
        </p>
      </div>

      {/* Question Review */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-medium text-white">Review Answers</h4>
        {quiz.questions.map((question, index) => {
          const userAnswer = answers[question.id] || 'No answer provided'
          const isCorrect = userAnswer === question.correctAnswer

          return (
            <div key={question.id} className={`p-4 rounded-lg border ${
              isCorrect 
                ? 'border-green-500/30 bg-green-500/10' 
                : 'border-red-500/30 bg-red-500/10'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-white">Question {index + 1}</h5>
                <button
                  onClick={() => onSeek(question.relevantTimestamp)}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>Watch</span>
                </button>
              </div>
              
              <p className="text-gray-300 mb-3">{question.question}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Your answer:</span>
                  <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                    {userAnswer}
                  </span>
                </div>
                
                {!isCorrect && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Correct answer:</span>
                    <span className="text-green-400">{question.correctAnswer}</span>
                  </div>
                )}
                
                <div className="mt-2 p-2 bg-gray-700/50 rounded text-gray-300">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col space-y-3">
        <button
          onClick={exportResults}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Results</span>
        </button>
        
        <button
          onClick={onRestart}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retake Quiz</span>
        </button>
        
        <button
          onClick={onGenerateNew}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Trophy className="w-4 h-4" />
          <span>Generate New Quiz</span>
        </button>
      </div>
    </div>
  )
}

export default QuizResults
