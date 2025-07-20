"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Trash2,
  Settings,
  Sparkles,
  MessageSquare,
  Clock,
  Bot,
  Zap,
  FileText,
  MoreVertical,
} from "lucide-react";
import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState({ totalMessages: 0, totalTokens: 0 });

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("gemini-chat-history");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("gemini-chat-history", JSON.stringify(messages));
      // Update stats
      const totalChars = messages.reduce(
        (sum, msg) => sum + (msg.parts[0]?.text?.length || 0),
        0
      );
      setStats({
        totalMessages: messages.length,
        totalTokens: Math.ceil(totalChars / 4), // Rough token estimation
      });
    }
  }, [messages]);

  const handleSendMessage = async (text, file = null) => {
    const newUserMessage = {
      role: "user",
      parts: [{ text: file ? `${text} [PDF: ${file.name}]` : text }],
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    const history = messages.map((msg) => ({
      role: msg.role,
      parts: msg.parts.map((part) => ({ text: part.text })),
    }));

    try {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: "" }],
          timestamp: new Date().toISOString(),
        },
      ]);

      const formData = new FormData();
      formData.append("message", text);
      formData.append("history", JSON.stringify(history));

      if (file) {
        formData.append("pdf", file);
      }

      const response = await fetch("/api/gemini", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      setIsLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].parts[0].text = accumulatedText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorText =
        error.message ||
        "Sorry, an unexpected error occurred. Please try again.";
      const errorMessage = {
        role: "model",
        parts: [{ text: errorText }],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat function with confirmation
  const clearChat = () => {
    if (messages.length > 0) {
      if (
        confirm(
          "Are you sure you want to clear all messages? This cannot be undone."
        )
      ) {
        setMessages([]);
        localStorage.removeItem("gemini-chat-history");
        setStats({ totalMessages: 0, totalTokens: 0 });
      }
    }
  };

  // Enhanced export function
  const exportChat = () => {
    const chatData = {
      title: "Gemini AI Chat Export",
      exportDate: new Date().toISOString(),
      stats: stats,
      messages: messages.map((msg) => ({
        ...msg,
        formattedTime: msg.timestamp
          ? new Date(msg.timestamp).toLocaleString()
          : new Date().toLocaleString(),
      })),
    };

    // Export as JSON
    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `gemini-chat-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Export as text/markdown
  const exportAsText = () => {
    let textContent = `# Gemini AI Chat Export\n\n`;
    textContent += `**Export Date:** ${new Date().toLocaleString()}\n`;
    textContent += `**Total Messages:** ${stats.totalMessages}\n\n`;
    textContent += `---\n\n`;

    messages.forEach((msg, index) => {
      const role = msg.role === "user" ? "You" : "Gemini AI";
      const time = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString()
        : "";
      textContent += `## ${role} ${time ? `(${time})` : ""}\n\n`;
      textContent += `${msg.parts[0]?.text || ""}\n\n`;
    });

    const dataBlob = new Blob([textContent], { type: "text/markdown" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `gemini-chat-${new Date().toISOString().split("T")[0]}.md`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white font-sans">
      {/* Enhanced Header */}
      <header className="relative bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/30 shadow-xl flex-shrink-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>

        <div className="relative p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* Main logo */}
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AI Studio
                </h1>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Powered by Google Gemini
                </p>
              </div>
            </div>

            {/* Stats & Controls */}
            <div className="flex items-center gap-6">
              {/* Chat Stats */}
              {messages.length > 0 && (
                <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">{stats.totalMessages}</span>
                    <span className="text-gray-500 text-xs">messages</span>
                  </div>
                  <div className="w-px h-4 bg-gray-700"></div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">
                      {stats.totalTokens.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-xs">tokens</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Export Menu */}
                {messages.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50"
                      title="Export Options"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                      <MoreVertical className="w-3 h-3 ml-1" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50">
                        <div className="p-2">
                          <button
                            onClick={() => {
                              exportChat();
                              setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700/50 rounded-lg transition-colors text-gray-200"
                          >
                            <FileText className="w-4 h-4 text-blue-400" />
                            Export as JSON
                          </button>
                          <button
                            onClick={() => {
                              exportAsText();
                              setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700/50 rounded-lg transition-colors text-gray-200"
                          >
                            <FileText className="w-4 h-4 text-purple-400" />
                            Export as Markdown
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Clear Chat Button */}
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
                    title="Clear Chat"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Bar */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
          </div>
        )}
      </header>

      {/* Chat Area - This is the scrollable part */}
      <div className="flex-1 min-h-0">
        <ChatContainer messages={messages} isLoading={isLoading} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
}
