import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { User, Mail, Calendar, Pencil } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { postService } from '@/services/post.service'
import type { Post } from '@/types/post.types'

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editName, setEditName] = useState(user?.name || '')
  const [editEmail, setEditEmail] = useState(user?.email || '')

  useEffect(() => {
    if (user?.id) {
      loadUserPosts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const loadUserPosts = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const posts = await postService.getPostsByUserId(user.id)
      setUserPosts(posts)
    } catch (err) {
      console.error('Failed to load user posts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = () => {
    // TODO: Implement profile update logic
    console.log('Saving profile:', { name: editName, email: editEmail })
  }

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`)
  }

  return (
    <div className="p-6  ">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-lg shadow border">
          <div className="h-32 bg-linear-to-r from-primary/20 to-primary/10 rounded-t-lg" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-6 -mt-16">
              <Avatar className="size-32 border-4 border-background">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-5xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-20">
                <h2 className="text-3xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-20">
                    <Pencil className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="grid gap-3">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={handleSaveProfile}>Save changes</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{userPosts.length}</div>
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
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-md animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts yet
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  <p className="text-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span>💬 {post.commentsCount} Comments</span>
                    <span>❤️ {post.likesCount} Likes</span>
                    <span className="ml-auto">
                      {postService.formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
