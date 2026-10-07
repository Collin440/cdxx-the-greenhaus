const CATEGORY_ALIASES = {
  music: "Music",
  musician: "Music",
  musicians: "Music",
  concerts: "Music",
  concert: "Music",
  gigs: "Music",
  gig: "Music",

  gallery: "Gallery",
  galleries: "Gallery",
  art: "Gallery",
  arts: "Gallery",

  dispensary: "Dispensary",
  dispensaries: "Dispensary",
  weed: "Dispensary",
  cannabis: "Dispensary",

  restaurant: "Restaurant",
  restaurants: "Restaurant",
  food: "Restaurant",
  dining: "Restaurant",
  coffee: "Restaurant",
  cafe: "Restaurant",
  cafes: "Restaurant",

  park: "Park",
  parks: "Park",
};

const RADAR_PREFERENCES = ["quiet", "peaceful", "relaxed", "chill"];
const NEAR_ME_PHRASES = ["me", "my location", "my area", "here"];

const hasWord = (text, word) => new RegExp(`\\b${word}\\b`, "i").test(text);

export function parseRadarIntent(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return {
      category: null,
      location: null,
      searchTerm: null,
      preferences: [],
    };
  }

  let category = null;
  let preferences = [];

  for (const [alias, mappedCategory] of Object.entries(CATEGORY_ALIASES)) {
    if (hasWord(normalizedQuery, alias)) {
      category = mappedCategory;
      break;
    }
  }

  for (const preference of RADAR_PREFERENCES) {
    if (hasWord(normalizedQuery, preference)) {
      preferences.push(preference);
    }
  }

  let location = null;

  const locationMatch = normalizedQuery.match(/\b(?:in|near|around)\s+(.+)$/i);

  if (locationMatch) {
    const capturedLocation = locationMatch[1].trim();

    location = NEAR_ME_PHRASES.includes(capturedLocation)
      ? null
      : capturedLocation;
  }

  let searchTerm = query.trim();

  // Remove the location phrase from the search term.
  if (locationMatch) {
    searchTerm = searchTerm.replace(/\b(?:in|near|around)\s+(.+)$/i, "").trim();
  }

  // Remove the category words because they are already
  // represented by the category field.
  if (category) {
    const categoryAliases = Object.keys(CATEGORY_ALIASES)
      .sort((a, b) => b.length - a.length)
      .join("|");

    const categoryRegex = new RegExp(`\\b(?:${categoryAliases})\\b`, "gi");

    searchTerm = searchTerm
      .replace(categoryRegex, "")
      .replace(
        /\b(?:somewhere|someplace|a place|to get|where to|looking for|find me|find|show me|a)\b/gi,
        "",
      );
  }

  // Remove preference words because they are represented
  // separately in the preferences field.
  for (const preference of RADAR_PREFERENCES) {
    const preferenceRegex = new RegExp(`\\b${preference}\\b`, "gi");
    searchTerm = searchTerm.replace(preferenceRegex, "");
  }

  searchTerm = searchTerm.replace(/\s+/g, " ").trim();

  return {
    category,
    location,
    searchTerm: searchTerm || null,
    preferences,
  };
}
