import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/feed/PostCard";
import CommentModal from "../components/CommentModal";
import ShareModal from "../components/ShareModal";
import { ImagePlus } from "lucide-react";
import ImageLightbox from "../components/ImageLightbox";

import {
  supabase,
  createPost,
  fetchPosts,
  toggleLike,
  toggleRepost,
  toggleSave,
} from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import "./Feed.css";

function Feed() {
  const [postText, setPostText] = useState("");

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [posts, setPosts] = useState([]);

  const [selectedPost, setSelectedPost] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState(null);

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
    if (!postText.trim() && selectedImages.length === 0 && !selectedVideo) {
      return;
    }

    const newPost = await createPost(
      user.id,
      postText,
      selectedImages,
      selectedVideo,
    );

    console.log("Posting...");
    console.log(selectedImages);

    console.log(newPost);

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

      await refreshPosts();
      setPostText("");
      setSelectedImages([]);
      setSelectedVideo(null);
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

          <div className="image-upload">
            <label htmlFor="post-media" className="upload-button">
              <ImagePlus size={18} />
              <span>Add Media</span>
            </label>

            <input
              id="post-media"
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);

                const images = files.filter((file) =>
                  file.type.startsWith("image/"),
                );

                const videos = files.filter((file) =>
                  file.type.startsWith("video/"),
                );

                if (videos.length > 0) {
                  setSelectedVideo(videos[0]);
                  setSelectedImages([]);
                } else {
                  setSelectedImages(images);
                  setSelectedVideo(null);
                }

                e.target.value = "";
              }}
              hidden
            />

            {(selectedImages.length > 0 || selectedVideo) && (
              <div className="selected-files">
                {selectedImages.length > 0 && (
                  <span className="selected-file">
                    {selectedImages.length} image
                    {selectedImages.length > 1 ? "s" : ""} selected
                  </span>
                )}

                {selectedVideo && (
                  <span className="selected-file">
                    Video selected: {selectedVideo.name}
                  </span>
                )}
              </div>
            )}
          </div>

          <button onClick={handlePost}>Post</button>
        </div>

        <div className="feed-posts">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              sproutedBy={post.reposts}
              onProfileClick={() => navigate(`/app/profile/${post.user_id}`)}
              onLike={async () => {
                await toggleLike(post.id, user.id);
                refreshPosts();
              }}
              onComment={() => {
                setSelectedPost(post);
                setCommentModalOpen(true);
              }}
              onRepost={async () => {
                await toggleRepost(post.id, user.id);
                refreshPosts();
              }}
              onSave={async () => {
                await toggleSave(post.id, user.id);
                refreshPosts();
              }}
              onShare={() => {
                setSelectedSharePost(post);
                setShareModalOpen(true);
              }}
              onImageClick={(image) => {
                setLightboxImage(image);
                setLightboxOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      <CommentModal
        post={selectedPost}
        open={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          setSelectedPost(null);
        }}
        onCommentAdded={refreshPosts}
      />

      <ImageLightbox
        open={lightboxOpen}
        image={lightboxImage}
        onClose={() => {
          setLightboxOpen(false);
          setLightboxImage(null);
        }}
      />
      <ShareModal
        post={selectedSharePost}
        open={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setSelectedSharePost(null);
        }}
      />
    </>
  );
}

export default Feed;
