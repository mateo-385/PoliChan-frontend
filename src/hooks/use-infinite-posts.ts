import { useState, useEffect, useCallback, useRef } from 'react'
import { postService } from '@/services/post.service'
import type { Post } from '@/types/post.types'
import { useAuth } from '@/hooks/use-auth'

const LIKED_POSTS_KEY = 'liked_posts'

function getLikedPosts(userId: string): Set<string> {
  try {
    const stored = localStorage.getItem(`${LIKED_POSTS_KEY}_${userId}`)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function saveLikedPosts(userId: string, likedPosts: Set<string>) {
  try {
    localStorage.setItem(
      `${LIKED_POSTS_KEY}_${userId}`,
      JSON.stringify([...likedPosts])
    )
  } catch (error) {
    console.error('Failed to save liked posts:', error)
  }
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
  const { user } = useAuth()

  const lastPostIdRef = useRef<string | undefined>(undefined)

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

        let processedPosts = postsArray
        if (
          user &&
          postsArray.length > 0 &&
          postsArray[0].likedByCurrentUser === undefined
        ) {
          const likedPosts = getLikedPosts(user.id)
          processedPosts = postsArray.map((post) => ({
            ...post,
            likedByCurrentUser: likedPosts.has(post.id),
          }))
        }

        if (loadMore) {
          setPosts((prev) => [...prev, ...processedPosts])
        } else {
          setPosts(processedPosts)
        }

        if (processedPosts.length > 0) {
          lastPostIdRef.current = processedPosts[processedPosts.length - 1].id
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

  const loadMore = useCallback(() => {
    if (!isLoadingMore && !isLoading && hasMore) {
      loadPosts(true)
    }
  }, [isLoadingMore, isLoading, hasMore, loadPosts])

  const refetch = useCallback(() => {
    lastPostIdRef.current = undefined
    setHasMore(true)
    loadPosts(false)
  }, [loadPosts])

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

        const likedPosts = getLikedPosts(user.id)
        if (isLiked) {
          likedPosts.delete(postId)
        } else {
          likedPosts.add(postId)
        }
        saveLikedPosts(user.id, likedPosts)

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likedByCurrentUser: !isLiked,
                  likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
                }
              : p
          )
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
        await refetch()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create post')
        throw err
      }
    },
    [refetch, user]
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
  }
}
