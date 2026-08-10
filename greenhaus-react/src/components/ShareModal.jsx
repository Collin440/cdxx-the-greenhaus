import { useState } from "react";
import { X, Copy, Share2, MessageCircle, Mail } from "lucide-react";

import "./ShareModal.css";

function ShareModal({ post, open, onClose }) {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  if (!open || !post) return null;

  const shareUrl = `${window.location.origin}/app/post/${post.id}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("SHARE COPY ERROR:", error);
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "GreenHaus",
          text: post.content,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("NATIVE SHARE ERROR:", error);
        }
      }

      return;
    }

    setShowShareOptions(true);
  }

  function openShareWindow(url) {
    window.open(url, "_blank", "width=700,height=600,noopener,noreferrer");
  }

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(event) => event.stopPropagation()}>
        <button className="share-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="share-header">
          <Share2 size={22} />
          <h2>Share Post</h2>
        </div>

        <div className="share-preview">
          <strong>
            {post.profiles?.display_name ||
              post.profiles?.username ||
              "GreenHaus User"}
          </strong>

          <p>{post.content}</p>
        </div>

        <div className="share-actions">
          <button onClick={handleCopy}>
            <Copy size={18} />
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>

          <button onClick={handleNativeShare}>
            <Share2 size={18} />
            <span>More Sharing Options</span>
          </button>
        </div>

        {showShareOptions && (
          <div className="desktop-share-options">
            <button
              onClick={() =>
                openShareWindow(
                  `https://wa.me/?text=${encodeURIComponent(
                    `${post.content}\n\n${shareUrl}`,
                  )}`,
                )
              }
            >
              <MessageCircle size={18} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() =>
                openShareWindow(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    post.content,
                  )}&url=${encodeURIComponent(shareUrl)}`,
                )
              }
            >
              <Share2 size={18} />
              <span>X</span>
            </button>

            <button
              onClick={() =>
                openShareWindow(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl,
                  )}`,
                )
              }
            >
              <Share2 size={18} />
              <span>Facebook</span>
            </button>

            <button
              onClick={() =>
                (window.location.href = `mailto:?subject=${encodeURIComponent(
                  "Check out this GreenHaus post",
                )}&body=${encodeURIComponent(`${post.content}\n\n${shareUrl}`)}`)
              }
            >
              <Mail size={18} />
              <span>Email</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareModal;
