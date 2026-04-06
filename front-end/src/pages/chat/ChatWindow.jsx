import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useAuth } from "src/hooks/authContext";
import { io } from "socket.io-client";
import api from "src/helpers/api";
import { MdSend, MdAttachFile } from "react-icons/md";
import { formatDateTH } from "src/helpers/formatDate";

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

const ChatWindow = ({ conversation }) => {
  const { user: adminUser, setIsLoadingOpen } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = useCallback(
    async (page) => {
      if (!conversation || !adminUser) return;

      if (page === 1) {
        setIsLoadingOpen(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await api.get(
          `/chat/conversation/${conversation.customer.id}/messages?page=${page}&limit=30`
        );

        const { data: newApiMessages, total } = response.data;

        setMessages((prev) =>
          page === 1
            ? newApiMessages.reverse()
            : [...newApiMessages.reverse(), ...prev]
        );

        if (page * 30 >= total) {
          setHasMoreMessages(false);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
      setIsLoadingOpen(false);
      setIsLoadingMore(false);
    },
    [conversation, adminUser, setIsLoadingOpen]
  );

  const setupSocket = useCallback(() => {
    const newSocket = io(WEBSOCKET_URL, { transports: ["websocket"] });
    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", conversation.id);
    });

    newSocket.on("recMessage", (recMessage) => {
      setMessages((prevMessages) => [...prevMessages, recMessage]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [conversation]);

  useEffect(() => {
    // Reset state when conversation changes
    setMessages([]);
    setCurrentPage(1);
    setHasMoreMessages(true);
    fetchMessages(1);
    const cleanupSocket = setupSocket();
    return cleanupSocket;
  }, [conversation, fetchMessages, setupSocket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !socket || !adminUser) return;

    const messageDto = {
      content: newMessage,
      type: "text",
      senderId: adminUser.id,
      conversationId: conversation.id,
    };

    socket.emit("sendMessage", messageDto);
    setNewMessage("");
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMessages(nextPage);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file || !socket || !adminUser) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsLoadingOpen(true);
    try {
      const uploadResponse = await api.post(
        `/chat/upload/image?conversationId=${conversation.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (uploadResponse.status !== 200 && uploadResponse.status !== 201) {
        throw new Error("อัปโหลดรูปภาพไม่สำเร็จ");
      }

      const { filePath } = uploadResponse.data;

      const messageDto = {
        content: filePath,
        type: "image",
        senderId: adminUser.id,
        conversationId: conversation.id,
      };

      socket.emit("sendMessage", messageDto);
    } catch (err) {
      console.error("Failed to upload image:", err);
      // You might want to show an error alert to the user here
    } finally {
      setIsLoadingOpen(false);
      // Reset file input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const renderAvatar = (sender) => {
    const initial = sender.name ? sender.name.charAt(0).toUpperCase() : "?";
    // Simple color hashing based on user ID to get a consistent color
    const colors = [
      "bg-red-200 text-red-800",
      "bg-green-200 text-green-800",
      "bg-blue-200 text-blue-800",
      "bg-yellow-200 text-yellow-800",
      "bg-purple-200 text-purple-800",
      "bg-pink-200 text-pink-800",
      "bg-indigo-200 text-indigo-800",
    ];
    const colorClass = colors[sender.id % colors.length];

    return (
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${colorClass}`}
      >
        <span className="text-sm font-bold">{initial}</span>
      </div>
    );
  };

  const renderMessageContent = (msg) => {
    if (msg.type === "image") {
      return (
        <a
          href={`${API_BASE_URL}${msg.content}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textAlign: "-webkit-center",
          }}
        >
          <img
            src={`${API_BASE_URL}${msg.content}`}
            alt="Sent content"
            className="rounded-lg max-w-full h-auto"
            style={{ maxWidth: "250px" }}
          />
        </a>
      );
    }

    if (msg.content.startsWith("ตำแหน่งของฉัน:")) {
      const url = msg.content.match(/https?:\/\/[^\s]+/);
      return url ? (
        <p className="text-sm">
          ตำแหน่งของฉัน:{" "}
          <a
            href={url[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {url[0]}
          </a>
        </p>
      ) : (
        <p className="text-sm">{msg.content}</p>
      );
    }

    return <p className="text-sm">{msg.content}</p>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold">{conversation.customer.name}</h3>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {hasMoreMessages && (
          <div className="text-center mb-4">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              {isLoadingMore ? "กำลังโหลด..." : "โหลดข้อความเก่า"}
            </button>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 mb-4 ${
              msg.sender.type != "ลูกค้า" ? "flex-row-reverse" : ""
            }`}
          >
            {renderAvatar(msg.sender)}
            <div
              className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                msg.sender.type != "ลูกค้า"
                  ? "bg-indigo-500 text-white"
                  : "bg-white border"
              }`}
            >
              <div
                className={`text-sm ${
                  msg.sender.type != "ลูกค้า" ? "text-white" : "text-gray-800"
                }`}
              >
                {renderMessageContent(msg)}
              </div>
              <span className="text-xs opacity-75 mt-1 block text-right">
                {formatDateTH(msg.create_date)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
            accept="image/*"
          />
          <button
            type="button"
            onClick={handleAttachClick}
            className="p-2 mr-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <MdAttachFile size={24} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="ml-4 p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none"
          >
            <MdSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  conversation: PropTypes.object.isRequired,
};

export default ChatWindow;
