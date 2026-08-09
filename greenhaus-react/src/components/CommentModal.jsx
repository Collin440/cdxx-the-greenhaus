import { useEffect, useState, useCallback } from "react";
import { X, Send, Trash2 } from "lucide-react";

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
  }, [post, user]);

  useEffect(() => {
    if (!open || !post) return;

    const fetchComments = async () => {
      await loadComments();
    };

    void fetchComments();

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
          void loadComments();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, post, loadComments]);

  async function handleComment() {
    if (!commentText.trim()) return;

    const { error } = await supabase.from("comments").insert([
      {
        post_id: post.id,
        user_id: user.id,
        content: commentText.trim(),
      },
    ]);

    if (error) {
      console.error("COMMENT INSERT ERROR:", error);
      return;
    }
    console.log("COMMENT INSERT SUCCESS");

    console.log("LOOKING FOR POST OWNER:", post.id);

    // Find the owner of the post
    const { data: postOwner, error: postOwnerError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", post.id)
      .single();

    if (postOwnerError) {
      console.error("POST OWNER ERROR:", postOwnerError);
    } else if (postOwner.user_id !== user.id) {
      console.log("INSERTING COMMENT NOTIFICATION:", {
        user_id: postOwner.user_id,
        actor_id: user.id,
        post_id: post.id,
      });
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: postOwner.user_id,
            actor_id: user.id,
            post_id: post.id,
            type: "comment",
            is_read: false,
          },
        ]);

      if (notificationError) {
        console.error("COMMENT NOTIFICATION ERROR:", notificationError);
      }
    }

    setCommentText("");

    await loadComments();

    if (onCommentAdded) {
      onCommentAdded();
    }
  }

  async function handleDeleteComment(commentId) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error(error);
      return;
    }

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
                <img
                  src={comment.profiles?.avatar_url || "/default-avatar.png"}
                  alt=""
                  className="comment-avatar"
                />

                <div className="comment-body">
                  <div className="comment-header">
                    <strong>
                      {comment.profiles?.display_name ||
                        comment.profiles?.username ||
                        "Unknown User"}
                    </strong>

                    <small>
                      {new Date(comment.created_at).toLocaleString()}
                    </small>

                    {comment.user_id === user.id && (
                      <button
                        className="delete-comment-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <p>{comment.content}</p>
                </div>
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
