export function FeedPage() {
  return (
    <div className="p-6 space-y-6 ">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Feed</h2>
        <p className="text-muted-foreground">
          Discover what's happening in your community
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Create Post */}
        <div className="bg-card rounded-lg shadow border p-4">
          <textarea
            className="w-full bg-background border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="What's on your mind?"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium">
              Post
            </button>
          </div>
        </div>

        {/* Sample Posts */}
        {[1, 2, 3].map((post) => (
          <div key={post} className="bg-card rounded-lg shadow border p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full font-bold">
                U
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Username</h3>
                  <span className="text-muted-foreground text-sm">
                    · 2h ago
                  </span>
                </div>
                <p className="mt-2 text-foreground">
                  This is a sample post in your social media feed. You can add
                  real post content here.
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                  <button className="hover:text-primary transition-colors">
                    💬 {post * 5} Comments
                  </button>
                  <button className="hover:text-primary transition-colors">
                    ❤️ {post * 12} Likes
                  </button>
                  <button className="hover:text-primary transition-colors">
                    🔗 Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
