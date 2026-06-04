import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Settings.css";

function Settings() {
  const [profile, setProfile] = useState(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  const [success, setSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  async function getProfile() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

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
    setDisplayName(data.display_name || "");
    setUsername(data.username || "");
  }

  useEffect(() => {
    getProfile();
  }, []);

  async function uploadAvatar() {
  if (!avatarFile || !profile) return;

  const fileExt = avatarFile.name.split(".").pop();
  const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

  console.log("Uploading avatar...");
  console.log("User:", profile);
  console.log("File:", avatarFile);

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, avatarFile, {
      upsert: true,
    });

  if (uploadError) {
    console.error(uploadError);
    alert("Avatar upload failed");
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

    console.log("Public URL:", publicUrl);
    console.log("Profile ID:", profile.id);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
    })
    .eq("id", profile.id);

    console.log("Update error:", updateError);

  if (updateError) {
    console.error(updateError);
    alert("Failed to save avatar URL");
    return;
  }

  setProfile({
    ...profile,
    avatar_url: publicUrl,
  });
}


  async function updateProfile() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user || !profile) return;

    let avatarUrl = profile.avatar_url;

    // Upload avatar if selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();

      const fileName =
        `${user.id}.${fileExt}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, {
            upsert: true
          });

      if (uploadError) {
        console.error(uploadError);
        alert("Avatar upload failed");
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      avatarUrl = publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        username: username,
        avatar_url: avatarUrl
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      alert("Failed to update profile");
      return;
    }

    setProfile({
      ...profile,
      display_name: displayName,
      username: username,
      avatar_url: avatarUrl
    });

    setAvatarFile(null);

    if (avatarFile) {
  await uploadAvatar();
}

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  }

  return (
    <div className="settings-container">
      <h1 className="settings-title">
        Settings
      </h1>

      {success && (
        <div className="success-toast">
          Profile updated successfully!
        </div>
      )}

      {profile && (
        <>
          <div className="avatar-section">

            <label htmlFor="avatar-upload">
             <img
                  src={
                  avatarPreview ||
                  profile.avatar_url ||
                  "https://via.placeholder.com/120"
                  }
                  alt="Profile"
                  className="profile-avatar clickable-avatar"
             />
            </label>

            <input
              className="avatar-upload-input"
              type="file"
              accept="image/*"
              id="avatar-upload"
              onChange={(e) => {
          const file = e.target.files[0];

          if (!file) return;

              setAvatarFile(file);

              setAvatarPreview(
              URL.createObjectURL(file)
            );
          }}
            />

          </div>

          <div className="settings-form">

            <div className="settings-group">
              <label>
                Display Name
              </label>

              <input
                type="text"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="settings-group">
              <label>
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
              />
            </div>

            <button
              className="save-btn"
              onClick={updateProfile}
              disabled={
                displayName === profile?.display_name &&
                username === profile?.username &&
                !avatarFile
              }
            >
              {displayName === profile?.display_name &&
              username === profile?.username &&
              !avatarFile
                ? "Saved ✓"
                : "Save Changes"}
            </button>

          </div>
        </>
      )}
    </div>
  );
}

export default Settings;