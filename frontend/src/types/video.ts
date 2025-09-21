export interface Video {
  id: string
  title: string
  description?: string
  duration: number
  url: string
  thumbnailUrl?: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
  createdAt: string
  updatedAt: string
  metadata: VideoMetadata
}

export interface VideoMetadata {
  procedure: string
  specialty: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
}

export interface VideoSegment {
  id: string
  videoId: string
  startTime: number
  endTime: number
  title: string
  description: string
  type: 'procedure_step' | 'key_moment' | 'anomaly' | 'milestone'
  confidence: number
}

export interface VideoTranscript {
  id: string
  videoId: string
  segments: TranscriptSegment[]
}

export interface TranscriptSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  speaker?: string
  confidence: number
}

export interface QuestionAnswer {
  id: string
  videoId: string
  question: string
  answer: string
  relevantSegments: VideoSegment[]
  timestamp: number
  confidence: number
}

export interface Quiz {
  id: string
  videoId: string
  questions: QuizQuestion[]
  generatedAt: string
}

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'short_answer' | 'identification'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  relevantTimestamp: number
}
