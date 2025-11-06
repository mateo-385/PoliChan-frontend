import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Spinner } from '@/components/ui/spinner'

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
    <div className="space-y-4">
      <div className="bg-card rounded-lg shadow border p-4">
        <textarea
          className="w-full bg-background border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={placeholder}
          rows={4}
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          disabled={isSubmitting}
          maxLength={MAX_POST_LENGTH}
        />
        <div className="flex justify-between items-center mt-2">
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
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Spinner className="size-4" />}
            {isSubmitting ? buttonTextSubmitting : buttonText}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
