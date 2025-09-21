import { useState } from 'react'
import { VideoTranscript } from '../../../types/video'
import SearchableText from './SearchableText'
import { Search, Download } from 'lucide-react'

interface TranscriptProps {
  transcript: VideoTranscript | null
  currentTime: number
  onSeek: (time: number) => void
}

const Transcript = ({ transcript, currentTime, onSeek }: TranscriptProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedSegments, setHighlightedSegments] = useState<string[]>([])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!transcript || !query.trim()) {
      setHighlightedSegments([])
      return
    }

    const matches = transcript.segments.filter(segment =>
      segment.text.toLowerCase().includes(query.toLowerCase())
    )
    setHighlightedSegments(matches.map(m => m.id))
  }

  const exportTranscript = () => {
    if (!transcript) return

    const text = transcript.segments
      .map(segment => `[${formatTime(segment.startTime)}] ${segment.text}`)
      .join('\n\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transcript.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!transcript) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">No transcript available</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white">Transcript</h3>
          <button
            onClick={exportTranscript}
            className="text-gray-400 hover:text-white transition-colors"
            title="Export transcript"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {highlightedSegments.length > 0 && (
          <p className="text-xs text-blue-400 mt-2">
            {highlightedSegments.length} result(s) found
          </p>
        )}
      </div>

      {/* Transcript Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcript.segments.map((segment) => {
          const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime
          const isHighlighted = highlightedSegments.includes(segment.id)

          return (
            <div
              key={segment.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-600/20 border border-blue-500/50'
                  : isHighlighted
                  ? 'bg-yellow-600/20 border border-yellow-500/50'
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
              onClick={() => onSeek(segment.startTime)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-blue-400 font-mono">
                  {formatTime(segment.startTime)}
                </span>
                {segment.speaker && (
                  <span className="text-xs text-gray-400">{segment.speaker}</span>
                )}
              </div>
              
              <SearchableText
                text={segment.text}
                searchQuery={searchQuery}
                className="text-gray-200 leading-relaxed"
              />
              
              {segment.confidence < 0.9 && (
                <div className="mt-2 text-xs text-yellow-400">
                  Low confidence: {Math.round(segment.confidence * 100)}%
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Transcript
