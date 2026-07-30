import { Heart, MessageCircle, Repeat2, Bookmark, Send } from "lucide-react";

import "./PostCard.css";

function PostCard({
  post,
  user,
  onLike,
  onComment,
  onRepost,
  onSave,
  onShare,
  onProfileClick,
  onImageClick,
}) {
  const likeCount = post.likes?.length || 0;
  const likedByMe = post.likes?.some((like) => like.user_id === user.id);

  const commentCount = post.comments?.length || 0;

  const repostCount = post.reposts?.length || 0;

  const repostedByMe = post.reposts?.some(
    (repost) => repost.user_id === user.id,
  );

  const savedByMe = post.saved_posts?.some((save) => save.user_id === user.id);

  console.log("POST:", post.id);
  console.log("POST IMAGES:", post.post_images);

  return (
    <div className="post-card">
      <div className="post-header">
        <h3
          style={{
            cursor: "pointer",
            color: "#67ffb3",
          }}
          onClick={onProfileClick}
        >
          {post.profiles?.display_name ||
            post.profiles?.username ||
            "Unknown User"}
        </h3>

        <span>{new Date(post.created_at).toLocaleString()}</span>
      </div>

      <p className="post-content">{post.content}</p>

      {post.post_images?.length > 0 && (
        <div
          className={`post-images-grid images-${Math.min(
            post.post_images.length,
            4,
          )}`}
        >
          {post.post_images.map((image) => (
            <img
              key={image.id}
              src={image.image_url}
              alt="Post"
              className="post-image"
              onClick={() => onImageClick(image.image_url)}
            />
          ))}
        </div>
      )}

      <div className="post-actions">
        <button
          className={`like-button ${likedByMe ? "liked" : ""}`}
          onClick={onLike}
        >
          <Heart size={18} fill={likedByMe ? "currentColor" : "none"} />

          <span>{likeCount}</span>
        </button>

        <button className="comment-button" onClick={onComment}>
          <MessageCircle size={18} />

          <span>{commentCount}</span>
        </button>

        <button
          className={`action-button ${repostedByMe ? "reposted" : ""}`}
          onClick={onRepost}
        >
          <Repeat2 size={20} />

          <span>{repostCount}</span>
        </button>

        <button
          className={`action-button ${savedByMe ? "saved" : ""}`}
          onClick={onSave}
        >
          <Bookmark size={20} />
        </button>

        <button className="action-button" onClick={onShare}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default PostCard;
