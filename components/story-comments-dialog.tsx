'use client';

import { ThumbsUp, Send, Wallet, Trash2, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { VerifiedBadge } from '@/components/verified-badge';

interface Comment {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  timestamp?: Date | string;
  createdAt?: string;
  likes: number;
  status?: string;
}
interface StoryCommentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle: string;
  storyId: string;
  isWalletConnected?: boolean;
  isAdmin?: boolean;
  onCommentCountChange?: (count: number) => void;
}

export default function StoryCommentsDialog({
  isOpen,
  onClose,
  storyTitle,
  storyId,
  isWalletConnected = false,
  isAdmin = false,
  onCommentCountChange,
}: StoryCommentsDialogProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { account } = useWeb3();

  // Fetch comments when dialog opens
  useEffect(() => {
    if (isOpen && storyId) {
      fetchComments();
    }
  }, [isOpen, storyId]);

  // Notify parent of comment count changes
  useEffect(() => {
    onCommentCountChange?.(comments.length);
  }, [comments.length, onCommentCountChange]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || ''}/api/comments?storyId=${storyId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date | string | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const handleConnectWallet = () => {
    // Connect wallet functionality would be implemented by parent component
    // For now, we just close the dialog
    toast.info('Please connect your wallet to comment');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || ''}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          content: newComment.trim(),
          author: {
            name: account || 'Anonymous User',
            username: account ? account.slice(0, 8) : 'anon',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account || 'anon'}`,
            walletAddress: account,
            isVerified: false,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment('');
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isWalletConnected || !account) {
      handleConnectWallet();
      return;
    }

    try {
      const response = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || ''}/api/comments/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          userId: account,
        }),
      });

      if (!response.ok) throw new Error('Failed to like comment');

      const data = await response.json();
      setComments(
        comments.map((comment) =>
          comment.id === commentId ? { ...comment, likes: data.likes } : comment
        )
      );
      toast.success(data.liked ? 'Comment liked!' : 'Like removed');
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const handleModerateComment = async (
    commentId: string,
    action: 'approve' | 'moderate' | 'delete'
  ) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || ''}/api/comments/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          action,
        }),
      });

      if (!response.ok) throw new Error('Failed to moderate comment');

      const data = await response.json();
      if (action === 'delete') {
        setComments(comments.filter((comment) => comment.id !== commentId));
      } else {
        setComments(
          comments.map((comment) =>
            comment.id === commentId
              ? { ...comment, status: data.status }
              : comment
          )
        );
      }
      toast.success(data.message);
    } catch (error) {
      console.error('Error moderating comment:', error);
      toast.error('Failed to moderate comment');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments on "{storyTitle}"</DialogTitle>
          <DialogDescription>
            Join the discussion about this story
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-4">
              {comments
                .filter((comment) => comment.status !== 'deleted')
                .map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-4 p-4 rounded-lg bg-muted/30"
                  >
                    <Avatar>
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{comment.author.name}</p>
                            {comment.author.isVerified && (
                              <VerifiedBadge className="ml-1" size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            @{comment.author.username} •{' '}
                            {formatTimestamp(
                              comment.timestamp || comment.createdAt
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              isWalletConnected
                                ? handleLikeComment(comment.id)
                                : handleConnectWallet()
                            }
                            className="text-muted-foreground hover:text-primary"
                            disabled={!isWalletConnected}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {comment.likes}
                          </Button>
                          {isAdmin && (
                            <>
                              {comment.status === 'moderated' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleModerateComment(comment.id, 'approve')
                                  }
                                  className="text-green-600 hover:text-green-700"
                                  title="Approve comment"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleModerateComment(
                                      comment.id,
                                      'moderate'
                                    )
                                  }
                                  className="text-yellow-600 hover:text-yellow-700"
                                  title="Moderate comment"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleModerateComment(comment.id, 'delete')
                                }
                                className="text-red-600 hover:text-red-700"
                                title="Delete comment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      {comment.status === 'moderated' && (
                        <p className="text-xs text-yellow-600 mt-1">
                          This comment is under moderation
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        {isWalletConnected ? (
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 pt-4 border-t flex-shrink-0"
          >
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isAdmin
                  ? 'Write a comment as GroqTales admin...'
                  : 'Write a comment...'
              }
              className={`flex-1 ${isAdmin ? 'border-purple-200' : ''}`}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className={isAdmin ? 'theme-gradient-bg' : ''}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="text-center border-t pt-4 flex-shrink-0">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to join the conversation
            </p>
            <Button
              onClick={handleConnectWallet}
              className="theme-gradient-bg text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        )}

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
