import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const {
      data,
      error,
    } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setNotifications(data);
    } else {
      console.error(error);
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Notifications</h1>

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              padding: "20px",
              marginBottom: "15px",
              background: "#052b20",
              borderRadius: "12px",
            }}
          >
            <strong>{notification.type}</strong>

            <br />

            <small>
              {new Date(notification.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;