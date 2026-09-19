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

export async function createPost(
  userId,
  content,
  imageFiles = [],
  videoFile = null,
) {
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

  /* UPLOAD IMAGES */

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

    await supabase
      .from("posts")
      .update({
        media_type: "image",
      })
      .eq("id", post.id);
  }

  /* UPLOAD VIDEO */

  if (videoFile) {
    const extension = videoFile.name.split(".").pop();

    const fileName = `${userId}/${post.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("post-videos")
      .upload(fileName, videoFile);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("post-videos").getPublicUrl(fileName);

    const { error: videoError } = await supabase
      .from("posts")
      .update({
        media_type: "video",
        video_url: publicUrl,
      })
      .eq("id", post.id);

    if (videoError) {
      throw videoError;
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

/* MESSAGES */

export async function sendMessage(senderId, recipientId, content) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return null;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        sender_id: senderId,
        recipient_id: recipientId,
        content: trimmedContent,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  return data;
}

export async function unsendMessage(messageId) {
  const { data, error } = await supabase.rpc("unsend_message", {
    p_message_id: messageId,
  });

  if (error) {
    console.error("Error unsending message:", error);
    return false;
  }

  return data === true;
}

export async function addMessageReaction(messageId, userId, reactionType) {
  const { data, error } = await supabase
    .from("message_reactions")
    .upsert(
      {
        message_id: messageId,
        user_id: userId,
        reaction_type: reactionType,
      },
      {
        onConflict: "message_id,user_id",
      },
    )
    .select()
    .single();

  if (error) {
    console.error("Error adding message reaction:", error);
    return null;
  }

  return data;
}

export async function removeMessageReaction(messageId, userId) {
  const { error } = await supabase
    .from("message_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error removing message reaction:", error);
    return false;
  }

  return true;
}

export async function fetchMessageReactions(messageIds) {
  if (!messageIds || messageIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("message_reactions")
    .select("*")
    .in("message_id", messageIds);

  if (error) {
    console.error("Error fetching message reactions:", error);
    return [];
  }

  return data || [];
}

export async function fetchConversation(userId, otherUserId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`,
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching conversation:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const messageIds = data.map((message) => message.id);

  const { data: deletedMessages, error: deletionError } = await supabase
    .from("message_deletions")
    .select("message_id")
    .eq("user_id", userId)
    .in("message_id", messageIds);

  if (deletionError) {
    console.error("Error fetching deleted messages:", deletionError);
    return data;
  }

  const deletedMessageIds = new Set(
    (deletedMessages || []).map((item) => item.message_id),
  );

  return data.filter((message) => !deletedMessageIds.has(message.id));
}

export async function markMessagesAsRead(userId, otherUserId) {
  const { error } = await supabase
    .from("messages")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("recipient_id", userId)
    .eq("sender_id", otherUserId)
    .is("read_at", null);

  if (error) {
    console.error("Error marking messages as read:", error);
    return false;
  }

  return true;
}

export async function fetchConversations(userId) {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  if (!messages || messages.length === 0) {
    return [];
  }

  const messageIds = messages.map((message) => message.id);

  const { data: deletedMessages, error: deletionError } = await supabase
    .from("message_deletions")
    .select("message_id")
    .eq("user_id", userId)
    .in("message_id", messageIds);

  if (deletionError) {
    console.error("Error fetching deleted messages:", deletionError);
    return [];
  }

  const deletedMessageIds = new Set(
    (deletedMessages || []).map((item) => item.message_id),
  );

  const visibleMessages = messages.filter(
    (message) => !deletedMessageIds.has(message.id),
  );

  if (visibleMessages.length === 0) {
    return [];
  }

  // Get the other user's ID for each message
  const conversationMap = new Map();

  visibleMessages.forEach((message) => {
    const otherUserId =
      message.sender_id === userId ? message.recipient_id : message.sender_id;

    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        userId: otherUserId,
        latestMessage: message,
        unreadCount: 0,
      });
    }

    if (message.recipient_id === userId && message.read_at === null) {
      conversationMap.get(otherUserId).unreadCount += 1;
    }
  });

  const conversationUserIds = Array.from(conversationMap.keys());

  if (conversationUserIds.length === 0) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", conversationUserIds);

  if (profilesError) {
    console.error("Error fetching conversation profiles:", profilesError);
    return [];
  }

  return conversationUserIds.map((conversationUserId) => {
    const conversation = conversationMap.get(conversationUserId);

    const profile = profiles?.find(
      (profile) => profile.id === conversationUserId,
    );

    return {
      userId: conversationUserId,
      profile: profile || null,
      latestMessage: conversation.latestMessage,
      unreadCount: conversation.unreadCount,
    };
  });
}

export async function fetchMessageableUsers(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .neq("id", userId)
    .order("display_name", { ascending: true });

  if (error) {
    console.error("Error fetching messageable users:", error);
    return [];
  }

  return data || [];
}

export function subscribeToMessages(userId, onMessage, onMessageUpdate) {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        onMessage(payload.new);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        if (onMessageUpdate) {
          onMessageUpdate(payload.new);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToTyping(userId, otherUserId, onTypingChange) {
  const conversationId = [userId, otherUserId].sort().join(":");

  const channel = supabase.channel(`typing:${conversationId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState();

    const typingUsers = Object.entries(state)
      .filter(([id]) => id !== userId)
      .flatMap(([, presences]) => presences)
      .filter((presence) => presence.is_typing === true);

    onTypingChange(typingUsers.length > 0);
  });

  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({
        is_typing: false,
      });
    }
  });

  return {
    setTyping: async (isTyping) => {
      await channel.track({
        is_typing: isTyping,
      });
    },

    unsubscribe: async () => {
      await supabase.removeChannel(channel);
    },
  };
}

export async function deleteMessageForMe(messageId, userId) {
  const { error } = await supabase.from("message_deletions").insert({
    message_id: messageId,
    user_id: userId,
  });

  if (error) {
    console.error("Error deleting message for me:", error);
    return false;
  }

  return true;
}

export function subscribeToMessageReactions(userId, onReactionChange) {
  const channel = supabase
    .channel(`message-reactions:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "message_reactions",
      },
      (payload) => {
        if (onReactionChange) {
          onReactionChange(payload);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
