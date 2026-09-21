import { supabase } from "./supabase";

export async function fetchVenues() {
  const { data, error } = await supabase.from("venues").select("*");

  if (error) {
    console.error("UPLOAD ERROR:", error);
    alert(JSON.stringify(error));
    return null;
  }

  return data;
}

export async function searchVenues({
  category = null,
  location = null,
  searchTerm = null,
} = {}) {
  const venues = await fetchVenues();

  if (!venues) {
    return [];
  }

  const normalizedCategory = category?.trim().toLowerCase() || "";
  const normalizedLocation = location?.trim().toLowerCase() || "";
  const normalizedSearchTerm = searchTerm?.trim().toLowerCase() || "";

  return venues.filter((venue) => {
    const matchesCategory =
      !normalizedCategory ||
      venue.category?.toLowerCase() === normalizedCategory;

    const matchesLocation =
      !normalizedLocation ||
      venue.location?.toLowerCase().includes(normalizedLocation);

    const matchesSearch =
      !normalizedSearchTerm ||
      venue.name?.toLowerCase().includes(normalizedSearchTerm) ||
      venue.location?.toLowerCase().includes(normalizedSearchTerm) ||
      venue.category?.toLowerCase().includes(normalizedSearchTerm) ||
      venue.description?.toLowerCase().includes(normalizedSearchTerm);

    return matchesCategory && matchesLocation && matchesSearch;
  });
}

export async function addVenue(venue) {
  const { data, error } = await supabase
    .from("venues")
    .insert([venue])
    .select();

  if (error) {
    console.error(error);

    return null;
  }

  return data[0];
}

export async function uploadVenueImage(file) {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("venue-images")
    .upload(fileName, file);

  if (error) {
    console.error("UPLOAD ERROR:", error);

    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("venue-images").getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteVenue(id) {
  const { error } = await supabase.from("venues").delete().eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to delete venue.");
    return false;
  }

  return true;
}
