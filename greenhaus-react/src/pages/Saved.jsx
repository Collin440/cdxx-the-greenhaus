import { useEffect, useState } from "react";

import { fetchSavedPosts } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function Saved() {
  const { user } = useAuth();

  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    async function loadSavedPosts() {
      if (!user) return;

      const data = await fetchSavedPosts(user.id);

      setSavedPosts(data);
    }

    loadSavedPosts();
  }, [user]);

  return (
    <div>
      <h1>Saved</h1>

      <p>Total Saved Posts: {savedPosts.length}</p>
    </div>
  );
}

export default Saved;
