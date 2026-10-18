import { supabase } from "./supabase";
import { parseRadarIntent } from "./radar";

export async function parseRadarIntentSmart(query) {
  const basicIntent = parseRadarIntent(query);

  // Nothing to interpret, or the regex parser already understood the query:
  // skip the AI call and save the free quota.
  if (!query.trim() || basicIntent.category) {
    return basicIntent;
  }

  try {
    const { data, error } = await supabase.functions.invoke("radar-intent", {
      body: { query },
    });

    if (error || !data?.intent) {
      throw error || new Error("No intent returned");
    }

    console.log("RADAR AI INTENT:", data.intent);
    return data.intent;
  } catch (error) {
    console.warn("AI intent failed, using basic parser:", error);
    return basicIntent;
  }
}
