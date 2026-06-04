import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import logo from "../assets/cdxx_logo.jpeg";
import { supabase } from "../lib/supabase";
import "./Profile.css";

function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);

  const [activeTab, setActiveTab] = useState("posts");

  const [postCount, setPostCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [posts, setPosts] = useState([]);

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editBanner, setEditBanner] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setProfile(data);

      setEditDisplayName(data.display_name || "");
      setEditBio(data.bio || "");
      setEditLocation(data.location || "");
      setEditWebsite(data.website || "");
      setEditAvatar(data.avatar_url || "");
      setEditBanner(data.banner_url || "");

      const { count: posts } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setPostCount(posts || 0);

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id);

      setFollowersCount(followers || 0);

      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id);

      setFollowingCount(following || 0);

      const { data: userPosts } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPosts(userPosts || []);

      let completion = 0;

      if (data.avatar_url) completion += 20;
      if (data.banner_url) completion += 20;
      if (data.bio) completion += 20;
      if (data.location) completion += 20;
      if (data.website) completion += 20;

      setProfileCompletion(completion);
    }

    fetchProfile();
  }, [user]);

  async function uploadAvatar() {

  console.log("Avatar upload started");

  if (!avatarFile || !user) return editAvatar;

  const fileName = `${user.id}-${Date.now()}`;

  // upload avatar to 'avatars' bucket
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, avatarFile, {
      upsert: true,
    });

  console.log("Avatar upload data:", uploadData);
  console.log("Avatar upload error:", uploadError);

  if (uploadError) {
    console.error(uploadError);
    return editAvatar;
  }

  const { data: publicData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}

async function uploadBanner() {
  if (!bannerFile || !user) return editBanner;

  console.log("Banner upload started");

  const fileName = `${user.id}-${Date.now()}`;

  console.log("Current user:", user);
  console.log("Current user id:", user?.id);

const {
  data: { session },
} = await supabase.auth.getSession();

console.log("Current session:", session);

  const { data: uploadData, error } = await supabase.storage
    .from("banners")
    .upload(fileName, bannerFile, {
      upsert: true,
    });

  console.log("Banner upload data:", uploadData);
  console.log("Banner upload error:", error);

  console.log("Banner upload completed");

  if (error) {
    console.error(error);
    return editBanner;
  }

  const { data } = supabase.storage
    .from("banners")
    .getPublicUrl(fileName);

  console.log("Banner URL retrieved");

  return data.publicUrl;
}

  async function saveProfile() {

  const avatarUrl = await uploadAvatar();
  const bannerUrl = await uploadBanner();

  console.log("Uploading profile images completed");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: editDisplayName,
      bio: editBio,
      location: editLocation,
      website: editWebsite,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
    })
    .eq("id", user.id);

    console.log("Profile update error:", error);

  if (error) {
    console.error(error);
    return;
  }

  setProfile({
    ...profile,
    display_name: editDisplayName,
    bio: editBio,
    location: editLocation,
    website: editWebsite,
    avatar_url: avatarUrl,
    banner_url: bannerUrl,
  });

  let completion = 0;

