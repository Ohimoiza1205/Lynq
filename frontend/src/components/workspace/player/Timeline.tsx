import { VideoSegment } from '../../../types/video'

interface TimelineProps {
  duration: number
  currentTime: number
  segments: VideoSegment[]
  onSeek: (time: number) => void
}

const Timeline = ({ duration, currentTime, segments, onSeek }: TimelineProps) => {
  const getSegmentColor = (type: string) => {
    switch (type) {
      case 'procedure_step': return 'bg-blue-500'
      case 'key_moment': return 'bg-yellow-500'
      case 'anomaly': return 'bg-red-500'
      case 'milestone': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    onSeek(percentage * duration)
  }

  return (
    <div className="space-y-4">
      {/* Main Timeline */}
      <div className="relative">
        <div 
          className="w-full h-12 bg-gray-700 rounded-lg cursor-pointer relative overflow-hidden"
          onClick={handleTimelineClick}
        >
          {/* Segment Markers */}
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={`absolute top-0 h-full ${getSegmentColor(segment.type)} opacity-70 hover:opacity-90 transition-opacity`}
              style={{
                left: `${(segment.startTime / duration) * 100}%`,
                width: `${((segment.endTime - segment.startTime) / duration) * 100}%`
              }}
              title={`${segment.title} (${formatTime(segment.startTime)} - ${formatTime(segment.endTime)})`}
            />
          ))}

          {/* Current Time Indicator */}
          <div
            className="absolute top-0 w-1 h-full bg-white shadow-lg"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Time Labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>0:00</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Segment Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-300">Procedure Step</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-300">Key Moment</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-300">Milestone</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-300">Anomaly</span>
        </div>
      </div>

      {/* Current Segment Info */}
      {segments.map((segment) => {
        if (currentTime >= segment.startTime && currentTime <= segment.endTime) {
          return (
            <div key={segment.id} className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">{segment.title}</h4>
                  <p className="text-gray-400 text-sm">{segment.description}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                </div>
              </div>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export default Timeline
