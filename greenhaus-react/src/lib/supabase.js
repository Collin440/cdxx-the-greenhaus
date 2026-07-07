import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* SIGN UP */

export async function signUpUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error(error);

    return null;
  }

  const user = data.user;

  if (user) {
    const username = email.split("@")[0];

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        username: username,
        display_name: username,
      },
    ]);

    if (profileError) {
      console.error(profileError);
    }
  }

  return data;
}

/* LOGIN */

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error);

    return null;
  }

  return data;
}

/* CREATE POST */

export async function createPost(userId, content) {
  console.log("USER ID:", userId);
  console.log("CONTENT:", content);

  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        user_id: userId,
        content: content,
      },
    ])
    .select();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    console.error(error);

    return null;
  }

  return data[0];
}

/* FETCH POSTS */

export async function fetchPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
  *,
  profiles!posts_user_id_fkey (
    username,
    display_name,
    avatar_url
  ),
  likes (
    user_id
  ),
  comments (
    id
  )
`,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("FETCH ERROR:", error);
    return [];
  }

  console.log("POSTS:", JSON.stringify(data, null, 2));

  return data;
}

/* LIKES */

export async function toggleLike(postId, userId) {
  // Check if already liked
  const { data: existingLike } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  // Already liked → remove it
  if (existingLike) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("id", existingLike.id);

    if (error) {
      console.error(error);
      return false;
    }

    if (!error) {
      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .single();

      if (post.user_id !== userId) {
        await supabase.from("notifications").insert([
          {
            user_id: post.user_id,
            actor_id: userId,
            post_id: postId,
            type: "like",
            is_read: false,
          },
        ]);
      }
    }

    return false;
  }

  // Not liked → create like
  const { error } = await supabase.from("likes").insert([
    {
      post_id: postId,
      user_id: userId,
    },
  ]);

  if (error) {
    console.error(error);
    return false;
  }

  // Find who owns the post
  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  // Don't notify yourself
  if (post && post.user_id !== userId) {
    await supabase.from("notifications").insert([
      {
        user_id: post.user_id,
        actor_id: userId,
        post_id: postId,
        type: "like",
        is_read: false,
      },
    ]);
  }

  return true;
}
