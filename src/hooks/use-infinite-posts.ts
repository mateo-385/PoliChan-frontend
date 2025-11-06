import { useState, useEffect, useCallback, useRef } from 'react'
import { postService } from '@/services/post.service'
import type { Post } from '@/types/post.types'
import { useAuth } from '@/hooks/use-auth'

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
 * Hook for infinite scroll timeline
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

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const custom = e as CustomEvent
        const payload = custom.detail as {
          postId: string
          userId: string
        }

        if (!payload || !payload.postId) return

        if (user && payload.userId === user.id) return

        setNewPostsCount((prev) => prev + 1)
      } catch {
        // Ignore invalid post-created events
      }
    }

    window.addEventListener('post-created', handler as EventListener)
    return () =>
      window.removeEventListener('post-created', handler as EventListener)
  }, [user])

  useEffect(() => {
    const handleLike = (e: Event) => {
      try {
        const custom = e as CustomEvent
        const payload = custom.detail as {
          postId: string
          userId: string
        }

        if (!payload || !payload.postId) return

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === payload.postId) {
              const newLikes = post.likes.includes(payload.userId)
                ? post.likes
                : [...post.likes, payload.userId]

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
      } catch {
        // Ignore invalid like-created events
      }
    }

    const handleUnlike = (e: Event) => {
      try {
        const custom = e as CustomEvent
        const payload = custom.detail as {
          postId: string
          userId: string
        }

        if (!payload || !payload.postId) return

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === payload.postId) {
              const newLikes = post.likes.filter((id) => id !== payload.userId)

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
      } catch {
        // Ignore invalid like-deleted events
      }
    }

    window.addEventListener('like-created', handleLike as EventListener)
    window.addEventListener('like-deleted', handleUnlike as EventListener)

    return () => {
      window.removeEventListener('like-created', handleLike as EventListener)
      window.removeEventListener('like-deleted', handleUnlike as EventListener)
    }
  }, [user])

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

      const data = await postService.getTimelinePosts({ limit: 50 })
      const postsArray = Array.isArray(data) ? data : []

      const currentFirstId = firstPostIdRef.current || posts[0]?.id

      if (!currentFirstId) {
        const processedPosts = processPostsWithLikeStatus(postsArray, user?.id)
        setPosts(processedPosts)
        if (processedPosts.length > 0) {
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

        setPosts((prev) => [...processedPosts, ...prev])
        firstPostIdRef.current = processedPosts[0].id
      }

      setNewPostsCount(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load new posts')
    }
  }, [user, posts])

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) {
        throw new Error('User must be logged in to like posts')
      }
      try {
        const post = posts.find((p) => p.id === postId)
        const isLiked = post?.likedByCurrentUser || false

        if (isLiked) {
          await postService.unlikePost(postId, user.id)
        } else {
          await postService.likePost(postId, user.id)
        }

        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.id === postId) {
              const newLikes = isLiked
                ? p.likes.filter((id) => id !== user.id)
                : [...p.likes, user.id]

              return {
                ...p,
                likes: newLikes,
                likedByCurrentUser: !isLiked,
                likesCount: newLikes.length,
              }
            }
            return p
          })
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to like post')
        await refetch()
      }
    },
    [user, posts, refetch]
  )

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
    toggleLike,
    createPost,
    newPostsCount,
    loadNewPosts,
  }
}
