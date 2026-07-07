import { useEffect, useState, useCallback } from "react";
import { X, Send } from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import "./CommentModal.css";

function CommentModal({ post, open, onClose, onCommentAdded }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const loadComments = useCallback(async () => {
    if (!post) return;

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        profiles!comments_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `,
      )
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setComments(data);
  }, [post]);

  useEffect(() => {
    if (!open || !post) return;

    void loadComments();

    // Listen for new comments
    const channel = supabase
      .channel(`comments-${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${post.id}`,
        },
        () => {
          loadComments();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, post, loadComments]);

  async function handleComment() {
    if (!commentText.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: post.id,
          user_id: user.id,
          content: commentText,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setCommentText("");

    await loadComments();

    if (onCommentAdded) {
      onCommentAdded();
    }
  }

  if (!open || !post) return null;

  return (
    <div className="comment-overlay">
      <div className="comment-modal">
        <button className="close-modal" onClick={onClose}>
          <X size={20} />
        </button>

        <h2>Comments</h2>

        <div className="original-post">
          <strong>{post.profiles?.display_name}</strong>

          <p>{post.content}</p>
        </div>

        <div className="comment-list">
          {comments.length === 0 ? (
            <div className="empty-comments">
              <h3>No comments yet</h3>
              <p>Spark the conversation.Puff puff pass!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div className="comment-card" key={comment.id}>
                <strong>
                  {comment.profiles?.display_name ||
                    comment.profiles?.username ||
                    "Unknown User"}
                </strong>

                <p>{comment.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="comment-input">
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          <button onClick={handleComment}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;
