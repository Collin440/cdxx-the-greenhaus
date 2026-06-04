import { useState, useEffect } from "react";

import { createPost, fetchPosts } from "../lib/supabase";

import { useAuth } from "../context/AuthContext";

import "./Feed.css";

function Feed() {

  const [postText, setPostText] =
    useState("");

  const [posts, setPosts] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    const loadPosts = async () => {
      const data = await fetchPosts();
      setPosts(data);
    };

    loadPosts();
  }, []);

  async function handlePost() {

  if (!postText.trim()) return;

  const newPost =
    await createPost(
      user.id,
      postText
    );

  if (newPost) {

    const updatedPosts =
      await fetchPosts();

    setPosts(updatedPosts);

    setPostText("");

  }

}

console.log("RENDER POSTS:", posts);

  return (

    <div className="feed-page">

      <div className="create-post">

        <textarea
          placeholder="What's the vibe today?"
          value={postText}
          onChange={(e) =>
            setPostText(e.target.value)
          }
        />

        <button
          onClick={handlePost}>
          Post
        </button>

      </div>

      <div className="feed-posts">

  {posts.map((post) => (

    <div
      className="post-card"
      key={post.id}
    >

      <div className="post-header">

        <h3>
       {
        post.profiles?.display_name ||
        post.profiles?.username ||
        "Unknown User"
       }
        </h3>

        <span>
          {
            new Date(
              post.created_at
            ).toLocaleString()
          }
        </span>

      </div>

      <p className="post-content">
        {post.content}
      </p>

      {post.image_url && (

        <img
          src={post.image_url}
          alt="post"
          className="post-image"
        />

      )}

    </div>

  ))}

</div>

    </div>

  );

}

export default Feed;