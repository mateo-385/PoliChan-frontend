import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { postService } from '@/services/post.service'
import { PostCard } from '@/components/posts/PostCard'
import type { Post } from '@/types/post.types'
import { useAuth } from '@/hooks/use-auth'

const MAX_POST_LENGTH = 280
const MIN_POST_LENGTH = 1
const MAX_CONSECUTIVE_LINE_BREAKS = 3
const RATE_LIMIT_SECONDS = 10

export function FeedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastPostTime, setLastPostTime] = useState<number | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await postService.getAllPosts()
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

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
      await postService.createPost({ content: sanitizedContent })
      setNewPostContent('')
      setLastPostTime(Date.now())
      await loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleLike = async (postId: string) => {
    try {
      const updatedPost = await postService.toggleLike(postId)
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post')
    }
  }

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`)
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
    <div className="p-6   ">
      <div className="mb-5">
        <h2 className="text-3xl font-bold tracking-tight">Feed</h2>
        <p className="text-muted-foreground">
          Discover what's happening in your community
        </p>
      </div>

      <div className=" mx-auto space-y-4">
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

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow border p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="size-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-card rounded-lg shadow border p-8 text-center">
            <p className="text-muted-foreground">
              No posts yet. Be the first to share something!
            </p>
          </div>
        ) : (
          /* Posts List */
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleToggleLike}
              onClick={handlePostClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
