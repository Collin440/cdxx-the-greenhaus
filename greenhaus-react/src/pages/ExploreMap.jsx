import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

const venueIcon = L.divIcon({
  className: "greenhaus-marker",
  html: `
    <div class="marker-pin">
      <div class="marker-core"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const userIcon = L.divIcon({
  className: "greenhaus-user-marker",
  html: `
    <div class="user-marker">
      <div class="user-core"></div>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

L.Icon.Default.imagePath = "/src/assets/images/";

function FlyToVenue({ venue }) {
  const map = useMap();

  if (venue) {
    map.flyTo([venue.lat, venue.lng], 15, {
      duration: 2,
    });
  }

  return null;
}

function ExploreMap({ venues, selectedVenue, userLocation }) {
  return (
    <MapContainer
      center={
        userLocation
          ? [userLocation.lat, userLocation.lng]
          : [-26.2041, 28.0473]
      }
      zoom={12}
      style={{
        width: "100%",
        height: "700px",
        borderRadius: "24px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToVenue venue={selectedVenue} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>You are here 📍</Popup>
        </Marker>
      )}

      {venues.map((venue) => (
        <Marker
          key={venue.id}
          position={[venue.lat, venue.lng]}
          icon={venueIcon}
        >
          <Popup>
            <div className="map-popup">
              <strong>{venue.name}</strong>

              <p>{venue.location}</p>

              <span>{venue.category}</span>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`}
                target="_blank"
                rel="noreferrer"
                className="directions-btn"
              >
                Open in Maps
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default ExploreMap;
