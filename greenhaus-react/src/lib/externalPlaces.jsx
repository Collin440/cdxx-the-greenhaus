import { geocodeLocation } from "./geocoding";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const SEARCH_RADIUS_METERS = 8000;
const MAX_RESULTS = 25;

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

function escapeOverpassSearch(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildOverpassQuery({
  category = null,
  searchTerm = null,
  latitude,
  longitude,
}) {
  const search = searchTerm?.trim()
    ? escapeOverpassSearch(searchTerm.trim())
    : null;

  if (category === "Restaurant") {
    const nameFilter = search ? `[name~"${search}",i]` : "";

    return `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"]${nameFilter}(around:8000,${latitude},${longitude});
        way["amenity"="restaurant"]${nameFilter}(around:8000,${latitude},${longitude});
      );
      out center tags 25;
    `;
  }

  const tags = category
    ? CATEGORY_TAGS[category] || []
    : Object.values(CATEGORY_TAGS).flat();

  const queries = tags.flatMap((tag) => {
    const nameFilter = search ? `[name~"${search}",i]` : `[name]`;

    return [
      `node${tag}${nameFilter}(around:8000,${latitude},${longitude});`,
      `way${tag}${nameFilter}(around:8000,${latitude},${longitude});`,
    ];
  });

  return `
    [out:json][timeout:25];
    (
      ${queries.join("\n")}
    );
    out center tags 25;
  `;
}

function mapExternalPlace(element, category) {
  const tags = element.tags || {};

  const latitude = element.lat ?? element.center?.lat ?? null;

  const longitude = element.lon ?? element.center?.lon ?? null;

  return {
    id: `osm-${element.type}-${element.id}`,
    name: tags.name || "Unnamed place",
    category: category || "Place",
    location:
      tags["addr:street"] && tags["addr:city"]
        ? `${tags["addr:street"]}, ${tags["addr:city"]}`
        : tags["addr:city"] || "South Africa",
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
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `Overpass request failed with status ${response.status}: ${responseText.slice(
        0,
        300,
      )}`,
    );
  }

  return response.json();
}

export async function searchExternalPlaces({
  category = null,
  location = null,
  searchTerm = null,
} = {}) {
  // eslint-disable-next-line no-useless-assignment
  let coordinates = null;

  if (location) {
    coordinates = await geocodeLocation(location);

    if (!coordinates) {
      console.warn("RADAR LOCATION NOT FOUND:", location);

      return [];
    }
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

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const result = await requestOverpass(endpoint, query);

      const seen = new Set();

      return result.elements
        .map((element) => {
          const detectedCategory = category || detectCategory(element);

          return mapExternalPlace(element, detectedCategory);
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
        .slice(0, MAX_RESULTS);
    } catch (error) {
      console.warn(`Overpass endpoint failed: ${endpoint}`, error);
    }
  }

  console.error("EXTERNAL RADAR SEARCH ERROR: All Overpass endpoints failed.");

  return [];
}
