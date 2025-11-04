import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

const MAX_POST_LENGTH = 280
const MIN_POST_LENGTH = 1
const MAX_CONSECUTIVE_LINE_BREAKS = 3
const RATE_LIMIT_SECONDS = 3

interface PostSubmissionFormProps {
  onPostCreated: () => void
  onSubmit: (content: string) => Promise<void>
}

export function PostSubmissionForm({
  onPostCreated,
  onSubmit,
}: PostSubmissionFormProps) {
  const { user } = useAuth()
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastPostTime, setLastPostTime] = useState<number | null>(null)

  const sanitizeContent = (content: string): string => {
    return content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  const hasExcessiveLineBreaks = (content: string): boolean => {
    const pattern = new RegExp(`\\n{${MAX_CONSECUTIVE_LINE_BREAKS + 1},}`)
    return pattern.test(content)
  }

  const validatePost = (content: string): string | null => {
    const trimmedContent = content.trim()

    if (!user) {
      return 'You must be logged in to post'
    }

    if (!trimmedContent) {
      return 'Post cannot be empty'
    }

    if (trimmedContent.length < MIN_POST_LENGTH) {
      return 'Post is too short'
    }

    if (hasExcessiveLineBreaks(content)) {
      return 'Too many consecutive line breaks (max 3)'
    }

    if (lastPostTime) {
      const timeSinceLastPost = (Date.now() - lastPostTime) / 1000
      if (timeSinceLastPost < RATE_LIMIT_SECONDS) {
        const waitTime = Math.ceil(RATE_LIMIT_SECONDS - timeSinceLastPost)
        return `Please wait ${waitTime} second${
          waitTime !== 1 ? 's' : ''
        } before posting again`
      }
    }

    return null
  }

  const handleCreatePost = async () => {
    if (isSubmitting) return

    setError(null)

    const validationError = validatePost(newPostContent)
    if (validationError) {
      setError(validationError)
      return
    }

    const sanitizedContent = sanitizeContent(newPostContent.trim())

    try {
      setIsSubmitting(true)
      await onSubmit(sanitizedContent)
      setNewPostContent('')
      setLastPostTime(Date.now())
      setError(null)
      onPostCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPostDisabled = (): boolean => {
    if (isSubmitting) return true
    const trimmedContent = newPostContent.trim()
    if (!trimmedContent) return true
    if (trimmedContent.length < MIN_POST_LENGTH) return true
    if (hasExcessiveLineBreaks(newPostContent)) return true
    return false
  }

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <div className="bg-card rounded-lg shadow border p-4">
        <textarea
          className="w-full bg-background border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="What's on your mind?"
          rows={3}
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
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
