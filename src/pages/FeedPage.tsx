import { useState, useEffect, useRef } from 'react'
import { PostCard, PostSubmissionForm } from '@/components/posts'
import { ModalPost } from '@/components/posts/ModalPost'
import { useInfinitePosts } from '@/hooks/use-infinite-posts'
import { Loader2, ArrowUp, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useIsMobile } from '@/hooks/use-mobile'

export function FeedPage() {
  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    createPost,
    loadMore,
    newPostsCount,
    loadNewPosts,
  } = useInfinitePosts(5)

  const { user } = useAuth()
  const isMobile = useIsMobile()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set())
  const [isAtTop, setIsAtTop] = useState(true)
  const [isLoadingNew, setIsLoadingNew] = useState(false)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const previousFirstPostIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (posts.length === 0) return

    const currentFirstPostId = posts[0].id

    if (previousFirstPostIdRef.current) {
      const previousFirstIndex = posts.findIndex(
        (p) => p.id === previousFirstPostIdRef.current
      )

      if (previousFirstIndex > 0) {
        // Only animate the first new post
        const firstNewPostId = posts[0].id
        const newIds = new Set([firstNewPostId])
        setNewPostIds(newIds)

        const timer = setTimeout(() => {
          setNewPostIds(new Set())
        }, 1000)

        previousFirstPostIdRef.current = currentFirstPostId
        return () => clearTimeout(timer)
      }
    }

    previousFirstPostIdRef.current = currentFirstPostId
  }, [posts])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      {
        rootMargin: '200px',
      }
    )

    observer.observe(sentinel)

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [hasMore, isLoadingMore, loadMore])

  useEffect(() => {
    const topSentinel = topSentinelRef.current
    if (!topSentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting
        setIsAtTop(isVisible)

        if (isVisible && newPostsCount > 0 && !isLoadingNew) {
          setIsLoadingNew(true)
          loadNewPosts().finally(() => {
            setIsLoadingNew(false)
          })
        }
      },
      {
        rootMargin: '0px',
        threshold: 0.1,
      }
    )

    observer.observe(topSentinel)

    return () => {
      if (topSentinel) {
        observer.unobserve(topSentinel)
      }
    }
  }, [newPostsCount, isLoadingNew, loadNewPosts])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsAtTop(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const handleOpenPostModal = (event: Event) => {
      const customEvent = event as CustomEvent<{ postId: string }>
      if (customEvent.detail?.postId) {
        handlePostClick(customEvent.detail.postId)
      }
    }

    window.addEventListener('open-post-modal', handleOpenPostModal)

    return () => {
      window.removeEventListener('open-post-modal', handleOpenPostModal)
    }
  }, [])

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId)
    setIsModalOpen(true)
  }

  const handlePostSubmit = async (content: string) => {
    await createPost(content)
  }

  const handleNewPostsClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      loadNewPosts()
    }, 300)
  }

  return (
    <div className={isMobile ? 'px-0 pt-3 pb-4' : 'p-6'}>
      <div className={isMobile ? 'mb-3 px-3' : 'mb-5'}>
        <h2
          className={
            isMobile
              ? 'text-xl font-bold tracking-tight truncate'
              : 'text-3xl font-bold tracking-tight truncate'
          }
        >
          ¡Hola, {user?.firstName}!
        </h2>
        <p
          className={
            isMobile ? 'text-sm text-muted-foreground' : 'text-muted-foreground'
          }
        >
          Comparte tus ideas y conecta con otros estudiantes
        </p>
      </div>
      {newPostsCount > 0 && !isAtTop && (
        <div
          className={`fixed top-20 z-50   animate-in fade-in slide-in-from-top-4 duration-300 ${
            isMobile
              ? 'left-1/2 -translate-x-1/2'
              : 'left-100 right-50 flex justify-center'
          }`}
        >
          <Button
            onClick={handleNewPostsClick}
            className="shadow-lg hover:shadow-xl rounded-full cursor-pointer"
            size="lg"
          >
            <ArrowUp className="animate-bounce" />
            {newPostsCount === 1
              ? 'Nueva publicación'
              : `${newPostsCount} nuevas publicaciones`}
          </Button>
        </div>
      )}
      {isLoadingNew && isAtTop && (
        <div
          className={`fixed top-20 z-50 animate-in fade-in slide-in-from-top-4 duration-300 ${
            isMobile
              ? 'left-1/2 -translate-x-1/2'
              : 'left-100 right-50 flex justify-center'
          }`}
        >
          <Button
            className="shadow-lg rounded-full pointer-events-none"
            size="lg"
          >
            <RotateCw className="animate-spin" />
            Cargando nuevas publicaciones...
          </Button>
        </div>
      )}
      <div className=" mx-auto space-y-3">
        <div ref={topSentinelRef} className="h-1" />
        <PostSubmissionForm
          onSubmit={handlePostSubmit}
          onPostCreated={loadNewPosts}
          placeholder="¿Qué estás pensando?"
        />

        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow border p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="size-10 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex items-center gap-6 pt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-card rounded-lg shadow border p-8 text-center">
            <p className="text-muted-foreground">
              No hay publicaciones aún. ¡Sé el primero en compartir algo!
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div
                key={post.id}
                className={
                  newPostIds.has(post.id)
                    ? 'animate-in fade-in slide-in-from-top-2 duration-500'
                    : ''
                }
              >
                <PostCard post={post} onClick={handlePostClick} />
              </div>
            ))}

            <div ref={sentinelRef} className="h-4" />

            {isLoadingMore && (
              <div className="flex justify-center py-8">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay más publicaciones
              </div>
            )}
          </>
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
