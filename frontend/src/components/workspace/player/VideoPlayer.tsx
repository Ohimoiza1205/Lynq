import { useRef, useEffect, useState } from 'react'
import { Video } from '../../../types/video'
import Controls from './Controls'

interface VideoPlayerProps {
  video: Video
  currentTime: number
  isPlaying: boolean
  onTimeUpdate: (time: number) => void
  onTogglePlayPause: () => void
  onSeek: (time: number) => void
}

const VideoPlayer = ({
  video,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onTogglePlayPause,
  onSeek
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sync video element with props
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  // Handle time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime)
    }
  }

  // Handle seeking
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 1) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime])

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative w-full h-full bg-black group">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.volume = volume
            videoRef.current.muted = isMuted
          }
        }}
        poster="/api/placeholder-video-poster.jpg"
      >
        {/* For demo, we'll show a placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-0 h-0 border-l-8 border-l-white border-y-6 border-y-transparent ml-1"></div>
            </div>
            <p className="text-white text-lg font-medium">{video.title}</p>
            <p className="text-gray-400 text-sm mt-2">Duration: {formatTime(video.duration)}</p>
          </div>
        </div>
      </video>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Controls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={video.duration}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          onTogglePlayPause={onTogglePlayPause}
          onSeek={onSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>

      {/* Loading State */}
      {video.status === 'processing' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Processing video...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
