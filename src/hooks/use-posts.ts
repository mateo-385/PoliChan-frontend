import { useState, useEffect, useCallback } from 'react'
import { postService } from '@/services/post.service'
import type { Post, PostWithComments } from '@/types/post.types'
import { useAuth } from '@/hooks/use-auth'

// Helper to manage liked posts in localStorage (temporary solution until backend provides this)
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

// Hook to get all posts
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await postService.getAllPosts()
      // Ensure data is an array
      const postsArray = Array.isArray(data) ? data : []

      // If backend doesn't provide likedByCurrentUser, use local storage
      if (
        user &&
        postsArray.length > 0 &&
        postsArray[0].likedByCurrentUser === undefined
      ) {
        const likedPosts = getLikedPosts(user.id)
        const postsWithLikedStatus = postsArray.map((post) => ({
          ...post,
          likedByCurrentUser: likedPosts.has(post.id),
        }))
        setPosts(postsWithLikedStatus)
      } else {
        setPosts(postsArray)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
      setPosts([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user) {
        throw new Error('User must be logged in to like posts')
      }
      try {
        // Check if currently liked by looking at local state
        const post = posts.find((p) => p.id === postId)
        const isLiked = post?.likedByCurrentUser || false

        if (isLiked) {
          await postService.unlikePost(postId, user.id)
        } else {
          await postService.likePost(postId, user.id)
        }

        // Update local storage for persistence
        const likedPosts = getLikedPosts(user.id)
        if (isLiked) {
          likedPosts.delete(postId)
        } else {
          likedPosts.add(postId)
        }
        saveLikedPosts(user.id, likedPosts)

        // Update local state optimistically
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
        // Reload posts to sync with server on error
        await loadPosts()
      }
    },
    [user, posts, loadPosts]
  )

  const createPost = useCallback(
    async (content: string) => {
      if (!user) {
        throw new Error('User must be logged in to create a post')
      }
      try {
        await postService.createPost(user.id, content)
        await loadPosts() // Refresh posts
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create post')
        throw err
      }
    },
    [loadPosts, user]
  )

  return {
    posts,
    isLoading,
    error,
    refetch: loadPosts,
    toggleLike,
    createPost,
  }
}

// Hook to get a single post with comments
export function usePost(postId: string | undefined) {
  const [postData, setPostData] = useState<PostWithComments | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadPost = useCallback(async () => {
    if (!postId) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await postService.getPostById(postId)

      // If backend doesn't provide likedByCurrentUser, use local storage
      if (user && data.post.likedByCurrentUser === undefined) {
        const likedPosts = getLikedPosts(user.id)
        data.post.likedByCurrentUser = likedPosts.has(data.post.id)
      }

      setPostData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post')
    } finally {
      setIsLoading(false)
    }
  }, [postId, user])

  useEffect(() => {
    loadPost()
  }, [loadPost])

  const toggleLike = useCallback(async () => {
    if (!postId || !postData || !user) return

    try {
      const isLiked = postData.post.likedByCurrentUser || false

      if (isLiked) {
        await postService.unlikePost(postId, user.id)
      } else {
        await postService.likePost(postId, user.id)
      }

      // Update local storage for persistence
      const likedPosts = getLikedPosts(user.id)
      if (isLiked) {
        likedPosts.delete(postId)
      } else {
        likedPosts.add(postId)
      }
      saveLikedPosts(user.id, likedPosts)

      setPostData({
        ...postData,
        post: {
          ...postData.post,
          likedByCurrentUser: !isLiked,
          likesCount: isLiked
            ? postData.post.likesCount - 1
            : postData.post.likesCount + 1,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post')
    }
  }, [postId, postData, user])

  const toggleCommentLike = useCallback(
    async (commentId: string) => {
      if (!postData) return

      try {
        const updatedComment = await postService.toggleCommentLike(commentId)
        setPostData({
          ...postData,
          comments: postData.comments.map((c) =>
            c.id === commentId ? updatedComment : c
          ),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to like comment')
      }
    },
    [postData]
  )

  const createComment = useCallback(
    async (content: string) => {
      if (!postId || !postData) return

      try {
        const newComment = await postService.createComment({
          postId,
          content,
        })
        // Update state with new comment without full reload
        setPostData({
          ...postData,
          comments: [...postData.comments, newComment],
          post: {
            ...postData.post,
            commentsCount: (postData.post.commentsCount || 0) + 1,
          },
        })
        return newComment
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to post comment')
        throw err
      }
    },
    [postId, postData]
  )

  return {
    postData,
    isLoading,
    error,
    refetch: loadPost,
    toggleLike,
    toggleCommentLike,
    createComment,
  }
}

// Hook to get posts by user
export function useUserPosts(userId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const loadUserPosts = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await postService.getPostsByUserId(userId)
      // Ensure data is an array
      const postsArray = Array.isArray(data) ? data : []

      // If backend doesn't provide likedByCurrentUser, use local storage
      if (
        user &&
        postsArray.length > 0 &&
        postsArray[0].likedByCurrentUser === undefined
      ) {
        const likedPosts = getLikedPosts(user.id)
        const postsWithLikedStatus = postsArray.map((post) => ({
          ...post,
          likedByCurrentUser: likedPosts.has(post.id),
        }))
        setPosts(postsWithLikedStatus)
      } else {
        setPosts(postsArray)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user posts')
      setPosts([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }, [userId, user])

  useEffect(() => {
    loadUserPosts()
  }, [loadUserPosts])

  return {
    posts,
    isLoading,
    error,
    refetch: loadUserPosts,
  }
}
