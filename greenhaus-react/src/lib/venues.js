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
  let query = supabase.from("venues").select("*");

  const normalizedCategory = category?.trim() || "";
  const normalizedLocation = location?.trim() || "";
  const normalizedSearchTerm = searchTerm?.trim() || "";

  if (normalizedCategory) {
    query = query.ilike("category", normalizedCategory);
  }

  if (normalizedLocation) {
    query = query.ilike("location", `%${normalizedLocation}%`);
  }

  if (normalizedSearchTerm) {
    const safeSearchTerm = normalizedSearchTerm
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_")
      .replace(/,/g, "\\,");

    query = query.or(
      [
        `name.ilike.%${safeSearchTerm}%`,
        `location.ilike.%${safeSearchTerm}%`,
        `category.ilike.%${safeSearchTerm}%`,
        `description.ilike.%${safeSearchTerm}%`,
      ].join(","),
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("RADAR SEARCH ERROR:", error);
    return [];
  }

  return data || [];
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
