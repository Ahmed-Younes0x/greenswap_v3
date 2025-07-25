import React, { useState, useEffect, useRef } from "react";
import AIService from "../../services/aiService";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [typing, setTyping] = useState(false);
  const [sessionType, setSessionType] = useState("general");
  const messagesEndRef = useRef(null);
  const { showError } = useNotification();

  useEffect(() => {
    // رسالة ترحيب من البوت
    setMessages([
      {
        id: 1,
        type: "bot",
        content:
          "مرحباً! أنا جرين بوت، مساعدك الذكي في إعادة التدوير والاستدامة البيئية. كيف يمكنني مساعدتك اليوم؟",
        timestamp: new Date(),
        suggestions: [
          "كيف أصنف المخلفات؟",
          "ما هي أفضل طرق إعادة التدوير؟",
          "كيف أحدد سعر المنتج؟",
          "أين أجد مراكز التدوير؟",
          "نصائح للاستدامة البيئية",
          "كيف أبدأ مشروع إعادة تدوير؟",
        ],
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (messageText = newMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setLoading(true);
    setTyping(true);

    try {
      const response = await AIService.chatWithBot(
        messageText.trim(),
        sessionId,
        sessionType
      );
      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          response.content ||
          response.message ||
          "عذراً، لم أتمكن من فهم سؤالك. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
        suggestions: response.suggestions || [],
        metadata: response.metadata || {},
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setTyping(false);
      }, 1000); // محاكاة وقت الكتابة
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
        isError: true,
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, errorMessage]);
        setTyping(false);
      }, 1000);

      showError("فشل في إرسال الرسالة");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "تم مسح المحادثة. كيف يمكنني مساعدتك؟",
        timestamp: new Date(),
        suggestions: [
          "كيف أصنف المخلفات؟",
          "ما هي أفضل طرق إعادة التدوير؟",
          "كيف أحدد سعر المنتج؟",
          "أين أجد مراكز التدوير؟",
          "نصائح للاستدامة البيئية",
          "كيف أبدأ مشروع إعادة تدوير؟",
        ],
      },
    ]);
    setSessionId(null);
  };

  const exportChat = () => {
    const chatData = messages.map((msg) => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `greenbot-chat-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle mb-3"
              style={{ width: "80px", height: "80px" }}
            >
              <i
                className="bi bi-robot text-success"
                style={{ fontSize: "2.5rem" }}
              ></i>
            </div>
            <h2 className="fw-bold">جرين بوت - المساعد الذكي</h2>
            <p className="text-muted">
              مساعدك الشخصي المتخصص في إعادة التدوير والاستدامة البيئية
            </p>
          </div>

          {/* Session Type Selection */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">نوع المحادثة:</h6>
              <div className="btn-group w-100" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="sessionType"
                  id="general"
                  value="general"
                  checked={sessionType === "general"}
                  onChange={(e) => setSessionType(e.target.value)}
                />
                <label className="btn btn-outline-primary" htmlFor="general">
                  <i className="bi bi-chat-dots me-2"></i>
                  عام
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="sessionType"
                  id="item_help"
                  value="item_help"
                  checked={sessionType === "item_help"}
                  onChange={(e) => setSessionType(e.target.value)}
                />
                <label className="btn btn-outline-success" htmlFor="item_help">
                  <i className="bi bi-box me-2"></i>
                  مساعدة في المنتج
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="sessionType"
                  id="recycling_guide"
                  value="recycling_guide"
                  checked={sessionType === "recycling_guide"}
                  onChange={(e) => setSessionType(e.target.value)}
                />
                <label
                  className="btn btn-outline-info"
                  htmlFor="recycling_guide"
                >
                  <i className="bi bi-recycle me-2"></i>
                  دليل التدوير
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="sessionType"
                  id="price_inquiry"
                  value="price_inquiry"
                  checked={sessionType === "price_inquiry"}
                  onChange={(e) => setSessionType(e.target.value)}
                />
                <label
                  className="btn btn-outline-warning"
                  htmlFor="price_inquiry"
                >
                  <i className="bi bi-currency-dollar me-2"></i>
                  استفسار سعر
                </label>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-robot me-2"
                  style={{ fontSize: "1.5rem" }}
                ></i>
                <div>
                  <h6 className="mb-0">جرين بوت</h6>
                  <small className="opacity-75">
                    متصل الآن •{" "}
                    {sessionType === "general"
                      ? "محادثة عامة"
                      : sessionType === "item_help"
                      ? "مساعدة في المنتج"
                      : sessionType === "recycling_guide"
                      ? "دليل التدوير"
                      : "استفسار سعر"}
                  </small>
                </div>
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={exportChat}
                  title="تصدير المحادثة"
                >
                  <i className="bi bi-download"></i>
                </button>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={clearChat}
                  title="مسح المحادثة"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="card-body p-0">
              <div
                className="chat-messages p-4"
                style={{ height: "500px", overflowY: "auto" }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`d-flex mb-4 ${
                      message.type === "user"
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                  >
                    {message.type === "bot" && (
                      <div className="me-3">
                        <div
                          className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <i className="bi bi-robot text-white"></i>
                        </div>
                      </div>
                    )}

                    <div
                      className={`message ${
                        message.type === "user" ? "sent" : "received"
                      } ${message.isError ? "border-danger" : ""}`}
                    >
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                        {message.metadata && (
                          <span className="ms-2">
                            <i
                              className="bi bi-info-circle"
                              title={`Model: ${
                                message.metadata.model
                              }, Confidence: ${(
                                message.metadata.confidence * 100
                              ).toFixed(0)}%`}
                            ></i>
                          </span>
                        )}
                      </div>

                      {/* Suggestions */}
                      {message.suggestions &&
                        message.suggestions.length > 0 && (
                          <div className="mt-3">
                            <small className="text-muted">اقتراحات:</small>
                            <div className="mt-2">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  className="btn btn-outline-success btn-sm me-2 mb-2"
                                  onClick={() =>
                                    handleSuggestionClick(suggestion)
                                  }
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {message.type === "user" && (
                      <div className="ms-3">
                        <div
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <i className="bi bi-person text-white"></i>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {typing && (
                  <div className="d-flex justify-content-start mb-4">
                    <div className="me-3">
                      <div
                        className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <i className="bi bi-robot text-white"></i>
                      </div>
                    </div>
                    <div className="message received">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <small className="text-muted">جرين بوت يكتب...</small>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="card-footer bg-light">
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="اكتب رسالتك هنا..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading || !newMessage.trim()}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="bi bi-send"></i>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-2">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  اسأل عن أي شيء متعلق بإعادة التدوير والاستدامة البيئية
                </small>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="row mt-5">
            <div className="col-md-3 text-center mb-4">
              <div
                className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <i className="bi bi-lightbulb text-primary fs-4"></i>
              </div>
              <h6 className="fw-bold">نصائح ذكية</h6>
              <p className="text-muted small">
                احصل على نصائح مخصصة لإعادة التدوير
              </p>
            </div>

            <div className="col-md-3 text-center mb-4">
              <div
                className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <i className="bi bi-search text-success fs-4"></i>
              </div>
              <h6 className="fw-bold">بحث متقدم</h6>
              <p className="text-muted small">
                ابحث عن معلومات دقيقة حول المواد
              </p>
            </div>

            <div className="col-md-3 text-center mb-4">
              <div
                className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <i className="bi bi-clock text-info fs-4"></i>
              </div>
              <h6 className="fw-bold">متاح 24/7</h6>
              <p className="text-muted small">مساعدة فورية في أي وقت</p>
            </div>

            <div className="col-md-3 text-center mb-4">
              <div
                className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <i className="bi bi-brain text-warning fs-4"></i>
              </div>
              <h6 className="fw-bold">ذكاء متطور</h6>
              <p className="text-muted small">يتعلم من كل محادثة ويتحسن</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 bg-light mt-4">
            <div className="card-body">
              <h6 className="fw-bold mb-3">إجراءات سريعة:</h6>
              <div className="row">
                <div className="col-md-3 mb-2">
                  <button
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={() => handleSuggestionClick("كيف أصنف البلاستيك؟")}
                  >
                    <i className="bi bi-cup-straw me-2"></i>
                    تصنيف البلاستيك
                  </button>
                </div>
                <div className="col-md-3 mb-2">
                  <button
                    className="btn btn-outline-success btn-sm w-100"
                    onClick={() =>
                      handleSuggestionClick("ما سعر المعادن اليوم؟")
                    }
                  >
                    <i className="bi bi-gear me-2"></i>
                    أسعار المعادن
                  </button>
                </div>
                <div className="col-md-3 mb-2">
                  <button
                    className="btn btn-outline-info btn-sm w-100"
                    onClick={() =>
                      handleSuggestionClick("أين أجد مراكز التدوير؟")
                    }
                  >
                    <i className="bi bi-geo-alt me-2"></i>
                    مراكز التدوير
                  </button>
                </div>
                <div className="col-md-3 mb-2">
                  <button
                    className="btn btn-outline-warning btn-sm w-100"
                    onClick={() => handleSuggestionClick("نصائح للاستدامة")}
                  >
                    <i className="bi bi-leaf me-2"></i>
                    نصائح الاستدامة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
