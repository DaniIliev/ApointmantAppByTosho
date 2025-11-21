"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Reply, Send } from "lucide-react";
import { Comment, User } from "../../types";
import { format } from "date-fns";

interface CommentThreadProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  level: number;
}

function CommentThread({ comment, onReply, level }: CommentThreadProps) {
  const maxLevel = 2; // Maximum nesting level
  const indent = level * 24; // Indentation per level

  return (
    <div style={{ marginLeft: `${indent}px` }} className="space-y-2">
      <div className="p-3 bg-muted/50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={comment.user.avatar} />
              <AvatarFallback className="text-xs">
                {comment.user.firstName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {comment.user.firstName} {comment.user.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.createdAt), "MMM d, HH:mm")}
            </span>
          </div>
          {level < maxLevel && (
            <button
              onClick={() => onReply(comment._id)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
          )}
        </div>
        <p className="text-sm text-foreground">{comment.text}</p>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply._id}
              comment={reply}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CardCommentsProps {
  comments: Comment[];
  availableUsers: User[];
  onAddComment: (text: string, parentId?: string) => void;
}

export function CardComments({
  comments,
  availableUsers,
  onAddComment,
}: CardCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment, replyingTo || undefined);
    setNewComment("");
    setReplyingTo(null);
  };

  return (
    <div className="space-y-3 flex flex-col h-[270px]">
      <label className="text-sm font-medium flex items-center gap-2 text-foreground">
        <MessageSquare className="w-4 h-4" />
        Comments
      </label>
      <div className="bg-muted/30 rounded-lg border border-border flex flex-col flex-1 overflow-hidden">
        {/* Comments List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No comments yet. Start the conversation!
            </p>
          )}
          {comments.map((comment) => (
            <CommentThread
              key={comment._id}
              comment={comment}
              onReply={(commentId) => setReplyingTo(commentId)}
              level={0}
            />
          ))}
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="border-t border-border bg-background/50 p-3 space-y-2">
          {replyingTo && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 px-3 py-2 rounded-md">
              <Reply className="w-3 h-3" />
              <span>Replying to comment...</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-auto text-primary hover:underline font-medium"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none transition-colors"
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
            />
            <Button
              size="sm"
              onClick={handleAddComment}
              className="px-3 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
