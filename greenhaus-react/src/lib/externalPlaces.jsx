import { geocodeLocation } from "./geocoding";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];
const SEARCH_RADIUS_METERS = 8000;
const MAX_RESULTS = 25;

const FETCH_LIMIT = 100;

const CATEGORY_TAGS = {
  Music: [
    '["amenity"="music_venue"]',
    '["amenity"="nightclub"]',
    '["amenity"="arts_centre"]',
  ],

  Gallery: ['["tourism"="gallery"]', '["amenity"="arts_centre"]'],

  Restaurant: [
    '["amenity"="restaurant"]',
    '["amenity"="cafe"]',
    '["amenity"="fast_food"]',
  ],

  Park: ['["leisure"="park"]'],

  Dispensary: ['["shop"="cannabis"]'],
};

const FOOD = '["amenity"~"^(restaurant|cafe|fast_food)$"]';

function toPattern(value) {
  return value
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function buildOverpassQuery({ category, searchTerm, latitude, longitude }) {
  const around = `(around:${SEARCH_RADIUS_METERS},${latitude},${longitude})`;
  const term = searchTerm?.trim() ? toPattern(searchTerm) : null;
  const isFood = !category || category === "Restaurant";

  let statements;

  if (isFood) {
    statements = term
      ? [
          `nwr${FOOD}["cuisine"~"${term}",i]${around};`,
          `nwr${FOOD}["name"~"${term}",i]${around};`,
        ]
      : [`nwr${FOOD}["name"]${around};`];
  } else {
    const nameFilter = term ? `["name"~"${term}",i]` : `["name"]`;
    statements = (CATEGORY_TAGS[category] ?? []).map(
      (tag) => `nwr${tag}${nameFilter}${around};`,
    );
  }

  return `[out:json][timeout:20];(${statements.join("")});out center tags ${FETCH_LIMIT};`;
}

function toTitleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapExternalPlace(element, category, fallbackLocation = null) {
  const tags = element.tags || {};

  const latitude = element.lat ?? element.center?.lat ?? null;

  const longitude = element.lon ?? element.center?.lon ?? null;

  return {
    id: `osm-${element.type}-${element.id}`,
    name: tags.name || "Unnamed place",
    category: toTitleCase(category || "Place"),
    location:
      tags["addr:street"] && tags["addr:city"]
        ? `${tags["addr:street"]}, ${tags["addr:city"]}`
        : tags["addr:suburb"] ||
          tags["addr:city"] ||
          (fallbackLocation
            ? `Near ${toTitleCase(fallbackLocation)}`
            : "South Africa"),
    latitude,
    longitude,
    description: tags.description || "",
    source: "OpenStreetMap",
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
  };
}

function detectCategory(element) {
  const tags = element.tags || {};

  for (const [category, categoryTags] of Object.entries(CATEGORY_TAGS)) {
    for (const tag of categoryTags) {
      const match = tag.match(/\["([^"]+)"="([^"]+)"\]/);

      if (!match) {
        continue;
      }

      const [, key, value] = match;

      if (tags[key] === value) {
        return category;
      }
    }
  }

  return "Place";
}

async function requestOverpass(endpoint, query) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text();

      const error = new Error(
        `Overpass request failed with status ${response.status}: ${responseText.slice(0, 300)}`,
      );
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestWithRetry(endpoint, query) {
  try {
    return await requestOverpass(endpoint, query);
  } catch (error) {
    if (error.status === 429 || error.status === 504) {
      await wait(1500);
      return requestOverpass(endpoint, query);
    }
    throw error;
  }
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((value) => value == null)) {
    return Infinity;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function searchExternalPlaces({
  category = null,
  location = null,
  searchTerm = null,
  userLocation = null,
} = {}) {
  let coordinates;

  if (location) {
    coordinates = await geocodeLocation(location);

    if (!coordinates) {
      console.warn("RADAR LOCATION NOT FOUND:", location);

      return [];
    }
  } else if (userLocation) {
    coordinates = {
      latitude: userLocation.lat,
      longitude: userLocation.lng,
    };
  } else {
    coordinates = {
      latitude: -26.2041,
      longitude: 28.0473,
    };
  }

  const query = buildOverpassQuery({
    category,
    searchTerm,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  });

  console.log("RADAR EXTERNAL SEARCH:", {
    category,
    location,
    searchTerm,
    coordinates,
  });

  console.log("OVERPASS RADIUS:", SEARCH_RADIUS_METERS);
  console.log("OVERPASS QUERY:", query);

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const result = await requestWithRetry(endpoint, query);

      console.log("OVERPASS RESULT COUNT:", result.elements?.length);

      const seen = new Set();

      return result.elements
        .map((element) => {
          const detectedCategory = category || detectCategory(element);

          return mapExternalPlace(element, detectedCategory, location);
        })
        .filter((place) => {
          if (!place.name || place.name === "Unnamed place") {
            return false;
          }

          if (seen.has(place.id)) {
            return false;
          }

          seen.add(place.id);

          return true;
        })
        .map((place) => ({
          ...place,
          distanceMeters: distanceMeters(
            coordinates.latitude,
            coordinates.longitude,
            place.latitude,
            place.longitude,
          ),
        }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, MAX_RESULTS);
    } catch (error) {
      console.warn(`Overpass endpoint failed: ${endpoint}`, error);
    }
  }

  console.error("EXTERNAL RADAR SEARCH ERROR: All Overpass endpoints failed.");

  throw new Error("All Overpass endpoints failed.");
}
