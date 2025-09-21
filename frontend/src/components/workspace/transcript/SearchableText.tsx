interface SearchableTextProps {
  text: string
  searchQuery: string
  className?: string
}

const SearchableText = ({ text, searchQuery, className = '' }: SearchableTextProps) => {
  if (!searchQuery.trim()) {
    return <div className={className}>{text}</div>
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <div className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-400 text-black px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </div>
  )
}

export default SearchableText
