import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { postService } from '@/services/post.service'
import type { PostWithComments } from '@/types/post.types'
import { DialogOverlay } from "@radix-ui/react-dialog";
import { useEffect, useState, useCallback } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "./ui/spinner";

type ModalPostProps = {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
};

export default function ModalPost({ isOpen, onClose, postId }: ModalPostProps) {
    const [postData, setPostData] = useState<PostWithComments | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const loadPost = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await postService.getPostById(postId);
            setPostData(data);
        } catch (error) {
            setError('Failed to load post');
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        if (isOpen) {
            loadPost();
        }
    }, [isOpen, loadPost]);

    const handleToggleLike = async () => {
        if (!postId || !postData) return;

        try {
            const updatedPost = await postService.toggleLike(postId)
            setPostData({
                ...postData,
                post: updatedPost,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to like post')
        }
    }

    const handleToggleCommentLike = async (commentId: string) => {
        if (!postData) return;

        try {
            const updatedComment = await postService.toggleCommentLike(commentId);
            setPostData({
                ...postData,
                comments: postData.comments.map(c =>
                    c.id === commentId ? updatedComment : c
                ),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to like comment')
        }
    }

    const handleSubmitComment = async () => {
        if (!postId || !commentContent.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await postService.createComment({
                postId: postId,
                content: commentContent,
            });
            setCommentContent('');
            await loadPost(); // refresca la lista de comentarios
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to post comment')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <DialogContent className="max-w-md w-full max-h-[80vh] p-0">
                    <ScrollArea className="h-[80vh] flex flex-col p-6 gap-4">
                        {isLoading && <p>Loading...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {postData && (
                            <>
                                <DialogHeader className="flex-row mb-2">
                                    {postData.post.authorAvatar ? (
                                        <img
                                            src={postData.post.authorAvatar}
                                            alt={postData.post.authorName}
                                            className="size-12 rounded-full"
                                        />
                                    ) : (
                                        <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full font-bold text-lg">
                                            {postData.post.authorName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{postData.post.authorName}</h3>
                                        <span className="text-muted-foreground text-sm">
                                            · {postService.formatTimeAgo(postData.post.createdAt)}
                                        </span>
                                    </div>
                                </DialogHeader>

                                <p className="mt-3 text-foreground text-base leading-relaxed whitespace-pre-wrap">
                                    {postData.post.content}
                                </p>

                                <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                    <span>💬 {postData.post.commentsCount} Comments</span>
                                    <button
                                        onClick={handleToggleLike}
                                        className={`hover:text-primary transition-colors ${postData.post.likedByCurrentUser ? 'text-red-500' : ''}`}
                                    >
                                        {postData.post.likedByCurrentUser ? '❤️' : '🤍'} {postData.post.likesCount}
                                    </button>
                                    <button className="hover:text-primary transition-colors">
                                        🔗 Share
                                    </button>
                                </div>

                                {/* Add Comment */}
                                <div className="my-4">
                                    <textarea
                                        className="w-full bg-background border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Write a comment..."
                                        rows={3}
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={handleSubmitComment}
                                            disabled={!commentContent.trim() || isSubmitting}
                                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Posting...' : 'Comment'}
                                        </button>
                                    </div>
                                </div>

                                {/* Comments List */}
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-[19vh]">
                                        <Spinner />
                                    </div>
                                ) : postData.comments.length === 0 ? (
                                    <p className="text-muted-foreground text-sm text-center py-8">
                                        No comments yet. Be the first to comment!
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {postData.comments.map((comment) => (
                                            <div key={comment.id} className="pt-4 bg-primary/5 rounded-lg p-4">
                                                <div className="flex items-center gap-2">
                                                    {comment.authorAvatar ? (
                                                        <img src={comment.authorAvatar} alt="img" className="w-8 border p-1 rounded-full" />
                                                    ) : (
                                                        <div className="bg-muted flex w-8 h-8 items-center justify-center rounded-full font-semibold text-sm">
                                                            {comment.authorName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <h4 className="font-semibold">{comment.authorName}</h4>
                                                    <span className="text-muted-foreground text-sm">
                                                        · {postService.formatTimeAgo(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                                    {comment.content}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <button
                                                        onClick={() => handleToggleCommentLike(comment.id)}
                                                        className={`hover:text-primary transition-colors ${comment.likedByCurrentUser ? 'text-red-500' : ''}`}
                                                    >
                                                        {comment.likedByCurrentUser ? '❤️' : '🤍'} {comment.likesCount}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </ScrollArea>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    );
}
