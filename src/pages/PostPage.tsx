import { useParams } from 'react-router-dom'

export function PostPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        {/* Post */}
        <div className="bg-card rounded-lg shadow border p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full font-bold text-lg">
              U
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Username</h3>
                <span className="text-muted-foreground text-sm">· 2h ago</span>
              </div>
              <p className="mt-3 text-foreground text-base leading-relaxed">
                This is the full post content for post #{id}. In a real
                application, this would be fetched from your API based on the
                post ID.
              </p>
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <span>💬 15 Comments</span>
                <span>❤️ 42 Likes</span>
                <button className="hover:text-primary transition-colors">
                  🔗 Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-card rounded-lg shadow border p-6">
          <h3 className="font-semibold text-lg mb-4">Comments</h3>

          {/* Add Comment */}
          <div className="mb-6">
            <textarea
              className="w-full bg-background border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write a comment..."
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium">
                Comment
              </button>
            </div>
          </div>

          {/* Sample Comments */}
          <div className="space-y-4">
            {[1, 2, 3].map((comment) => (
              <div
                key={comment}
                className="flex items-start gap-3 py-3 border-t"
              >
                <div className="bg-muted flex size-8 items-center justify-center rounded-full font-semibold text-sm">
                  U{comment}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">User {comment}</span>
                    <span className="text-muted-foreground text-xs">
                      · {comment}h ago
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    This is a sample comment. Great post!
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <button className="hover:text-primary transition-colors">
                      ❤️ {comment * 2}
                    </button>
                    <button className="hover:text-primary transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
