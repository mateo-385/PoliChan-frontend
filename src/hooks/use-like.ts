import { useState, useEffect, useCallback } from 'react'

interface UseLikeOptions {
  initialLiked: boolean
  initialCount: number
  onLike: () => Promise<void>
  onUnlike: () => Promise<void>
}

/**
 * Generic hook for handling like/unlike operations with optimistic UI
 * Works for both posts and comments
 */
export function useLike({
  initialLiked,
  initialCount,
  onLike,
  onUnlike,
}: UseLikeOptions) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  // Sync with prop changes
  useEffect(() => {
    setIsLiked(initialLiked)
    setCount(initialCount)
  }, [initialLiked, initialCount])

  const toggleLike = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation()
      }

      if (isLoading) return

      // Optimistic update
      const previousLiked = isLiked
      const previousCount = count
      setIsLiked(!isLiked)
      setCount(isLiked ? count - 1 : count + 1)
      setIsLoading(true)

      try {
        if (isLiked) {
          await onUnlike()
        } else {
          await onLike()
        }
      } catch (error) {
        // Rollback on error
        setIsLiked(previousLiked)
        setCount(previousCount)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [isLiked, count, isLoading, onLike, onUnlike]
  )

  return {
    isLiked,
    count,
    isLoading,
    toggleLike,
    setIsLiked,
    setCount,
  }
}
