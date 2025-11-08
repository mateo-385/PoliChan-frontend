import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Spinner } from '@/components/ui/spinner'
import { useIsMobile } from '@/hooks/use-mobile'
import { MentionAutocomplete } from '@/components/posts/MentionAutocomplete'
import type { User } from '@/types/auth.types'

const MAX_POST_LENGTH = 280
const MIN_POST_LENGTH = 1
const MAX_CONSECUTIVE_LINE_BREAKS = 3
const MAX_TOTAL_LINE_BREAKS = 5
const RATE_LIMIT_SECONDS = 3

interface PostSubmissionFormProps {
  onPostCreated: () => void
  onSubmit: (content: string) => Promise<void>
  placeholder?: string
  buttonText?: string
  buttonTextSubmitting?: string
}

export function PostSubmissionForm({
  onPostCreated,
  onSubmit,
  placeholder = '¿Qué estás pensando?',
  buttonText = 'Publicar',
  buttonTextSubmitting = 'Publicando...',
}: PostSubmissionFormProps) {
  const { user } = useAuth()
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastPostTime, setLastPostTime] = useState<number | null>(null)
  const [mentionQuery, setMentionQuery] = useState<string>('')
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [autocompletePosition, setAutocompletePosition] = useState({
    top: 0,
    left: 0,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobile()

  /**
   * Detect @ mentions in the text
   * When user types @something, show autocomplete
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const cursorPos = e.target.selectionStart

    setNewPostContent(text)
    setCursorPosition(cursorPos)

    // Find the last @ symbol before cursor
    const textBeforeCursor = text.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    console.log('handleTextChange:', {
      text,
      cursorPos,
      lastAtIndex,
      textBeforeCursor,
    })

    if (lastAtIndex === -1) {
      setShowMentionAutocomplete(false)
      setMentionQuery('')
      return
    }

    // Check if there's a space before @ (to avoid matching @mentions mid-word)
    if (
      lastAtIndex > 0 &&
      text[lastAtIndex - 1] !== ' ' &&
      text[lastAtIndex - 1] !== '\n'
    ) {
      setShowMentionAutocomplete(false)
      setMentionQuery('')
      return
    }

    // Extract query after @
    const query = textBeforeCursor.substring(lastAtIndex + 1)

    console.log('Query:', query, 'Valid:', /^[a-zA-Z0-9_]*$/.test(query))

    // Only show autocomplete if query is alphanumeric/underscore and less than 30 chars
    if (/^[a-zA-Z0-9_]*$/.test(query) && query.length < 30) {
      setMentionQuery(query)
      setShowMentionAutocomplete(true)

      // Calculate position for autocomplete popup
      if (textareaRef.current) {
        const textarea = textareaRef.current
        const metrics = textarea.getBoundingClientRect()
        const lineHeight = parseInt(
          window.getComputedStyle(textarea).lineHeight
        )

        // Rough calculation of cursor position
        // This is approximate - the exact calculation would require canvas measurement
        const lines = textBeforeCursor.split('\n').length - 1
        const topOffset = lines * lineHeight + 30

        const top = Math.floor(metrics.top + topOffset)
        const left = Math.floor(metrics.left + 10)

        console.log('Autocomplete position:', {
          top,
          left,
          metrics,
          lineHeight,
          lines,
        })

        setAutocompletePosition({
          top,
          left,
        })
      }
    } else {
      setShowMentionAutocomplete(false)
      setMentionQuery('')
    }
  }

  /**
   * Handle keyboard events in the textarea
   * No longer needed as MentionAutocomplete handles keyboard events globally
   */
  const handleTextKeyDown = () => {
    // Keyboard navigation is now handled by MentionAutocomplete component
    // This handler is kept for potential future use
  }

  /**
   * Handle user selection from mention autocomplete
   */
  const handleSelectMentionedUser = (selectedUser: User) => {
    const cursorPos = cursorPosition

    if (!textareaRef.current) return

    const text = newPostContent
    const textBeforeCursor = text.substring(0, cursorPos)
    const textAfterCursor = text.substring(cursorPos)

    // Find the last @ symbol
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex === -1) return

    // Replace from @ to cursor with @username
    const beforeAt = text.substring(0, lastAtIndex)
    const mention = `@${selectedUser.username}`
    const newContent = beforeAt + mention + ' ' + textAfterCursor

    setNewPostContent(newContent)
    setShowMentionAutocomplete(false)
    setMentionQuery('')

    // Move cursor after the inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = lastAtIndex + mention.length + 1
        textareaRef.current.selectionStart = newCursorPos
        textareaRef.current.selectionEnd = newCursorPos
        textareaRef.current.focus()
      }
    }, 0)
  }

  const sanitizeContent = (content: string): string => {
    let sanitized = content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/`/g, '&#96;')

    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE|CAST|CONVERT)\b)/gi,
      /(--|;|\/\*|\*\/)/g,
      /(\bOR\b.*=.*)/gi,
      /(\bAND\b.*=.*)/gi,
    ]

    sqlPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '')
    })

    const excessiveBreaks = '\n'.repeat(MAX_CONSECUTIVE_LINE_BREAKS + 1)
    const allowedBreaks = '\n'.repeat(MAX_CONSECUTIVE_LINE_BREAKS)

    while (sanitized.includes(excessiveBreaks)) {
      sanitized = sanitized.replace(excessiveBreaks, allowedBreaks)
    }

    const lineBreakCount = (sanitized.match(/\n/g) || []).length
    if (lineBreakCount > MAX_TOTAL_LINE_BREAKS) {
      const lines = sanitized.split('\n')
      sanitized = lines.slice(0, MAX_TOTAL_LINE_BREAKS + 1).join('\n')
    }

    return sanitized
  }

  const validatePost = (content: string): string | null => {
    const trimmedContent = content.trim()

    if (!user) {
      return 'Debes iniciar sesión para publicar'
    }

    if (!trimmedContent) {
      return 'La publicación no puede estar vacía'
    }

    if (trimmedContent.length < MIN_POST_LENGTH) {
      return 'La publicación es muy corta'
    }

    if (lastPostTime) {
      const timeSinceLastPost = (Date.now() - lastPostTime) / 1000
      if (timeSinceLastPost < RATE_LIMIT_SECONDS) {
        const waitTime = Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastPost)
        return `Por favor espera ${waitTime} segundo${
          waitTime !== 1 ? 's' : ''
        } antes de publicar de nuevo`
      }
    }

    return null
  }

  const handleCreatePost = async () => {
    if (isSubmitting) return

    setError(null)

    const sanitizedContent = sanitizeContent(newPostContent.trim())

    const validationError = validatePost(sanitizedContent)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(sanitizedContent)
      setNewPostContent('')
      setLastPostTime(Date.now())
      setError(null)
      onPostCreated()
    } catch (err) {
      console.error('Error in handleCreatePost:', err)
      setError(
        err instanceof Error ? err.message : 'Error al crear la publicación'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPostDisabled = (): boolean => {
    if (isSubmitting) return true
    const trimmedContent = newPostContent.trim()
    if (!trimmedContent) return true
    if (trimmedContent.length < MIN_POST_LENGTH) return true
    if (trimmedContent.length > MAX_POST_LENGTH) return true
    return false
  }

  return (
    <div className={isMobile ? 'space-y-2' : 'space-y-4'}>
      <div
        className={
          isMobile
            ? 'bg-card rounded-lg shadow border p-3'
            : 'bg-card rounded-lg shadow border p-4'
        }
      >
        <textarea
          ref={textareaRef}
          className={
            isMobile
              ? 'w-full bg-background border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary'
              : 'w-full bg-background border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary'
          }
          placeholder={placeholder}
          rows={isMobile ? 3 : 4}
          value={newPostContent}
          onChange={handleTextChange}
          onKeyDown={handleTextKeyDown}
          disabled={isSubmitting}
          maxLength={MAX_POST_LENGTH}
        />
        <MentionAutocomplete
          isOpen={showMentionAutocomplete}
          query={mentionQuery}
          onSelectUser={handleSelectMentionedUser}
          onClose={() => setShowMentionAutocomplete(false)}
          currentUserId={user?.id}
          position={autocompletePosition}
        />
        <div
          className={
            isMobile
              ? 'flex justify-between items-center mt-1.5'
              : 'flex justify-between items-center mt-2'
          }
        >
          <span
            className={`text-xs ${
              newPostContent.length > MAX_POST_LENGTH * 0.9
                ? 'text-orange-500'
                : 'text-muted-foreground'
            }`}
          >
            {newPostContent.length}/{MAX_POST_LENGTH}
          </span>
          <button
            onClick={handleCreatePost}
            disabled={isPostDisabled()}
            className={
              isMobile
                ? 'px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                : 'px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            }
          >
            {isSubmitting && <Spinner className="size-4" />}
            {isSubmitting ? buttonTextSubmitting : buttonText}
          </button>
        </div>
      </div>

      {error && (
        <div
          className={
            isMobile
              ? 'bg-destructive/10 border border-destructive rounded-lg p-2 text-destructive text-xs'
              : 'bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive text-sm'
          }
        >
          {error}
        </div>
      )}
    </div>
  )
}
