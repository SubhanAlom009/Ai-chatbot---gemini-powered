"use client";

import { useRef, useEffect } from "react";

import ChatMessage from "./ChatMessage";
import TypingLoader from "./TypingLoader";
import { Bot } from "lucide-react";

const ChatContainer = ({ messages, isLoading }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {/* {isLoading && (
          <div className="flex items-start gap-4 my-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-gray-300" />
            </div>
            <div className="max-w-xl p-4 rounded-2xl bg-gray-800 text-gray-200 rounded-bl-none">
              <TypingLoader />
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ChatContainer;
