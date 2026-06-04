import "./PostCard.css";
import { FaHeart, FaComment, FaShare } from "react-icons/fa";

function PostCard() {
  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src="https://i.pravatar.cc/100"
          alt="profile"
        />

        <div>
          <h3>CollinBeatz</h3>
          <span>2 mins ago</span>
        </div>
      </div>

      <p className="post-text">
        Late night coding session in Johannesburg 🌃🌿
      </p>

      <img
        className="post-image"
        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200"
        alt="post"
      />

      <div className="post-actions">
  <button>
    <FaHeart />
    <span>Like</span>
  </button>

  <button>
    <FaComment />
    <span>Comment</span>
  </button>

  <button>
    <FaShare />
    <span>Share</span>
  </button>
</div>

    </div>
  );
}

export default PostCard;