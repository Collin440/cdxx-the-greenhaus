import "./Explore.css";
import ExploreMap from "./ExploreMap";
import { useEffect, useState } from "react";

import {
  fetchVenues,
  addVenue,
  uploadVenueImage
} from "../lib/venues";

function Explore() {

  const [selectedCategory, setSelectedCategory] = useState("All");

const [selectedVenue, setSelectedVenue] = useState(null);

const [venues, setVenues] = useState([]);

const [userLocation, setUserLocation] = useState(null);

const [searchTerm, setSearchTerm] = useState("");

const [imagePreview, setImagePreview] = useState("");

/* LOAD VENUES */

useEffect(() => {

  async function loadVenues() {

    const data =
      await fetchVenues();

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

      console.error(
        "Location access denied:",
        error
      );

    }

  );

}, []);

  async function handleAddVenue() {

  const name =
    document.querySelector("#venue-name").value;

  const location =
    document.querySelector("#venue-location").value;

  const lat =
    Number(
      document.querySelector("#venue-lat").value
    );

  const lng =
    Number(
      document.querySelector("#venue-lng").value
    );

  const category =
    document.querySelector("#venue-category").value;

  const imageFile =
  document.querySelector("#venue-image")
    .files[0];  

  let imageUrl = "";

if (imageFile) {

  imageUrl =
    await uploadVenueImage(imageFile);

}  

  const newVenue = {

    id: Date.now(),

    name,

    location,

    category,

    lat,

    lng,

    description:
      "User submitted venue.",

    image_url: imageUrl,  

  };

  async function saveVenue() {

  const savedVenue =
    await addVenue(newVenue);

  if (savedVenue) {

    setVenues((prev) => [
      ...prev,
      savedVenue
    ]);

  }

}

saveVenue();

}
  
  const filteredVenues = venues.filter(
  (venue) => {

    const matchesCategory =

      selectedCategory === "All"

      ||

      venue.category === selectedCategory;

    const matchesSearch =

      venue.name
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )

      ||

      venue.location
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )

      ||

      venue.category
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        );

    return (
      matchesCategory &&
      matchesSearch
    );

  }
);

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
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
  />

</div>

      <div className="explore-filters">

  <button
  className={
    selectedCategory === "All"
      ? "active-filter"
      : ""
  }
  onClick={() => setSelectedCategory("All")}
>
  All
  </button>

  <button
  className={
    selectedCategory === "Dispensary"
      ? "active-filter"
      : ""
  }
  onClick={() => setSelectedCategory("Dispensary")}
>
    Dispensaries
  </button>

  <button
  className={
    selectedCategory === "Restaurant"
      ? "active-filter"
      : ""
  }
  onClick={() => setSelectedCategory("Restaurant")}
>
    Restaurants
  </button>

  <button
  className={
    selectedCategory === "Park"
      ? "active-filter"
      : ""
  }
  onClick={() => setSelectedCategory("Park")}
>
    Parks
  </button>

  <button
  className={
    selectedCategory === "Music"
      ? "active-filter"
      : ""
  }
  onClick={() => setSelectedCategory("Music")}
>
    Music
  </button>

  <button
  className={
    selectedCategory === "Gallery"
      ? "active-filter"
      : ""
  }
  onClick={() => setSelectedCategory("Gallery")}
>
    Galleries
  </button>

</div>

      <div className="explore-layout">

        <div className="add-venue-form">

  <input
    type="text"
    placeholder="Venue Name"
    id="venue-name"
  />

  <input
    type="text"
    placeholder="Location"
    id="venue-location"
  />

  <input
    type="number"
    placeholder="Latitude"
    id="venue-lat"
  />

  <input
    type="number"
    placeholder="Longitude"
    id="venue-lng"
  />

  <label
  htmlFor="venue-image"
  className="custom-file-upload"
>
  Upload Venue Image
</label>

<input
  type="file"
  id="venue-image"
  className="hidden-file-input"

  onChange={(e) => {

    const file =
      e.target.files[0];

    if (file) {

      setImagePreview(
        URL.createObjectURL(file)
      );

    }

  }}
/>

{imagePreview && (

  <img
    src={imagePreview}
    alt="Preview"
    className="image-preview"
  />

)}

  <select id="venue-category">

    <option value="Music">
      Music
    </option>

    <option value="Gallery">
      Gallery
    </option>

    <option value="Dispensary">
      Dispensary
    </option>

    <option value="Restaurant">
      Restaurant
    </option>

    <option value="Park">
      Park
    </option>

  </select>

  <button onClick={handleAddVenue}>
    Add Venue
  </button>

</div>

        <section className="venues-list">
  {filteredVenues.map((venue) => (
    <div
      className="venue-card"
      key={venue.id}
      onClick={() => setSelectedVenue(venue)}
    >

      {venue.image_url && (

  <img
    src={venue.image_url}
    alt={venue.name}
    className="venue-image"
  />

)}

      <h3>{venue.name}</h3>

      <p>{venue.location}</p>

      <span>{venue.category}</span>

      <p>{venue.description}</p>
    </div>
  ))}
</section>

        <section className="map-container">
          <ExploreMap
  venues={filteredVenues}
  selectedVenue={selectedVenue}
  userLocation={userLocation}
/>
        </section>
      </div>
    </div>
  );
}

export default Explore;