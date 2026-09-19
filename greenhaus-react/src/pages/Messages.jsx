import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchConversations,
  fetchConversation,
  fetchMessageableUsers,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToTyping,
  unsendMessage,
  addMessageReaction,
  removeMessageReaction,
  fetchMessageReactions,
  subscribeToMessageReactions,
} from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  Send,
  Search,
  ArrowLeft,
  Heart,
  Laugh,
  Flame,
  Frown,
  Angry,
} from "lucide-react";

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
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [messageReactions, setMessageReactions] = useState([]);

  const messageListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingChannelRef = useRef(null);
  const selectedUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    const data = await fetchConversations(user.id);
    setConversations(data);
  }, [user]);

  const loadUsers = useCallback(async () => {
    if (!user?.id) return;

    const data = await fetchMessageableUsers(user.id);
    setUsers(data);
  }, [user]);

  async function openConversation(profile) {
    setSelectedUser(profile);
    setShowNewMessage(false);

    await markMessagesAsRead(user.id, profile.id);

    const data = await fetchConversation(user.id, profile.id);
    setMessages(data);

    const messageIds = data.map((message) => message.id);
    const reactions = await fetchMessageReactions(messageIds);
    setMessageReactions(reactions);

    await loadConversations();
  }

  async function handleSendMessage() {
    const content = messageText.trim();

    if (!content || !selectedUser || sending) return;

    setSending(true);

    if (typingChannelRef.current) {
      await typingChannelRef.current.setTyping(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    const newMessage = await sendMessage(user.id, selectedUser.id, content);

    if (newMessage) {
      setMessages((current) => [...current, newMessage]);
      setMessageText("");
      await loadConversations();
    }

    setSending(false);
  }

  async function handleUnsendMessage(messageId) {
    const success = await unsendMessage(messageId);

    if (!success) {
      return;
    }

    setMessages((current) =>
      current.filter((message) => message.id !== messageId),
    );

    await loadConversations();
  }

  async function handleMessageReaction(messageId, reactionType) {
    if (!user?.id) return;

    const existingReaction = messageReactions.find(
      (reaction) =>
        reaction.message_id === messageId && reaction.user_id === user.id,
    );

    if (existingReaction?.reaction_type === reactionType) {
      const success = await removeMessageReaction(messageId, user.id);

      if (!success) return;

      setMessageReactions((current) =>
        current.filter(
          (reaction) =>
            !(
              reaction.message_id === messageId && reaction.user_id === user.id
            ),
        ),
      );

      return;
    }

    const reaction = await addMessageReaction(messageId, user.id, reactionType);

    if (!reaction) return;

    setMessageReactions((current) => [
      ...current.filter(
        (item) => !(item.message_id === messageId && item.user_id === user.id),
      ),
      reaction,
    ]);
  }

  function handleMessageInputChange(event) {
    const value = event.target.value;

    setMessageText(value);

    if (!selectedUser) return;

    const typingChannel = typingChannelRef.current;

    if (!typingChannel) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!value.trim()) {
      typingChannel.setTyping(false);
      typingTimeoutRef.current = null;
      return;
    }

    typingChannel.setTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      typingChannel.setTyping(false);
      typingTimeoutRef.current = null;
    }, 1500);
  }

  useEffect(() => {
    if (!user?.id) return;

    async function loadMessages() {
      setLoading(true);

      await Promise.all([loadConversations(), loadUsers()]);

      setLoading(false);
    }

    loadMessages();
  }, [user?.id, loadConversations, loadUsers]);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToMessages(
      user.id,
      (newMessage) => {
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
      },
      (updatedMessage) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === updatedMessage.id ? updatedMessage : message,
          ),
        );

        loadConversations();
      },
    );

    return unsubscribe;
  }, [user, loadConversations]);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToMessageReactions(user.id, (payload) => {
      if (payload.eventType === "INSERT") {
        setMessageReactions((current) => {
          if (current.some((reaction) => reaction.id === payload.new.id)) {
            return current;
          }

          return [...current, payload.new];
        });
        return;
      }

      if (payload.eventType === "UPDATE") {
        setMessageReactions((current) =>
          current.map((reaction) =>
            reaction.id === payload.new.id ? payload.new : reaction,
          ),
        );
        return;
      }

      if (payload.eventType === "DELETE") {
        setMessageReactions((current) =>
          current.filter((reaction) => reaction.id !== payload.old.id),
        );
      }
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user?.id || !selectedUser?.id) return;

    const typingChannel = subscribeToTyping(
      user.id,
      selectedUser.id,
      (isTyping) => {
        setIsOtherUserTyping(isTyping);
      },
    );

    typingChannelRef.current = typingChannel;

    return () => {
      setIsOtherUserTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      typingChannel.setTyping(false);
      typingChannelRef.current = null;
      typingChannel.unsubscribe();
    };
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

                    {message.sender_id === user.id && (
                      <button
                        type="button"
                        className="unsend-message-button"
                        onClick={() => handleUnsendMessage(message.id)}
                      >
                        Unsend
                      </button>
                    )}

                    <div className="message-reactions">
                      {[
                        { type: "heart", icon: Heart },
                        { type: "laugh", icon: Laugh },
                        { type: "fire", icon: Flame },
                        { type: "sad", icon: Frown },
                        { type: "angry", icon: Angry },
                      ].map((reaction) => {
                        const reactionCount = messageReactions.filter(
                          (item) =>
                            item.message_id === message.id &&
                            item.reaction_type === reaction.type,
                        ).length;

                        const userReacted = messageReactions.some(
                          (item) =>
                            item.message_id === message.id &&
                            item.user_id === user.id &&
                            item.reaction_type === reaction.type,
                        );

                        return (
                          <button
                            key={reaction.type}
                            type="button"
                            className={`message-reaction-button ${
                              userReacted ? "active" : ""
                            }`}
                            onClick={() =>
                              handleMessageReaction(message.id, reaction.type)
                            }
                            aria-label={`React with ${reaction.type}`}
                          >
                            <reaction.icon size={13} strokeWidth={2} />

                            {reactionCount > 0 && (
                              <span className="message-reaction-count">
                                {reactionCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {isOtherUserTyping && (
                  <div className="typing-indicator" aria-live="polite">
                    {selectedUser.display_name || selectedUser.username} is
                    typing...
                  </div>
                )}
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
                  onChange={handleMessageInputChange}
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
