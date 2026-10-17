// radarRanking.js

// Estimated signals only. OpenStreetMap has no real "vibe" data,
// so we infer mood from the type of place.
const CALM_SIGNALS = {
  boost: [
    "park",
    "garden",
    "library",
    "gallery",
    "museum",
    "cafe",
    "arts_centre",
  ],
  penalty: ["nightclub", "bar", "pub", "fast_food", "stadium"],
};

const PREFERENCE_SIGNALS = {
  quiet: CALM_SIGNALS,
  peaceful: CALM_SIGNALS,
  relaxed: CALM_SIGNALS,
  chill: CALM_SIGNALS,
};

// Collects every type-like label we can find on a place
// into one lowercase list, so we can check them all at once.
function getPlaceTypes(place) {
  return [place.placeType, place.category]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
}

export function scorePlace(place, preferences) {
  const types = getPlaceTypes(place);
  let score = 0;

  for (const preference of preferences) {
    const signals = PREFERENCE_SIGNALS[preference];
    if (!signals) continue;

    if (types.some((type) => signals.boost.includes(type))) score += 1;
    if (types.some((type) => signals.penalty.includes(type))) score -= 1;
  }

  return score;
}

export function rankByPreferences(places, preferences) {
  // No preferences in the query? Leave the order alone (nearest-first).
  if (!preferences || preferences.length === 0) return places;

  return [...places].sort((a, b) => {
    const scoreDifference =
      scorePlace(b, preferences) - scorePlace(a, preferences);

    if (scoreDifference !== 0) return scoreDifference;

    // Same score: keep the closer one first.
    return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
  });
}
