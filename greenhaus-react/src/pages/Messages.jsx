import { useEffect, useRef, useState } from "react";
import {
  fetchConversations,
  fetchConversation,
  fetchMessageableUsers,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
} from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Send, Search, ArrowLeft } from "lucide-react";

import "./Messages.css";

function Messages() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messageListRef = useRef(null);

  async function loadConversations() {
    if (!user?.id) return;

    const data = await fetchConversations(user.id);
    setConversations(data);
  }

  async function loadUsers() {
    if (!user?.id) return;

    const data = await fetchMessageableUsers(user.id);
    setUsers(data);
  }

  async function openConversation(profile) {
    setSelectedUser(profile);
    setShowNewMessage(false);

    await markMessagesAsRead(user.id, profile.id);

    const data = await fetchConversation(user.id, profile.id);
    setMessages(data);

    await loadConversations();
  }

  async function handleSendMessage() {
    const content = messageText.trim();

    if (!content || !selectedUser || sending) return;

    setSending(true);

    const newMessage = await sendMessage(user.id, selectedUser.id, content);

    if (newMessage) {
      setMessages((current) => [...current, newMessage]);
      setMessageText("");
      await loadConversations();
    }

    setSending(false);
  }

  useEffect(() => {
    if (!user?.id) return;

    async function loadMessages() {
      setLoading(true);

      await Promise.all([loadConversations(), loadUsers()]);

      setLoading(false);
    }

    loadMessages();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToMessages(user.id, (newMessage) => {
      const belongsToSelectedConversation =
        selectedUser &&
        ((newMessage.sender_id === selectedUser.id &&
          newMessage.recipient_id === user.id) ||
          (newMessage.sender_id === user.id &&
            newMessage.recipient_id === selectedUser.id));

      if (belongsToSelectedConversation) {
        setMessages((current) => {
          if (current.some((message) => message.id === newMessage.id)) {
            return current;
          }

          return [...current, newMessage];
        });

        if (newMessage.sender_id === selectedUser.id) {
          markMessagesAsRead(user.id, selectedUser.id);
        }
      }

      loadConversations();
    });

    return unsubscribe;
  }, [user, selectedUser]);

  useEffect(() => {
    if (!messageListRef.current) return;

    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages, selectedUser]);

  const filteredUsers = users.filter((profile) => {
    const value = search.toLowerCase();

    return (
      profile.username?.toLowerCase().includes(value) ||
      profile.display_name?.toLowerCase().includes(value)
    );
  });

  if (loading) {
    return (
      <div className="messages-page">
        <h1>Messages</h1>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        <aside className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h1>Messages</h1>

            <button
              className="new-message-button"
              onClick={() => setShowNewMessage(true)}
            >
              New Message
            </button>
          </div>

          <div className="message-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {showNewMessage ? (
            <div className="user-list">
              <button
                className="back-button"
                onClick={() => {
                  setShowNewMessage(false);
                  setSearch("");
                }}
              >
                <ArrowLeft size={18} />
                Back to conversations
              </button>

              {filteredUsers.map((profile) => (
                <button
                  key={profile.id}
                  className="conversation-item"
                  onClick={() => openConversation(profile)}
                >
                  <img
                    src={profile.avatar_url || "/default-avatar.png"}
                    alt=""
                  />

                  <div>
                    <strong>
                      {profile.display_name ||
                        profile.username ||
                        "Unknown User"}
                    </strong>

                    <span>@{profile.username}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="conversation-list">
              {conversations.length === 0 ? (
                <div className="empty-conversations">
                  <p>No conversations yet.</p>

                  <button onClick={() => setShowNewMessage(true)}>
                    Start a conversation
                  </button>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.userId}
                    className="conversation-item"
                    onClick={() => openConversation(conversation.profile)}
                  >
                    <img
                      src={
                        conversation.profile?.avatar_url ||
                        "/default-avatar.png"
                      }
                      alt=""
                    />

                    <div>
                      <strong>
                        {conversation.profile?.display_name ||
                          conversation.profile?.username ||
                          "Unknown User"}
                      </strong>

                      <span>{conversation.latestMessage?.content}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </aside>

        <main className="message-window">
          {!selectedUser ? (
            <div className="message-empty-state">
              <h2>Your messages</h2>
              <p>Select a conversation or start a new one.</p>
            </div>
          ) : (
            <>
              <header className="message-header">
                <img
                  src={selectedUser.avatar_url || "/default-avatar.png"}
                  alt=""
                />

                <div>
                  <strong>
                    {selectedUser.display_name || selectedUser.username}
                  </strong>

                  <span>@{selectedUser.username}</span>
                </div>
              </header>

              <div className="message-list" ref={messageListRef}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-bubble ${
                      message.sender_id === user.id
                        ? "message-own"
                        : "message-other"
                    }`}
                  >
                    <p>{message.content}</p>

                    <span>
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <form
                className="message-input"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="text"
                  placeholder={`Message ${
                    selectedUser.display_name || selectedUser.username
                  }...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />

                <button type="submit" disabled={!messageText.trim() || sending}>
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Messages;
