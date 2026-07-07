import "./Explore.css";
import ExploreMap from "./ExploreMap";
import { useEffect, useState } from "react";
import {
  Plus,
  MapPin,
  Image,
  Building2,
  Compass,
  Music4,
  Store,
  UtensilsCrossed,
  Trees,
  GalleryHorizontal,
} from "lucide-react";

import { fetchVenues, addVenue, uploadVenueImage } from "../lib/venues";

function Explore() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedVenue, setSelectedVenue] = useState(null);

  const [showAddVenueModal, setShowAddVenueModal] = useState(false);

  const [venues, setVenues] = useState([]);

  const [userLocation, setUserLocation] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [venueName, setVenueName] = useState("");
  const [venueLocation, setVenueLocation] = useState("");
  const [venueLat, setVenueLat] = useState("");
  const [venueLng, setVenueLng] = useState("");
  const [venueCategory, setVenueCategory] = useState("Music");
  const [venueImage, setVenueImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  /* LOAD VENUES */

  useEffect(() => {
    async function loadVenues() {
      const data = await fetchVenues();

      setVenues(data);
    }

    loadVenues();
  }, []);

  /* GET USER LOCATION */

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },

      (error) => {
        console.error("Location access denied:", error);
      },
    );
  }, []);

  async function handleAddVenue() {
    console.log("Button clicked");
    const name = venueName.trim();

    const location = venueLocation.trim();

    const lat = Number(venueLat);

    const lng = Number(venueLng);

    const category = venueCategory;

    const imageFile = venueImage;

    let imageUrl = "";

    if (imageFile) {
      imageUrl = await uploadVenueImage(imageFile);

      if (!imageUrl) {
        alert("Image upload failed.");
        return;
      }
    }

    if (imageFile) {
      imageUrl = await uploadVenueImage(imageFile);

      if (!imageUrl) {
        alert("Image upload failed.");
        return;
      }
    }

    const newVenue = {
      name,

      location,

      category,

      lat,

      lng,

      description: "User submitted venue.",

      image_url: imageUrl,
    };

    const savedVenue = await addVenue(newVenue);

    console.log("Saved venue:", savedVenue);

    if (!savedVenue) return;

    setVenues((prev) => [...prev, savedVenue]);

    setVenueName("");
    setVenueLocation("");
    setVenueLat("");
    setVenueLng("");
    setVenueCategory("Music");
    setVenueImage(null);
    setImagePreview("");
  }

  const filteredVenues = venues.filter((venue) => {
    const matchesCategory =
      selectedCategory === "All" || venue.category === selectedCategory;

    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explore the ZA</h1>

        <p>
          Discover sessions, lounges, restaurants, galleries and live culture.
        </p>
      </div>

      <div className="explore-search">
        <input
          type="text"
          placeholder="Search venues, cities, vibes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="explore-filters">
        <button
          className={selectedCategory === "All" ? "active-filter" : ""}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>

        <button
          className={selectedCategory === "Dispensary" ? "active-filter" : ""}
          onClick={() => setSelectedCategory("Dispensary")}
        >
          Dispensaries
        </button>

        <button
          className={selectedCategory === "Restaurant" ? "active-filter" : ""}
          onClick={() => setSelectedCategory("Restaurant")}
        >
          Restaurants
        </button>

        <button
          className={selectedCategory === "Park" ? "active-filter" : ""}
          onClick={() => setSelectedCategory("Park")}
        >
          Parks
        </button>

        <button
          className={selectedCategory === "Music" ? "active-filter" : ""}
          onClick={() => setSelectedCategory("Music")}
        >
          Music
        </button>

        <button
          className={selectedCategory === "Gallery" ? "active-filter" : ""}
          onClick={() => setSelectedCategory("Gallery")}
        >
          Galleries
        </button>
      </div>

      <div className="explore-layout">
        <div className="add-venue-form">
          <div className="venue-form-header">
            <div className="venue-form-icon">
              <Plus size={24} />
            </div>

            <div>
              <h2>Add Venue</h2>
              <p>Share a place with the GreenHaus community.</p>
            </div>
          </div>

          <div className="input-group">
            <Building2 size={18} className="input-icon" />

            <input
              type="text"
              placeholder="Venue Name"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <MapPin size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Location"
              value={venueLocation}
              onChange={(e) => setVenueLocation(e.target.value)}
            />
          </div>

          <div className="coordinates-grid">
            <div className="input-group">
              <Compass size={18} className="input-icon" />

              <input
                type="number"
                placeholder="Latitude"
                value={venueLat}
                onChange={(e) => setVenueLat(e.target.value)}
              />
            </div>

            <div className="input-group">
              <Compass size={18} className="input-icon" />

              <input
                type="number"
                placeholder="Longitude"
                value={venueLng}
                onChange={(e) => setVenueLng(e.target.value)}
              />
            </div>
          </div>

          <label htmlFor="venue-image" className="custom-file-upload">
            Upload Venue Image
          </label>

          <input
            type="file"
            id="venue-image"
            className="hidden-file-input"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];

              if (!file) return;

              setVenueImage(file);
              setImagePreview(URL.createObjectURL(file));
            }}
          />

          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}

          <div className="category-grid">
            <button
              type="button"
              className={`category-chip ${venueCategory === "Music" ? "active" : ""}`}
              onClick={() => setVenueCategory("Music")}
            >
              <Music4 size={18} />
              <span>Music</span>
            </button>

            <button
              type="button"
              className={`category-chip ${venueCategory === "Gallery" ? "active" : ""}`}
              onClick={() => setVenueCategory("Gallery")}
            >
              <GalleryHorizontal size={18} />
              <span>Gallery</span>
            </button>

            <button
              type="button"
              className={`category-chip ${venueCategory === "Dispensary" ? "active" : ""}`}
              onClick={() => setVenueCategory("Dispensary")}
            >
              <Store size={18} />
              <span>Dispensary</span>
            </button>

            <button
              type="button"
              className={`category-chip ${venueCategory === "Restaurant" ? "active" : ""}`}
              onClick={() => setVenueCategory("Restaurant")}
            >
              <UtensilsCrossed size={18} />
              <span>Restaurant</span>
            </button>

            <button
              type="button"
              className={`category-chip ${venueCategory === "Park" ? "active" : ""}`}
              onClick={() => setVenueCategory("Park")}
            >
              <Trees size={18} />
              <span>Park</span>
            </button>
          </div>

          <button onClick={handleAddVenue}>Add Venue</button>
        </div>

        <section className="venues-list">
          {filteredVenues.map((venue) => (
            <article
              className="venue-card"
              key={venue.id}
              onClick={() => setSelectedVenue(venue)}
            >
              <div className="venue-image-wrapper">
                <img
                  src={
                    venue.image_url ||
                    "https://images.unsplash.com/photo-1514933651103-005eec06c04b"
                  }
                  alt={venue.name}
                  className="venue-image"
                />

                <span className="venue-category">{venue.category}</span>
              </div>

              <div className="venue-content">
                <h3>{venue.name}</h3>

                <p className="venue-location">
                  <MapPin size={15} />
                  {venue.location}
                </p>

                <p className="venue-description">{venue.description}</p>

                <button className="view-on-map-btn" type="button">
                  View on Map
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="map-section">
          <div className="map-header">
            <div>
              <h2>Discover Nearby</h2>
              <p>
                Explore dispensaries, restaurants, galleries and experiences
                around you.
              </p>
            </div>

            <span className="venue-count">{filteredVenues.length} Places</span>
          </div>

          <div className="map-container">
            <ExploreMap
              venues={filteredVenues}
              selectedVenue={selectedVenue}
              userLocation={userLocation}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default Explore;
