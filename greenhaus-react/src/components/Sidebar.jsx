import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Sidebar.css";

import {
  FaHome,
  FaCompass,
  FaEnvelope,
  FaBell,
  FaBookmark,
  FaCog,
  FaPlusCircle,
} from "react-icons/fa";

import { useAuth }
  from "../context/AuthContext";

import { supabase }
  from "../lib/supabase";

import { useNavigate }
  from "react-router-dom";

import logo from "../assets/cdxx_logo.jpeg";  

function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      if (mounted) {
        setProfile(data);
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function handleLogout() {

  await supabase.auth.signOut();

  navigate("/login");

}

  return (
    <aside className="sidebar">
      
    <NavLink
  to="/app/profile"
  className="profile-link"
>
  
  <div className="brand">

    <img
      src={
        profile?.avatar_url ||
        logo
      }
      alt="Profile"
      className="profile-sidebar-avatar"
    />

    <h2 className="sidebar-display-name">
      {profile?.display_name || "GreenHaus User"}
    </h2>

    <p className="brand-username">
      @{profile?.username || "username"}
    </p>

  </div>

</NavLink>

      <nav className="sidebar-nav">

        <NavLink to="/app/feed" className="post-link">
          <FaPlusCircle />
          <span>Spark Up!</span>
        </NavLink>

        <NavLink to="/app">
          <FaHome />
          <span>Home</span>
        </NavLink>

        <NavLink to="/app/explore">
          <FaCompass />
          <span>Explore</span>
        </NavLink>

        <NavLink to="/app/notifications">
          <FaBell />
          <span>Notifications</span>
        </NavLink>

        <NavLink to="/app/messages">
          <FaEnvelope />
          <span>Messages</span>
        </NavLink>

        <NavLink to="/app/saved">
          <FaBookmark />
          <span>Saved</span>
        </NavLink>

        <NavLink to="/app/settings">
          <FaCog />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="user-section">

        <img
           src={logo}
           alt="CDXX Logo"
           className="footer-logo"
        />

        <p className="user-email">
           {user?.email}
        </p>

        <button
           onClick={handleLogout}
           className="logout-btn"
        >
          Logout
        </button>

</div>

    </aside>
  );
}

export default Sidebar;

