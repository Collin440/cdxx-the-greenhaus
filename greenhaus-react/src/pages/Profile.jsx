import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import logo from "../assets/cdxx_logo.jpeg";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const profileId = id || user?.id;

  const isOwnProfile = profileId === user?.id;

  const [profile, setProfile] = useState(null);

  const [activeTab, setActiveTab] = useState("posts");

  const [postCount, setPostCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

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

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  // follower/following lists not currently used
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    loadFollowers();
  }, [profileId]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      console.log("AUTH USER ID:", user?.id);
      console.log("ROUTE ID:", id);
      console.log("PROFILE ID USED:", profileId);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      console.log("PROFILE ID:", profileId);
      console.log("FOLLOWING ERROR:", error);
      console.log("FOLLOWING DATA:", data);

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
        .eq("user_id", profileId);

      setPostCount(posts || 0);

      const { count: followers, error: followersError } = await supabase
        .from("user_following")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileId);

      console.log("Followers Error:", followersError);
      console.log("Followers Count:", followers);
      setFollowersCount(followers || 0);

      const { count: following, error: followingError } = await supabase
        .from("user_following")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileId);

      console.log("Following Error:", followingError);
      console.log("Following Count:", following);
      setFollowingCount(following || 0);

      const { data: userPosts } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });

      setPosts(userPosts || []);

      let completion = 0;

      if (data.avatar_url) completion += 20;
      if (data.banner_url) completion += 20;
      if (data.bio) completion += 20;
      if (data.location) completion += 20;
      if (data.website) completion += 20;

      setProfileCompletion(completion);

      if (!isOwnProfile) {
        const { data: followRecord } = await supabase
          .from("user_following")
          .select("*")
          .eq("follower_id", user.id)
          .eq("following_id", profileId)
          .maybeSingle();

        setIsFollowing(!!followRecord);
      }
    }

    fetchProfile();
  }, [user, profileId]);

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

    const { data } = supabase.storage.from("banners").getPublicUrl(fileName);

    console.log("Banner URL retrieved");

    return data.publicUrl;
  }

  async function saveProfile() {
    const avatarUrl = await uploadAvatar();
    const bannerUrl = await uploadBanner();

    console.log("Uploading profile images completed");

    const currentProfileId = id || user.id;

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
      .eq("id", currentProfileId);

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

  async function loadFollowers() {
    const { data, error } = await supabase
      .from("user_following")
      .select(
        `
      follower_id,
      follower:user_following_follower_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      )
    `,
      )
      .eq("following_id", profileId);

    console.log(JSON.stringify(data, null, 2));
    console.log("Followers Error:", error);

    if (error) {
      console.error(error);
      return;
    }

    setFollowersList(data || []);
  }

  async function loadFollowing() {
    console.log("========== loadFollowing START ==========");

    console.log("loadFollowing profileId:", profileId);

    const { data, error } = await supabase
      .from("user_following")
      .select(
        `
      following_id,
      following:user_following_following_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      )
    `,
      )
      .eq("follower_id", profileId);

    if (error) {
      console.error(error);
      return;
    }

    setFollowingList(data || []);

    console.log("Following List State:", data || []);
    console.log("========== loadFollowing END ==========");
  }

  useEffect(() => {
    if (!showFollowersModal) return;

    async function fetchFollowers() {
      await loadFollowers();
    }

    fetchFollowers();
  }, [showFollowersModal, profileId]);

  useEffect(() => {
    if (!showFollowingModal) return;

    async function fetchFollowing() {
      await loadFollowing();
    }

    fetchFollowing();
  }, [showFollowingModal, profileId]);

  async function toggleFollow() {
    if (!user || isOwnProfile) return;

    if (isFollowing) {
      const { error } = await supabase
        .from("user_following")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", profileId);

      if (error) {
        console.error(error);
        return;
      }

      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
    } else {
      const { error } = await supabase.from("user_following").insert({
        follower_id: user.id,
        following_id: profileId,
      });

      if (error) {
        console.error(error);
        return;
      }

      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    }
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

      <h1>{profile?.display_name || "GreenHaus User"}</h1>

      <p className="profile-username">@{profile?.username}</p>

      <p style={{ color: "red" }}>Profile ID: {profileId}</p>

      {isOwnProfile ? (
        <button
          className="edit-profile-btn"
          onClick={() => setShowEditModal(true)}
        >
          Edit Profile
        </button>
      ) : (
        <button
          className={isFollowing ? "following-btn" : "follow-btn"}
          onClick={toggleFollow}
        >
          {isFollowing ? "✓ Following" : "+ Follow"}
        </button>
      )}

      <div className="profile-stats">
        <div>
          <strong>{postCount}</strong>
          <span>Posts</span>
        </div>

        <div
          className="clickable-stat"
          onClick={() => setShowFollowersModal(true)}
        >
          <strong>{followersCount}</strong>
          <span>Followers</span>
        </div>

        <div
          className="clickable-stat"
          onClick={() => setShowFollowingModal(true)}
        >
          <strong>{followingCount}</strong>
          <span>Following</span>
        </div>
      </div>

      <p>{profile?.bio || "Just a cannabis enthusiast"}</p>

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
            <a href={profile.website} target="_blank" rel="noreferrer">
              {profile.website}
            </a>
          </div>
        )}

        {profile?.created_at && (
          <div className="profile-joined">
            <span>📅</span>
            <span>
              Joined {new Date(profile.created_at).toLocaleDateString()}
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
        {postCount >= 1 && <span className="badge">🌱 First Post</span>}

        {postCount >= 10 && <span className="badge">🔥 Active Grower</span>}

        {followersCount >= 100 && (
          <span className="badge">⭐ Community Favorite</span>
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
            <div className="empty-profile-state">No posts yet.</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="profile-post-card">
                <p>{post.content}</p>

                <small>{new Date(post.created_at).toLocaleDateString()}</small>
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
              onChange={(e) => setEditDisplayName(e.target.value)}
            />

            <label>Bio</label>

            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
            />

            <label>Location</label>

            <input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
            />

            <label>Website</label>

            <input
              type="text"
              value={editWebsite}
              onChange={(e) => setEditWebsite(e.target.value)}
            />

            <div className="file-upload-group">
              <label>Avatar</label>

              <label className="file-upload-btn">
                Choose Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                  hidden
                />
              </label>

              <span className="file-name">
                {avatarFile ? avatarFile.name : "No avatar selected"}
              </span>
            </div>

            <div className="file-upload-group">
              <label>Banner</label>

              <label className="file-upload-btn">
                Choose Banner
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files[0])}
                  hidden
                />
              </label>

              <span className="file-name">
                {bannerFile ? bannerFile.name : "No banner selected"}
              </span>
            </div>

            {editBanner && (
              <img
                src={editBanner}
                alt="Banner Preview"
                className="banner-preview"
              />
            )}

            <div className="modal-actions">
              <button className="save-btn" onClick={saveProfile}>
                Save
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFollowersModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFollowersModal(false)}
        >
          <div className="followers-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Followers</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowFollowersModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="followers-list">
              {followersList.length === 0 ? (
                <p>No followers yet.</p>
              ) : (
                followersList.map((follower) => (
                  <div
                    key={follower.follower_id}
                    className="follower-item"
                    onClick={() => {
                      setShowFollowersModal(false);
                      navigate(`/app/profile/${follower.follower_id}`);
                    }}
                  >
                    <img
                      src={follower.follower?.avatar_url || logo}
                      alt=""
                      className="follower-avatar"
                    />

                    <div>
                      <strong>{follower.follower?.display_name}</strong>
                      <p>@{follower.follower?.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showFollowingModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFollowingModal(false)}
        >
          <div className="followers-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Following</h2>

              <button
                className="close-modal-btn"
                onClick={() => setShowFollowingModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="followers-list">
              {followingList.length === 0 ? (
                <p>No following yet.</p>
              ) : (
                followingList.map((item) => (
                  <div
                    key={item.following_id}
                    className="follower-item"
                    onClick={() => {
                      setShowFollowingModal(false);
                      navigate(`/app/profile/${item.following_id}`);
                    }}
                  >
                    <img
                      src={item.following?.avatar_url || logo}
                      alt=""
                      className="follower-avatar"
                    />

                    <div>
                      <strong>{item.following?.display_name}</strong>

                      <p>@{item.following?.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
