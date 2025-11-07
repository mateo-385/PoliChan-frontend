import { useState, useEffect, useCallback } from 'react'
import { postService } from '@/services/post.service'
import type { Post, PostWithComments } from '@/types/post.types'
import { useAuth } from '@/hooks/use-auth'
import { usePostUpdates } from '@/hooks/use-post-updates'

/**
 * Helper to check if current user liked posts and add computed property
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
 * Hook for loading and managing all posts (legacy - prefer useInfinitePosts)
 */
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
      const postsArray = Array.isArray(data) ? data : []

      const postsWithLikedStatus = processPostsWithLikeStatus(
        postsArray,
        user?.id
      )
      setPosts(postsWithLikedStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  // Handle WebSocket updates
  usePostUpdates({
    onNewPost: () => loadPosts(), // Reload all posts on new post
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
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
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
      )
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

  const createPost = useCallback(
    async (content: string) => {
      if (!user) {
        throw new Error('User must be logged in to create a post')
      }
      try {
        await postService.createPost(user.id, content)
        await loadPosts()
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
    createPost,
  }
}

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

      const postWithLikedStatus = {
        ...data,
        post: {
          ...data.post,
          likedByCurrentUser: user ? data.post.likes.includes(user.id) : false,
        },
        comments: data.comments.map((comment) => ({
          ...comment,
          likedByCurrentUser: user ? comment.likes.includes(user.id) : false,
        })),
      }

      setPostData(postWithLikedStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post')
    } finally {
      setIsLoading(false)
    }
  }, [postId, user])

  useEffect(() => {
    loadPost()
  }, [loadPost])

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
      if (!postId || !postData || !user) return

      try {
        const newComment = await postService.createComment({
          postId,
          userId: user.id,
          content,
        })
        setPostData({
          ...postData,
          comments: [newComment, ...postData.comments],
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
    [postId, postData, user]
  )

  return {
    postData,
    isLoading,
    error,
    refetch: loadPost,
    toggleCommentLike,
    createComment,
  }
}

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
      const postsArray = Array.isArray(data) ? data : []

      const postsWithLikedStatus = processPostsWithLikeStatus(
        postsArray,
        user?.id
      )
      setPosts(postsWithLikedStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user posts')
      setPosts([])
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
