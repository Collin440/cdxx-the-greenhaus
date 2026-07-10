import "./VenueModal.css";

import { X, MapPin, Navigation, Tag } from "lucide-react";

function VenueModal({ venue, isOpen, onClose, onDelete }) {
  if (!isOpen || !venue) return null;

  return (
    <div className="venue-modal-overlay" onClick={onClose}>
      <div className="venue-modal" onClick={(e) => e.stopPropagation()}>
        <button className="venue-close-btn" onClick={onClose}>
          <X size={22} />
        </button>

        <img
          src={venue.image_url}
          alt={venue.name}
          className="venue-modal-image"
        />

        <div className="venue-modal-content">
          <h2>{venue.name}</h2>

          <div className="venue-meta">
            <span>
              <Tag size={16} />
              {venue.category}
            </span>

            <span>
              <MapPin size={16} />
              {venue.location}
            </span>
          </div>

          <p>{venue.description}</p>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`}
            target="_blank"
            rel="noreferrer"
            className="venue-directions-btn"
          >
            <Navigation size={18} />
            Open in Google Maps
          </a>

          <button className="delete-venue-btn" onClick={onDelete}>
            Delete Venue
          </button>
        </div>
      </div>
    </div>
  );
}

export default VenueModal;
