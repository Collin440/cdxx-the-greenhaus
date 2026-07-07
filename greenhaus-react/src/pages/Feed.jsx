import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Repeat2, Bookmark, Send } from "lucide-react";

import CommentModal from "../components/CommentModal";

import { supabase, createPost, fetchPosts, toggleLike } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import "./Feed.css";

function Feed() {
  const [postText, setPostText] = useState("");

  const [posts, setPosts] = useState([]);

  const [selectedPost, setSelectedPost] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPosts = async () => {
      const data = await fetchPosts();
      setPosts(data);
    };

    loadPosts();
  }, []);

  async function handlePost() {
    if (!postText.trim()) return;

    const newPost = await createPost(user.id, postText);

    if (newPost) {
      // Create notification

      console.log("Creating notification...");

      const { data, error } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: user.id,
            actor_id: user.id,
            type: "post",
            post_id: newPost.id,
            is_read: false,
          },
        ])
        .select();

      console.log("Notification Data:", data);
      console.log("Notification Error:", error);

      const updatedPosts = await fetchPosts();
      setPosts(updatedPosts);
      setPostText("");
    }
  }

  async function refreshPosts() {
    const updatedPosts = await fetchPosts();
    setPosts(updatedPosts);
  }

  console.log("RENDER POSTS:", posts);

  return (
    <>
      <div className="feed-page">
        <div className="create-post">
          <textarea
            placeholder="What's the vibe today?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />

          <button onClick={handlePost}>Post</button>
        </div>

        <div className="feed-posts">
          {posts.map((post) => {
            const likeCount = post.likes?.length || 0;
            const likedByMe = post.likes?.some(
              (like) => like.user_id === user.id,
            );

            const commentCount = post.comments?.length || 0;

            return (
              <div className="post-card" key={post.id}>
                <div className="post-header">
                  <h3
                    style={{
                      cursor: "pointer",
                      color: "#67ffb3",
                    }}
                    onClick={() => navigate(`/app/profile/${post.user_id}`)}
                  >
                    {post.profiles?.display_name ||
                      post.profiles?.username ||
                      "Unknown User"}
                  </h3>

                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>

                <p className="post-content">{post.content}</p>

                {post.image_url && (
                  <img src={post.image_url} alt="post" className="post-image" />
                )}

                <div className="post-actions">
                  <button
                    className={`like-button ${likedByMe ? "liked" : ""}`}
                    onClick={async () => {
                      await toggleLike(post.id, user.id);

                      const updatedPosts = await fetchPosts();
                      setPosts(updatedPosts);
                    }}
                  >
                    <Heart
                      size={18}
                      strokeWidth={2}
                      fill={likedByMe ? "currentColor" : "none"}
                    />
                    <span>{likeCount}</span>
                  </button>

                  <button
                    className="action-button"
                    onClick={() => {
                      setSelectedPost(post);
                      setCommentModalOpen(true);
                    }}
                  >
                    <MessageCircle size={18} />

                    <span>{commentCount}</span>
                  </button>

                  <button className="action-button">
                    <Repeat2 size={18} />
                  </button>

                  <button className="action-button">
                    <Bookmark size={18} />
                  </button>

                  <button className="action-button">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CommentModal
        post={selectedPost}
        open={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          setSelectedPost(null);
        }}
        onCommentAdded={async () => {
          const updatedPosts = await fetchPosts();
          setPosts(updatedPosts);
        }}
      />
    </>
  );
}

export default Feed;
