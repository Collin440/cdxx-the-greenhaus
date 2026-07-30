import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import CommentModal from "../components/CommentModal";
import PostCard from "../components/feed/PostCard";

import {
  fetchSavedPosts,
  toggleLike,
  toggleRepost,
  toggleSave,
} from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import "./Feed.css";

function Saved() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [savedPosts, setSavedPosts] = useState([]);

  const [selectedPost, setSelectedPost] = useState(null);

  const [commentModalOpen, setCommentModalOpen] = useState(false);

  const refreshSavedPosts = useCallback(async () => {
    if (!user) return;

    const data = await fetchSavedPosts(user.id);

    setSavedPosts(data);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadSavedPosts = async () => {
      const data = await fetchSavedPosts(user.id);
      setSavedPosts(data);
    };

    loadSavedPosts();
  }, [user]);

  return (
    <>
      <div className="feed-page">
        <div className="feed-posts">
          <div
            style={{
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            <h1>Saved</h1>

            <p>Total Saved Posts: {savedPosts.length}</p>
          </div>

          {savedPosts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                marginTop: "5rem",
                opacity: 0.8,
              }}
            >
              <h2>No saved posts yet.</h2>

              <p>Save posts from your feed and they'll appear here.</p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                onProfileClick={() => navigate(`/app/profile/${post.user_id}`)}
                onLike={async () => {
                  await toggleLike(post.id, user.id);
                  refreshSavedPosts();
                }}
                onComment={() => {
                  setSelectedPost(post);
                  setCommentModalOpen(true);
                }}
                onRepost={async () => {
                  await toggleRepost(post.id, user.id);
                  refreshSavedPosts();
                }}
                onSave={async () => {
                  await toggleSave(post.id, user.id);
                  refreshSavedPosts();
                }}
                onShare={() => {
                  console.log("Share clicked");
                }}
              />
            ))
          )}
        </div>
      </div>

      <CommentModal
        post={selectedPost}
        open={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          setSelectedPost(null);
        }}
        onCommentAdded={refreshSavedPosts}
      />
    </>
  );
}

export default Saved;
