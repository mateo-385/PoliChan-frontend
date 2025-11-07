import { useState, useEffect, useCallback, useRef } from 'react'
import { postService } from '@/services/post.service'
import type { Post } from '@/types/post.types'
import { useAuth } from '@/hooks/use-auth'
import { usePostUpdates } from '@/hooks/use-post-updates'

/**
 * Helper to check if current user liked a post and add computed property
 */
function processPostsWithLikeStatus(
  posts: Post[],
  userId: string | undefined
): Post[] {
  if (!userId) return posts

  return posts.map((post) => ({
    ...post,
    likedByCurrentUser: post.likes?.includes(userId) || false,
  }))
}

/**
 * Hook for infinite scroll timeline with WebSocket updates
 * Responsibilities:
 * - Load and paginate posts
 * - Track new posts count
 * - Create posts
 * - Sync WebSocket updates
 */
export function useInfinitePosts(limit: number = 20) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [newPostsCount, setNewPostsCount] = useState(0)
  const { user } = useAuth()

  const lastPostIdRef = useRef<string | undefined>(undefined)
  const firstPostIdRef = useRef<string | undefined>(undefined)

  const loadPosts = useCallback(
    async (loadMore = false) => {
      try {
        if (loadMore) {
          setIsLoadingMore(true)
        } else {
          setIsLoading(true)
        }
        setError(null)

        await new Promise((resolve) => setTimeout(resolve, 500))

        const params = {
          limit,
          afterPostId: loadMore ? lastPostIdRef.current : undefined,
        }

        const data = await postService.getTimelinePosts(params)
        const postsArray = Array.isArray(data) ? data : []

        const processedPosts = processPostsWithLikeStatus(postsArray, user?.id)

        if (loadMore) {
          setPosts((prev) => [...prev, ...processedPosts])
        } else {
          setPosts(processedPosts)
        }

        if (processedPosts.length > 0) {
          lastPostIdRef.current = processedPosts[processedPosts.length - 1].id
          if (!loadMore) {
            firstPostIdRef.current = processedPosts[0].id
          }
        }

        if (processedPosts.length < limit) {
          setHasMore(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts')
        setPosts([])
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [limit, user]
  )

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle WebSocket updates
  usePostUpdates({
    onNewPost: () => setNewPostsCount((prev) => prev + 1),
    onPostLiked: (postId, userId) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const newLikes = post.likes.includes(userId)
              ? post.likes
              : [...post.likes, userId]

            return {
              ...post,
              likes: newLikes,
              likesCount: newLikes.length,
              likedByCurrentUser: user ? newLikes.includes(user.id) : false,
            }
          }
          return post
        })
      )
    },
    onPostUnliked: (postId, userId) => {
      setPosts((prevPosts) => {
        const updated = prevPosts.map((post) => {
          if (post.id === postId) {
            const newLikes = post.likes.filter((id) => id !== userId)

            return {
              ...post,
              likes: newLikes,
              likesCount: newLikes.length,
              likedByCurrentUser: user ? newLikes.includes(user.id) : false,
            }
          }
          return post
        })
        return updated
      })
    },
    onCommentCreated: (postId) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              commentsCount: (post.commentsCount || 0) + 1,
            }
          }
          return post
        })
      )
    },
  })

  const loadMore = useCallback(() => {
    if (!isLoadingMore && !isLoading && hasMore) {
      loadPosts(true)
    }
  }, [isLoadingMore, isLoading, hasMore, loadPosts])

  const refetch = useCallback(() => {
    lastPostIdRef.current = undefined
    setHasMore(true)
    setNewPostsCount(0)
    loadPosts(false)
  }, [loadPosts])

  const loadNewPosts = useCallback(async () => {
    try {
      setError(null)

      // Small delay to let backend process the post
      await new Promise((resolve) => setTimeout(resolve, 300))

      const data = await postService.getTimelinePosts({ limit: 50 })
      const postsArray = Array.isArray(data) ? data : []

      const currentFirstId = firstPostIdRef.current

      if (!currentFirstId) {
        const processedPosts = processPostsWithLikeStatus(postsArray, user?.id)

        // Only replace if we actually have posts, otherwise keep existing
        if (processedPosts.length > 0) {
          setPosts(processedPosts)
          firstPostIdRef.current = processedPosts[0].id
        }
        setNewPostsCount(0)
        return
      }

      const firstPostIndex = postsArray.findIndex(
        (p) => p.id === currentFirstId
      )

      const newPosts =
        firstPostIndex > 0 ? postsArray.slice(0, firstPostIndex) : []

      if (newPosts.length > 0) {
        const processedPosts = processPostsWithLikeStatus(newPosts, user?.id)

        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          const uniqueNewPosts = processedPosts.filter(
            (p) => !existingIds.has(p.id)
          )

          return [...uniqueNewPosts, ...prev]
        })
        firstPostIdRef.current = processedPosts[0].id
      }

      setNewPostsCount(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load new posts')
    }
  }, [user])

  const createPost = useCallback(
    async (content: string) => {
      if (!user) {
        throw new Error('User must be logged in to create a post')
      }
      try {
        await postService.createPost(user.id, content)

        await loadNewPosts()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create post')
        throw err
      }
    },
    [user, loadNewPosts]
  )

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
    createPost,
    newPostsCount,
    loadNewPosts,
  }
}
