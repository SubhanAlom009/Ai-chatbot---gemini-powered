"use client";

import { useState } from "react";
import {
  User,
  Bot,
  Copy,
  Check,
  Sparkles,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import TypingLoader from "./TypingLoader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessage = ({ message }) => {
  const { role, parts } = message;
  const isUser = role === "user";
  const messageText = parts[0]?.text || "";
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null);

  const handleCopy = async () => {
    if (!messageText) return;

    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleReaction = (type) => {
    setReaction(reaction === type ? null : type);
  };

  // Show typing animation for empty AI messages
  if (!messageText.trim() && !isUser) {
    return (
      <div className="flex items-start gap-4 mb-6 animate-fadeIn">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <Sparkles className="w-2 h-2 text-white animate-spin" />
          </div>
        </div>

        <div className="flex-1 max-w-3xl">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-3xl rounded-tl-lg p-6 shadow-xl">
            <TypingLoader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-4 mb-6 group animate-fadeIn ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-cyan-500"
              : "bg-gradient-to-r from-purple-500 to-pink-500"
          }`}
        >
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {!isUser && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-3xl ${
          isUser ? "flex flex-col items-end" : ""
        }`}
      >
        {/* Message Bubble */}
        <div
          className={`relative group/message ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl rounded-tr-lg"
              : "bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50 text-gray-100 rounded-3xl rounded-tl-lg"
          } p-6 shadow-xl transition-all duration-200 hover:shadow-2xl`}
        >
          {/* Message Text */}
          <div className="prose prose-invert prose-sm md:prose-base max-w-none">
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">
                {messageText}
              </p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline ? (
                      <div className="bg-gray-950/50 rounded-lg p-4 my-2 border border-gray-700/30">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code
                        className="bg-gray-700/50 px-2 py-1 rounded text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => (
                    <p className="leading-relaxed mb-3 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-1 mb-3">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-1 mb-3">{children}</ol>
                  ),
                }}
              >
                {messageText}
              </ReactMarkdown>
            )}
          </div>

          {/* Message Actions */}
          <div
            className={`flex items-center gap-2 mt-3 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 ${
              isUser ? "justify-start" : "justify-start"
            }`}
          >
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isUser
                  ? "hover:bg-blue-500/20 text-blue-100"
                  : "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
              }`}
              title="Copy message"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Timestamp */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                isUser ? "text-blue-100/70" : "text-gray-500"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* AI Message Reactions */}
            {!isUser && (
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => handleReaction("up")}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    reaction === "up"
                      ? "bg-green-500/20 text-green-400"
                      : "hover:bg-gray-700/50 text-gray-400 hover:text-green-400"
                  }`}
                  title="Good response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleReaction("down")}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    reaction === "down"
                      ? "bg-red-500/20 text-red-400"
                      : "hover:bg-gray-700/50 text-gray-400 hover:text-red-400"
                  }`}
                  title="Poor response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
