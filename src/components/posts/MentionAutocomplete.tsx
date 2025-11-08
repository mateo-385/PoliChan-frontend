import { useEffect, useState, useRef } from 'react'
import type { User } from '@/types/auth.types'
import { userService } from '@/services/user.service'
import { useIsMobile } from '@/hooks/use-mobile'

interface MentionAutocompleteProps {
  isOpen: boolean
  query: string
  onSelectUser: (user: User) => void
  onClose?: () => void
  currentUserId?: string
  position?: {
    top: number
    left: number
  }
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export function MentionAutocomplete({
  isOpen,
  query,
  onSelectUser,
  onClose,
  currentUserId,
  position = { top: 0, left: 0 },
}: MentionAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isOpen) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        console.log('Fetching suggestions for query:', query)
        const results = await userService.getMentionSuggestions(
          query,
          currentUserId
        )
        console.log('Got suggestions:', results)
        setSuggestions(results)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Error fetching mention suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce the search
    const timer = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(timer)
  }, [query, isOpen, currentUserId])

  // Expose keyboard navigation through window event
  useEffect(() => {
    if (!isOpen || suggestions.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % suggestions.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev === 0 ? suggestions.length - 1 : prev - 1
          )
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          if (suggestions[selectedIndex]) {
            onSelectUser(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setSuggestions([])
          break
      }
    }

    // Attach to document to capture keyboard events from textarea
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, suggestions, selectedIndex, onSelectUser])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (onClose) {
          onClose()
        } else {
          setSuggestions([])
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Don't render if closed, even if there are suggestions
  if (!isOpen) {
    return null
  }

  // On mobile, constrain the dropdown to viewport
  const adjustedPosition = { ...position }
  if (isMobile) {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    
    // Constrain to viewport with padding
    const padding = 10
    const dropdownWidth = Math.min(300, viewport.width - padding * 2)
    
    adjustedPosition.left = Math.max(
      padding,
      Math.min(position.left, viewport.width - dropdownWidth - padding)
    )
    
    // If dropdown goes below viewport, show it above the textarea instead
    if (adjustedPosition.top + 256 > viewport.height) {
      adjustedPosition.top = Math.max(padding, adjustedPosition.top - 256 - 50)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`fixed bg-card border border-input rounded-lg shadow-lg z-50 overflow-y-auto ${
        isMobile ? 'max-w-[220px]' : 'max-w-xs'
      } max-h-60`}
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`,
        width: isMobile ? '220px' : undefined,
      }}
    >
      {isLoading ? (
        <div className={`p-2 text-xs text-muted-foreground text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Buscando usuarios...
        </div>
      ) : suggestions.length === 0 ? (
        <div className={`p-2 text-xs text-muted-foreground text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
          No se encontraron usuarios
        </div>
      ) : (
        <ul className={isMobile ? 'py-0.5' : 'py-1'}>
          {suggestions.map((user, index) => (
            <li
              key={user.id}
              className={`px-2 py-1.5 cursor-pointer transition-colors ${
                isMobile ? 'text-xs' : 'text-sm'
              } ${
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => onSelectUser(user)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex flex-col gap-0.5">
                <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  @{user.username}
                </span>
                <span className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
