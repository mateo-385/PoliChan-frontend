// import { postRepository } from '@/repositories/post.repository'
import { mockPostRepository as postRepository } from '@/repositories/post.repository.mock'
import type {
  Post,
  Comment,
  CreatePostData,
  CreateCommentData,
  PostWithComments,
} from '@/types/post.types'

class PostService {
  setCurrentUserId(userId: string | null): void {
    postRepository.setCurrentUserId(userId)
  }

  async getAllPosts(): Promise<Post[]> {
    return await postRepository.getAllPosts()
  }

  async getPostById(postId: string): Promise<PostWithComments> {
    return await postRepository.getPostById(postId)
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    const allPosts = await postRepository.getAllPosts()
    return allPosts.filter((post) => post.authorId === userId)
  }

  async createPost(data: CreatePostData): Promise<Post> {
    if (!data.content.trim()) {
      throw new Error('Post content cannot be empty')
    }
    return await postRepository.createPost(data)
  }

  async createComment(data: CreateCommentData): Promise<Comment> {
    if (!data.content.trim()) {
      throw new Error('Comment content cannot be empty')
    }
    return await postRepository.createComment(data)
  }

  async toggleLike(postId: string): Promise<Post> {
    return await postRepository.toggleLike(postId)
  }

  async toggleCommentLike(commentId: string): Promise<Comment> {
    return await postRepository.toggleCommentLike(commentId)
  }

  formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays}d ago`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}mo ago`
  }
}

export const postService = new PostService()
