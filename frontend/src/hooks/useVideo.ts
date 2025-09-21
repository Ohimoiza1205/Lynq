import { useState, useEffect } from 'react'
import { Video, VideoSegment, VideoTranscript, QuestionAnswer } from '../types/video'

export const useVideo = (videoId: string) => {
  const [video, setVideo] = useState<Video | null>(null)
  const [segments, setSegments] = useState<VideoSegment[]>([])
  const [transcript, setTranscript] = useState<VideoTranscript | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [qaHistory, setQAHistory] = useState<QuestionAnswer[]>([])

  // Mock data for demo - replace with actual API calls
  useEffect(() => {
    const loadVideoData = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock video data
      const mockVideo: Video = {
        id: videoId,
        title: 'Advanced Cardiac Surgery - Mitral Valve Repair',
        description: 'Comprehensive surgical procedure demonstrating minimally invasive mitral valve repair techniques',
        duration: 3847, // 64:07 minutes
        url: '/api/videos/cardiac-surgery-demo.mp4',
        status: 'ready',
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-01-15T11:45:00Z',
        metadata: {
          procedure: 'Cardiac Surgery',
          specialty: 'Cardiothoracic Surgery',
          difficulty: 'advanced',
          tags: ['mitral valve', 'minimally invasive', 'cardiac repair']
        }
      }

      const mockSegments: VideoSegment[] = [
        {
          id: 'seg-1',
          videoId: videoId,
          startTime: 0,
          endTime: 180,
          title: 'Patient Preparation',
          description: 'Anesthesia administration and patient positioning',
          type: 'procedure_step',
          confidence: 0.95
        },
        {
          id: 'seg-2',
          videoId: videoId,
          startTime: 180,
          endTime: 720,
          title: 'Surgical Access',
          description: 'Minimally invasive port placement and camera insertion',
          type: 'procedure_step',
          confidence: 0.92
        },
        {
          id: 'seg-3',
          videoId: videoId,
          startTime: 720,
          endTime: 2100,
          title: 'Valve Repair',
          description: 'Mitral valve leaflet repair and annuloplasty',
          type: 'key_moment',
          confidence: 0.98
        },
        {
          id: 'seg-4',
          videoId: videoId,
          startTime: 2100,
          endTime: 2400,
          title: 'Quality Assessment',
          description: 'Post-repair valve function evaluation',
          type: 'milestone',
          confidence: 0.89
        }
      ]

      const mockTranscript: VideoTranscript = {
        id: 'transcript-1',
        videoId: videoId,
        segments: [
          {
            id: 'ts-1',
            startTime: 0,
            endTime: 15,
            text: 'Beginning the minimally invasive cardiac procedure. Patient is properly positioned and anesthetized.',
            speaker: 'Dr. Sarah Chen',
            confidence: 0.94
          },
          {
            id: 'ts-2',
            startTime: 15,
            endTime: 35,
            text: 'Establishing cardiopulmonary bypass through femoral cannulation. Notice the careful approach to avoid vessel injury.',
            speaker: 'Dr. Sarah Chen',
            confidence: 0.91
          }
        ]
      }

      setVideo(mockVideo)
      setSegments(mockSegments)
      setTranscript(mockTranscript)
      setLoading(false)
    }

    loadVideoData()
  }, [videoId])

  const seekTo = (time: number) => {
    setCurrentTime(time)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const addQuestionAnswer = (qa: QuestionAnswer) => {
    setQAHistory(prev => [...prev, qa])
  }

  return {
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
  }
}
