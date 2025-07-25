import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { api } from "../../services/api"; // Assuming you have a configured axios instance

const Chat = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showError } = useNotification();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();

    // Initialize socket connection
    const newSocket = io("http://localhost:8000", {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (activeConversation && socket) {
      // Join conversation room
      socket.emit("join_conversation", activeConversation.id);

      // Listen for new messages
      socket.on("new_message", (message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      // Listen for typing status
      socket.on("typing_status", (data) => {
        if (data.user_id !== user.id) {
          setTypingUsers((prev) => {
            if (data.is_typing) {
              return [...prev.filter((u) => u.id !== data.user_id), data];
            } else {
              return prev.filter((u) => u.id !== data.user_id);
            }
          });
        }
      });

      // Listen for user status
      socket.on("user_status", (data) => {
        setOnlineUsers((prev) => {
          if (data.status === "online") {
            return [...prev.filter((u) => u !== data.user_id), data.user_id];
          } else {
            return prev.filter((u) => u !== data.user_id);
          }
        });
      });

      return () => {
        socket.off("new_message");
        socket.off("typing_status");
        socket.off("user_status");
      };
    }
  }, [activeConversation, socket, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await api.get("/chat/conversations/");
      setConversations(response.data.results || response.data);

      // Auto-select conversation if specified in URL
      const orderId = searchParams.get("order");

      if (orderId) {
        // Try to find an existing conversation linked to this order
        const existingConversation = (
          response.data.results || response.data
        ).find((c) => c.related_order === Number(orderId));
        console.log(response.data.results,response.data,);
        

        if (existingConversation) {
          setActiveConversation(existingConversation);
          fetchMessages(existingConversation.id);
        } else {
          // Create a new conversation linked to the order
          try {
            const createResponse = await api.post("/chat/conversations/", {
              related_order: parseInt(orderId),
              title: `طلب رقم ${orderId}`,
            });
            const newConversation = createResponse.data;
            setConversations((prev) => [...prev, newConversation]);
            setActiveConversation(newConversation);
            fetchMessages(newConversation.id);
          } catch (createError) {
            console.error("Error creating conversation:", createError);
            showError("فشل في إنشاء المحادثة لهذا الطلب");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      showError("فشل في تحميل المحادثات");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(
        `/chat/conversations/${conversationId}/messages/`
      );
      setMessages(response.data.results || response.data);

      // Mark conversation as read
      await api.post(`/chat/conversations/${conversationId}/mark-read/`);
    } catch (error) {
      console.error("Error fetching messages:", error);
      showError("فشل في تحميل الرسائل");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);

    try {
      const response = await api.post(
        `/chat/conversations/${activeConversation.id}/messages/`,
        {
          message_type: "text",
          content: newMessage.trim(),
        }
      );

      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");

      // Emit message via socket
      if (socket) {
        socket.emit("send_message", {
          conversation_id: activeConversation.id,
          content: newMessage.trim(),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showError("فشل في إرسال الرسالة");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && activeConversation) {
      socket.emit("typing", {
        conversation_id: activeConversation.id,
        is_typing: true,
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          conversation_id: activeConversation.id,
          is_typing: false,
        });
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "اليوم";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "أمس";
    } else {
      return date.toLocaleDateString("ar-EG");
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3 text-muted">جاري تحميل المحادثات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Conversations Sidebar */}
        <div className="col-lg-4 col-md-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-chat-dots me-2"></i>
                المحادثات
              </h5>
            </div>

            <div className="card-body p-0">
              {conversations.length > 0 ? (
                <div className="list-group list-group-flush">
                  {conversations.map((conversation) => {
                    const otherParticipant = conversation.other_participant;
                    const isActive = activeConversation?.id === conversation.id;

                    return (
                      <button
                        key={conversation.id}
                        className={`list-group-item list-group-item-action border-0 ${
                          isActive ? "active" : ""
                        }`}
                        onClick={() => {
                          setActiveConversation(conversation);
                          fetchMessages(conversation.id);
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div className="position-relative me-3">
                            <img
                              src={
                                otherParticipant?.avatar_url ||
                                "http://localhost:8000/media/avatar/placeholder.png"
                              }
                              alt={otherParticipant?.full_name || "مستخدم"}
                              className="rounded-circle"
                              width="50"
                              height="50"
                            />
                            {otherParticipant &&
                              isUserOnline(otherParticipant.id) && (
                                <span
                                  className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white"
                                  style={{ width: "12px", height: "12px" }}
                                ></span>
                              )}
                          </div>

                          <div className="flex-grow-1 text-start">
                            <div className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-1 fw-bold">
                                {conversation.title ||
                                  otherParticipant?.full_name ||
                                  "محادثة"}
                              </h6>
                              {conversation.last_message && (
                                <small
                                  className={
                                    isActive ? "text-white-50" : "text-muted"
                                  }
                                >
                                  {formatTime(
                                    conversation.last_message.created_at
                                  )}
                                </small>
                              )}
                            </div>

                            {conversation.last_message && (
                              <p
                                className={`mb-1 small ${
                                  isActive ? "text-white-50" : "text-muted"
                                }`}
                              >
                                {conversation.last_message.content.substring(
                                  0,
                                  50
                                )}
                                ...
                              </p>
                            )}

                            <div className="d-flex justify-content-between align-items-center">
                              <span
                                className={`badge ${
                                  conversation.conversation_type === "order"
                                    ? "bg-info"
                                    : "bg-secondary"
                                }`}
                              >
                                {conversation.conversation_type === "order"
                                  ? "طلب"
                                  : "مباشر"}
                              </span>

                              {conversation.unread_count > 0 && (
                                <span className="badge bg-danger rounded-pill">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i
                    className="bi bi-chat-square-dots text-muted"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h6 className="mt-3 text-muted">لا توجد محادثات</h6>
                  <p className="text-muted small">
                    ابدأ محادثة من صفحة المنتجات
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-lg-8 col-md-7">
          <div className="card border-0 shadow-sm h-100">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img
                      src={
                        activeConversation.other_participant?.avatar_url ||
                        "/default-avatar.png"
                      }
                      alt={
                        activeConversation.other_participant?.full_name ||
                        "مستخدم"
                      }
                      className="rounded-circle me-3"
                      width="40"
                      height="40"
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">
                        {activeConversation.title ||
                          activeConversation.other_participant?.full_name ||
                          "محادثة"}
                      </h6>
                      <small className="text-muted">
                        {activeConversation.other_participant &&
                        isUserOnline(activeConversation.other_participant.id)
                          ? "متصل الآن"
                          : "غير متصل"}
                      </small>
                    </div>
                  </div>

                  <div className="dropdown">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button className="dropdown-item">
                          <i className="bi bi-archive me-2"></i>
                          أرشفة المحادثة
                        </button>
                      </li>
                      <li>
                        <button className="dropdown-item text-danger">
                          <i className="bi bi-trash me-2"></i>
                          حذف المحادثة
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Messages Area */}
                <div
                  className="card-body p-0"
                  style={{ height: "400px", overflowY: "auto" }}
                >
                  <div className="p-3">
                    {messages.map((message, index) => {
                      const isOwn = message.sender.id === user.id;
                      const showDate =
                        index === 0 ||
                        formatDate(messages[index - 1].created_at) !==
                          formatDate(message.created_at);

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center my-3">
                              <span className="badge bg-light text-dark">
                                {formatDate(message.created_at)}
                              </span>
                            </div>
                          )}

                          <div
                            className={`d-flex mb-3 ${
                              isOwn
                                ? "justify-content-end"
                                : "justify-content-start"
                            }`}
                          >
                            {!isOwn && (
                              <img
                                src={
                                  message.sender.avatar_url ||
                                  "/default-avatar.png"
                                }
                                alt={message.sender.full_name}
                                className="rounded-circle me-2"
                                width="32"
                                height="32"
                              />
                            )}

                            <div
                              className={`message ${
                                isOwn ? "sent" : "received"
                              }`}
                              style={{ maxWidth: "70%" }}
                            >
                              {!isOwn && (
                                <div className="fw-bold small text-muted mb-1">
                                  {message.sender.full_name}
                                </div>
                              )}

                              <div
                                className={`p-3 rounded ${
                                  isOwn ? "bg-primary text-white" : "bg-light"
                                }`}
                              >
                                {message.message_type === "text" && (
                                  <p className="mb-0">{message.content}</p>
                                )}

                                {message.message_type === "image" && (
                                  <div>
                                    <img
                                      src={message.image_url}
                                      alt="صورة"
                                      className="img-fluid rounded mb-2"
                                      style={{ maxWidth: "200px" }}
                                    />
                                    {message.content && (
                                      <p className="mb-0">{message.content}</p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div
                                className={`small mt-1 ${
                                  isOwn ? "text-end" : "text-start"
                                }`}
                              >
                                <span className="text-muted">
                                  {formatTime(message.created_at)}
                                </span>
                                {isOwn && message.is_read && (
                                  <i className="bi bi-check-all text-primary ms-1"></i>
                                )}
                              </div>
                            </div>

                            {isOwn && (
                              <img
                                src={
                                  message.sender.avatar_url ||
                                  "/default-avatar.png"
                                }
                                alt={message.sender.full_name}
                                className="rounded-circle ms-2"
                                width="32"
                                height="32"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {typingUsers.length > 0 && (
                      <div className="d-flex justify-content-start mb-3">
                        <div className="bg-light rounded p-3">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <small className="text-muted">
                            {typingUsers[0].user_name} يكتب...
                          </small>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="card-footer bg-white">
                  <form onSubmit={sendMessage}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="اكتب رسالتك..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        disabled={sending}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        title="إرفاق صورة"
                      >
                        <i className="bi bi-image"></i>
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={sending || !newMessage.trim()}
                      >
                        {sending ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <i className="bi bi-send"></i>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <i
                    className="bi bi-chat-square-text text-muted"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h5 className="mt-3 text-muted">اختر محادثة للبدء</h5>
                  <p className="text-muted">
                    اختر محادثة من القائمة الجانبية لبدء المراسلة
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
