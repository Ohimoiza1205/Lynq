import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react'

interface ControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isFullscreen: boolean
  onTogglePlayPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
  onToggleFullscreen: () => void
}

const Controls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen
}: ControlsProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    onSeek(percentage * duration)
  }

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    onSeek(newTime)
  }

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div 
        className="w-full h-2 bg-gray-600 rounded-full cursor-pointer group/progress"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-blue-500 rounded-full transition-all group-hover/progress:bg-blue-400"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-3 h-3 bg-white rounded-full ml-auto -mt-0.5 opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <button
            onClick={onTogglePlayPause}
            className="text-white hover:text-blue-400 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </button>

          {/* Skip Controls */}
          <button
            onClick={() => skip(-10)}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={() => skip(10)}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          {/* Time Display */}
          <div className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Volume Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleMute}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Controls
