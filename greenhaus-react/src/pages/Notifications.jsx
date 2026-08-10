import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import "./Notifications.css";

function Notifications() {
  function getNotificationMessage(notification) {
    switch (notification.type) {
      case "post":
        return "Posted something on GreenHaus";

      case "like":
        return "Liked your post";

      case "comment":
        return "Commented on your post";

      case "repost":
        return "Sprouted your post";

      case "follow":
        return "Started following you";

      default:
        return "You have a new notification";
    }
  }
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
      *,
      actor:profiles!notifications_actor_id_fkey (
        username,
        display_name,
        avatar_url
      ),
      post:posts!notifications_post_id_fkey (
        id,
        content
      )
    `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        console.log("NOTIFICATIONS:", data);
        setNotifications(data);
      } else {
        console.error(error);
      }
    }

    loadNotifications();
  }, [user]);

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <h1>Notifications</h1>

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${
                  notification.is_read ? "" : "unread"
                }`}
              >
                <div className="notification-avatar">
                  {notification.actor?.avatar_url ? (
                    <img src={notification.actor.avatar_url} alt="" />
                  ) : (
                    <div className="notification-avatar-placeholder">
                      {notification.actor?.username?.charAt(0).toUpperCase() ||
                        "?"}
                    </div>
                  )}
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <strong>{notification.actor?.username || "Someone"}</strong>

                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p>{getNotificationMessage(notification)}</p>

                  {notification.post?.content && (
                    <div className="notification-post-preview">
                      {notification.post.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
