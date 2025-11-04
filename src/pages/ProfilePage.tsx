import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { User, Pencil } from 'lucide-react'
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
import { UserPostsList } from '@/components/posts'
import { useUserPosts } from '@/hooks/use-posts'
import ModalPost from '@/components/ModalPost'

export function ProfilePage() {
  const { user } = useAuth()
  const { posts: userPosts, isLoading } = useUserPosts(user?.id)
  const [editName, setEditName] = useState(user?.name || '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const handleSaveProfile = () => {
    // TODO: Implement profile update logic
    console.log('Saving profile:', { name: editName })
  }

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6  ">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-lg shadow border">
          <div className="h-32 bg-linear-to-r from-primary/20 to-primary/10 rounded-t-lg" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-6 -mt-16">
              <Avatar className="size-32  bg-accent">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-linear-to-br from-primary/80 to-primary text-primary-foreground text-5xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-20">
                <h2 className="text-3xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">@{user?.username}</p>
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

            <div className="mt-8 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{userPosts.length}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
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
              <User className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Username</p>
                <p className="text-foreground">@{user?.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div className="bg-card rounded-lg shadow border p-6">
          <h3 className="text-xl font-semibold mb-4">Posts</h3>
          <UserPostsList
            posts={userPosts}
            isLoading={isLoading}
            onPostClick={handlePostClick}
          />
        </div>
      </div>

      <ModalPost
        postId={selectedPostId!}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
