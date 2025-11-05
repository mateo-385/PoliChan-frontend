import { useState, useEffect, useCallback } from 'react'
import { postService } from '@/services/post.service'
import type { Post, PostWithComments } from '@/types/post.types'

// Hook to get all posts
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const toggleLike = useCallback(async (postId: string) => {
    try {
      const { liked } = await postService.toggleLike(postId)
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByCurrentUser: liked,
                likesCount: liked ? p.likesCount + 1 : p.likesCount - 1,
              }
            : p
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post')
    }
  }, [])

  const createPost = useCallback(
    async (content: string) => {
      try {
        await postService.createPost({ content })
        await loadPosts() // Refresh posts
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create post')
        throw err
      }
    },
    [loadPosts]
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

  const loadPost = useCallback(async () => {
    if (!postId) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await postService.getPostById(postId)
      setPostData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post')
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    loadPost()
  }, [loadPost])

  const toggleLike = useCallback(async () => {
    if (!postId || !postData) return

    try {
      const { liked } = await postService.toggleLike(postId)
      setPostData({
        ...postData,
        post: {
          ...postData.post,
          likedByCurrentUser: liked,
          likesCount: liked
            ? postData.post.likesCount + 1
            : postData.post.likesCount - 1,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post')
    }
  }, [postId, postData])

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
            commentsCount: postData.post.commentsCount + 1,
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

  const loadUserPosts = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await postService.getPostsByUserId(userId)
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user posts')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

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
