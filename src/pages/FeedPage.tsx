import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
import { postService } from '@/services/post.service'
import { PostCard, PostSubmissionForm } from '@/components/posts'
import type { Post } from '@/types/post.types'
import ModalPost from '@/components/ModalPost'

export function FeedPage() {
  // const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId)
    setIsModalOpen(true)
  }

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

  const handlePostSubmit = async (content: string) => {
    await postService.createPost({ content })
  }

  const handleToggleLike = async (postId: string) => {
    try {
      const updatedPost = await postService.toggleLike(postId)
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post')
    }
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
        <PostSubmissionForm
          onSubmit={handlePostSubmit}
          onPostCreated={loadPosts}
        />

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
        <ModalPost
          postId={selectedPostId!}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  )
}
