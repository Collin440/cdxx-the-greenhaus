const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

const geocodeCache = new Map();

export async function geocodeLocation(location) {
  const normalizedLocation = location?.trim().toLowerCase();

  if (!normalizedLocation) {
    return null;
  }

  if (geocodeCache.has(normalizedLocation)) {
    return geocodeCache.get(normalizedLocation);
  }

  const params = new URLSearchParams({
    q: `${location}, South Africa`,
    format: "jsonv2",
    limit: "1",
    countrycodes: "za",
  });

  try {
    const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed with status ${response.status}`);
    }

    const results = await response.json();

    if (!results.length) {
      return null;
    }

    const result = {
      latitude: Number(results[0].lat),
      longitude: Number(results[0].lon),
      displayName: results[0].display_name,
    };

    geocodeCache.set(normalizedLocation, result);

    return result;
  } catch (error) {
    console.error("RADAR GEOCODING ERROR:", error);
    return null;
  }
}
