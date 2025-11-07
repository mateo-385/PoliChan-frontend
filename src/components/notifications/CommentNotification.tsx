import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { MessageCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

interface CommentNotificationProps {
  userName: string
  postId: string
  onSeePost: (postId: string) => void
  onDismiss: () => void
}

export function CommentNotification({
  userName,
  postId,
  onSeePost,
  onDismiss,
}: CommentNotificationProps) {
  const isMobile = useIsMobile()

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const handleSeePost = () => {
    onSeePost(postId)
    onDismiss()
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss()
  }

  return (
    <Alert
      className={
        isMobile
          ? 'w-[calc(100vw-2rem)] max-w-xs p-3 cursor-pointer transition-colors z-50'
          : 'w-96 cursor-pointer hover:bg-accent/50 transition-colors z-[3000px]'
      }
      onClick={handleSeePost}
    >
      <MessageCircle className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
      <AlertTitle className={isMobile ? 'text-sm' : ''}>
        <span className="font-bold">{userName}</span> comentó en tu publicación
      </AlertTitle>
      <AlertDescription
        className={
          isMobile ? 'text-xs text-muted-foreground' : 'text-muted-foreground'
        }
      >
        Toca para ver el comentario
      </AlertDescription>
      <button
        onClick={handleClose}
        className={
          isMobile
            ? 'absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground z-10'
            : 'absolute top-2 right-2 text-muted-foreground hover:text-foreground z-10'
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isMobile ? '14' : '16'}
          height={isMobile ? '14' : '16'}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </Alert>
  )
}
