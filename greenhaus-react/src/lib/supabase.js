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

export async function createPost(userId, content, imageFiles = []) {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (postError) {
    console.error(postError);
    return null;
  }

  if (imageFiles.length > 0) {
    const imageRows = [];

    await Promise.all(
      imageFiles.map(async (file) => {
        const extension = file.name.split(".").pop();

        const fileName = `${userId}/${post.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(fileName);

        imageRows.push({
          post_id: post.id,
          image_url: publicUrl,
        });
      }),
    );

    const { error: imageError } = await supabase
      .from("post_images")
      .insert(imageRows);

    if (imageError) {
      throw imageError;
    }
  }

  return post;
}

/* FETCH POSTS */

export async function fetchPosts() {
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles!posts_user_id_fkey(
        username,
        display_name,
        avatar_url
      ),
      likes(user_id),
      comments(id),
      reposts!reposts_post_id_fkey(
        id,
        user_id,
        created_at,
      profiles!reposts_user_id_fkey(
        username,
        display_name,
        avatar_url
       )
      ),
      saved_posts(user_id)
    `,
    )
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error(postsError);
    return [];
  }

  const { data: images, error: imageError } = await supabase
    .from("post_images")
    .select("*");

  if (imageError) {
    console.error(imageError);
    return posts;
  }

  return posts.map((post) => ({
    ...post,
    post_images: images.filter((img) => img.post_id === post.id),
  }));
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

    if (existingLike) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) {
        console.error(error);
        return false;
      }

      return false;
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

/* REPOSTS */

export async function toggleRepost(postId, userId) {
  // Find who owns the post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (postError) {
    console.error("REPOST POST LOOKUP ERROR:", postError);
    return false;
  }

  // Prevent users from reposting their own posts
  if (post.user_id === userId) {
    return false;
  }

  // Check if already reposted
  const { data: existingRepost } = await supabase
    .from("reposts")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  // Remove repost
  if (existingRepost) {
    const { error } = await supabase
      .from("reposts")
      .delete()
      .eq("id", existingRepost.id);

    if (error) {
      console.error(error);
      return false;
    }

    return false;
  }

  // Create repost
  const { error } = await supabase.from("reposts").insert([
    {
      post_id: postId,
      user_id: userId,
    },
  ]);

  if (error) {
    console.error(error);
    return false;
  }

  // Find who owns the post (already queried above, but kept for clarity)
  // Don't notify yourself
  if (post && post.user_id !== userId) {
    await supabase.from("notifications").insert([
      {
        user_id: post.user_id,
        actor_id: userId,
        post_id: postId,
        type: "repost",
        is_read: false,
      },
    ]);
  }

  return true;
}

export async function toggleSave(postId, userId) {
  const { data: existingSave } = await supabase
    .from("saved_posts")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingSave) {
    const { error } = await supabase
      .from("saved_posts")
      .delete()
      .eq("id", existingSave.id);

    if (error) {
      console.error(error);
      return false;
    }

    return false;
  }

  const { error } = await supabase.from("saved_posts").insert([
    {
      post_id: postId,
      user_id: userId,
    },
  ]);

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}

/* FETCH SAVED POSTS */

export async function fetchSavedPosts(userId) {
  const { data, error } = await supabase
    .from("saved_posts")
    .select(
      `
      post_id,
      posts (
        *,
        profiles!posts_user_id_fkey (
          username,
          display_name,
          avatar_url
        ),
        post_images (
        *
        ),
        likes (
          user_id
        ),
        comments (
          id
        ),
        reposts (
          user_id
        ),
        saved_posts (
          user_id
        )
      )
    `,
    )
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((item) => item.posts);
}
