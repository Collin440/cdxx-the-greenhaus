import "./ImageLightbox.css";

function ImageLightbox({ open, image, onClose }) {
  if (!open || !image) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <img
        src={image}
        alt="Full Size"
        className="lightbox-image"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default ImageLightbox;
