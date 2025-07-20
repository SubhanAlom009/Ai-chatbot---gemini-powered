"use client";

import { Bot, User } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessage = ({ message }) => {
  const { role, parts } = message;

  const isUser = role === "user";

  return (
    <div
      className={`flex items-start gap-4 my-4 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-gray-300" />
        </div>
      )}

      <div
        className={`max-w-2xl p-4 rounded-2xl prose prose-invert prose-sm md:prose-base ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none" // User message style
            : "bg-gray-800 text-gray-200 rounded-bl-none" // AI message style
        }`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {parts[0].text}
        </ReactMarkdown>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
