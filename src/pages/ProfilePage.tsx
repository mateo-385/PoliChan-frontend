import { useAuth } from '@/hooks/use-auth'
import { User, Mail, Calendar } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="p-6  ">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-lg shadow border">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-6 -mt-16">
              <div className="bg-primary text-primary-foreground flex size-32 items-center justify-center rounded-full text-5xl font-bold border-4 border-background">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 pt-20">
                <h2 className="text-3xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <button className="mt-20 px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium">
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">42</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">1.2K</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">324</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-card rounded-lg shadow border p-6">
          <h3 className="text-xl font-semibold mb-4">About</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <User className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-foreground">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Mail className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
              <Calendar className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-foreground">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div className="bg-card rounded-lg shadow border p-6">
          <h3 className="text-xl font-semibold mb-4">Posts</h3>
          <div className="space-y-4">
            {[1, 2].map((post) => (
              <div key={post} className="p-4 border rounded-md">
                <p className="text-foreground">
                  Sample post by {user?.name}. This would show their actual
                  posts.
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span>💬 {post * 3} Comments</span>
                  <span>❤️ {post * 8} Likes</span>
                  <span className="ml-auto">{post}d ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
