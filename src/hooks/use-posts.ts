import { useState, useEffect, useCallback } from 'react'
import { postService } from '@/services/post.service'
import type { Post, PostWithComments } from '@/types/post.types'
import { useAuth } from '@/hooks/use-auth'

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
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes: isLiked
                    ? p.likes.filter((id) => id !== user.id)
                    : [...p.likes, user.id],
                  likedByCurrentUser: !isLiked,
                  likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
                }
              : p
          )
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to like post')
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
    toggleLike,
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

  const toggleLike = useCallback(async () => {
    if (!postId || !postData || !user) return

    try {
      const isLiked = postData.post.likedByCurrentUser || false

      if (isLiked) {
        await postService.unlikePost(postId, user.id)
      } else {
        await postService.likePost(postId, user.id)
      }

      setPostData({
        ...postData,
        post: {
          ...postData.post,
          likes: isLiked
            ? postData.post.likes.filter((id) => id !== user.id)
            : [...postData.post.likes, user.id],
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
