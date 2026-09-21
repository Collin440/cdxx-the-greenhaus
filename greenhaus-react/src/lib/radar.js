const RADAR_CATEGORIES = [
  "Music",
  "Gallery",
  "Dispensary",
  "Restaurant",
  "Park",
];

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

  park: "Park",
  parks: "Park",
};

export function parseRadarIntent(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return {
      category: null,
      location: null,
      searchTerm: null,
    };
  }

  let category = null;

  for (const [alias, mappedCategory] of Object.entries(CATEGORY_ALIASES)) {
    if (normalizedQuery.includes(alias)) {
      category = mappedCategory;
      break;
    }
  }

  let location = null;

  const locationMatch = normalizedQuery.match(/\b(?:in|near|around)\s+(.+)$/i);

  if (locationMatch) {
    location = locationMatch[1].trim();
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
      .replace(/\s+/g, " ")
      .trim();
  }

  return {
    category,
    location,
    searchTerm: searchTerm || null,
  };
}
