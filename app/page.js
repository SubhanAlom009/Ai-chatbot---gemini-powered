"use client";

import { useState, useEffect } from "react";

import ChatContainer from "@/components/ChatContainer";
import ChatInput from "@/components/ChatInput";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
    }
  }, [messages]);

  const handleSendMessage = async (text, file = null) => {
    const newUserMessage = {
      role: "user",
      parts: [{ text: file ? `${text} [PDF: ${file.name}]` : text }],
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
        { role: "model", parts: [{ text: "" }] },
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
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat function
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("gemini-chat-history");
  };

  // Export chat function
  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages,
      totalMessages: messages.length,
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white font-sans">
      <header className="p-4 border-b border-gray-700/50 shadow-md bg-gray-900">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-200">AI Chatbot</h1>

          {/* Chat controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportChat}
              className="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
              title="Export Chat"
            >
              Export
            </button>
            <button
              onClick={clearChat}
              className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
              title="Clear Chat"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      <ChatContainer messages={messages} isLoading={isLoading} />

      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