if (avatarUrl) completion += 20;
if (bannerUrl) completion += 20;
if (editBio) completion += 20;
if (editLocation) completion += 20;
if (editWebsite) completion += 20;

  setProfileCompletion(completion);

  setShowEditModal(false);
}

  return (
    <div className="profile-page">

      <div
        className="profile-banner"
        style={{
          backgroundImage: `url(${
            profile?.banner_url ||
            "https://images.unsplash.com/photo-1514905552197-0610a4d8fd73"
          })`,
        }}
      ></div>

      <img
        src={profile?.avatar_url || logo}
        alt="Profile"
        className="profile-avatar"
      />

      <h1>
         {profile?.display_name || "GreenHaus User"}
      </h1>

      <p>@{profile?.username}</p>

      <button
        className="edit-profile-btn"
        onClick={() => setShowEditModal(true)}
      >
        Edit Profile
      </button>

      <div className="profile-stats">
        <div>
          <strong>{postCount}</strong>
          <span>Posts</span>
        </div>

        <div>
          <strong>{followersCount}</strong>
          <span>Followers</span>
        </div>

        <div>
          <strong>{followingCount}</strong>
          <span>Following</span>
        </div>
      </div>

      <p>
        {profile?.bio || "Just a cannabis enthusiast"}
      </p>

      {/* PROFILE DETAILS */}

<div className="profile-details">

  {profile?.location && (
    <div className="profile-location">
      <span>📍</span>
      <span>{profile.location}</span>
    </div>
  )}

  {profile?.website && (
    <div className="profile-website">
      <span>🌐</span>
      <a
        href={profile.website}
        target="_blank"
        rel="noreferrer"
      >
        {profile.website}
      </a>
    </div>
  )}

  {profile?.created_at && (
    <div className="profile-joined">
      <span>📅</span>
      <span>
        Joined{" "}
        {new Date(profile.created_at).toLocaleDateString()}
      </span>
    </div>
  )}

</div>

      {/* PROFILE COMPLETION */}

      <div className="profile-completion">

        <div className="completion-header">
          <span>Profile Completion</span>
          <span>{profileCompletion}%</span>
        </div>

        <div className="completion-bar">
          <div
            className="completion-fill"
            style={{ width: `${profileCompletion}%` }}
          ></div>
        </div>

      </div>

      {/* BADGES */}

      <div className="profile-badges">

        {postCount >= 1 && (
          <span className="badge">
            🌱 First Post
          </span>
        )}

        {postCount >= 10 && (
          <span className="badge">
            🔥 Active Grower
          </span>
        )}

        {followersCount >= 100 && (
          <span className="badge">
            ⭐ Community Favorite
          </span>
        )}

      </div>

      <div className="profile-tabs">

        <button
          className={activeTab === "posts" ? "active-tab" : ""}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>

        <button
          className={activeTab === "media" ? "active-tab" : ""}
          onClick={() => setActiveTab("media")}
        >
          Media
        </button>

        <button
          className={activeTab === "likes" ? "active-tab" : ""}
          onClick={() => setActiveTab("likes")}
        >
          Likes
        </button>

        <button
          className={activeTab === "saved" ? "active-tab" : ""}
          onClick={() => setActiveTab("saved")}
        >
          Saved
        </button>

      </div>

      {activeTab === "posts" && (
        <div className="profile-posts">

          {posts.length === 0 ? (
            <div className="empty-profile-state">
              No posts yet.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="profile-post-card"
              >
                <p>{post.content}</p>

                <small>
                  {new Date(
                    post.created_at
                  ).toLocaleDateString()}
                </small>
              </div>
            ))
          )}

        </div>
      )}

      {showEditModal && (

  <div className="modal-overlay">

    <div className="edit-profile-modal">

      <h2>Edit Profile</h2>

      <label>Display Name</label>

      <input
        type="text"
        value={editDisplayName}
        onChange={(e) =>
          setEditDisplayName(e.target.value)
        }
      />

      <label>Bio</label>

      <textarea
        value={editBio}
        onChange={(e) =>
          setEditBio(e.target.value)
        }
      />

      <label>Location</label>

      <input
        type="text"
        value={editLocation}
        onChange={(e) =>
          setEditLocation(e.target.value)
        }
      />

      <label>Website</label>

      <input
        type="text"
        value={editWebsite}
        onChange={(e) =>
          setEditWebsite(e.target.value)
        }
      />

      <label>Avatar</label>

      <input
       type="file"
       accept="image/*"
       onChange={(e) =>
         setAvatarFile(e.target.files[0])
        }
      />

      <input
        type="text"
        value={editAvatar}
        onChange={(e) =>
          setEditAvatar(e.target.value)
        }
      />

      <label>Banner</label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setBannerFile(e.target.files[0])
        }
      />

      <input
        type="text"
        value={editBanner}
        onChange={(e) =>
          setEditBanner(e.target.value)
        }
      />

        {editBanner && (
      <img
        src={editBanner}
        alt="Banner Preview"
        className="banner-preview"
      />
        )}

      <div className="modal-actions">

        <button
          className="save-btn"
          onClick={saveProfile}
        >
          Save
        </button>

        <button
          className="cancel-btn"
          onClick={() =>
            setShowEditModal(false)
          }
        >
          Cancel
        </button>

      </div>

    </div>

  </div>

)}

    </div>
  );
}

export default Profile;