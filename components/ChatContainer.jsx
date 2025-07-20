"use client";

import { useRef, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import TypingLoader from "./TypingLoader";
import { Bot, Sparkles, Clock, MessageSquare } from "lucide-react";

const ChatContainer = ({ messages, isLoading }) => {
  const scrollRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [userScrolled, setUserScrolled] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;

      // Always scroll to bottom on new messages unless user has manually scrolled up
      if (!userScrolled || isAtBottom) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
          setIsAtBottom(true);
          setUserScrolled(false);
        }, 10); // Small delay to ensure DOM updates
      }
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 50; // Allow some margin for "at bottom" detection
      const isScrolledToBottom =
        scrollHeight - scrollTop - clientHeight < threshold;

      setIsAtBottom(isScrolledToBottom);

      // Detect if user manually scrolled (not at bottom)
      if (!isScrolledToBottom) {
        setUserScrolled(true);
      } else {
        setUserScrolled(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsAtBottom(true);
      setUserScrolled(false);
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col relative bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Messages Container - This is the scrollable part */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-gray-700/30">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-400 max-w-md">
                Ask me anything! I can help with questions, analysis, coding,
                creative writing, and more.
              </p>
            </div>
          ) : (
            // Messages
            messages.map((msg, index) => (
              <div key={`message-${index}`} className="relative">
                {/* Time separator for first message or messages far apart */}
                {index === 0 ||
                (index > 0 && shouldShowTimestamp(messages[index - 1], msg)) ? (
                  <div className="flex items-center justify-center my-8">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/30">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {formatTime(new Date())}
                      </span>
                    </div>
                  </div>
                ) : null}

                <ChatMessage message={msg} index={index} />
              </div>
            ))
          )}

          {/* Auto-scroll anchor */}
          <div id="scroll-anchor" className="h-1"></div>
        </div>
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && userScrolled && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10 group animate-bounce"
          title="Scroll to bottom"
        >
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white group-hover:scale-110 transition-transform"></div>
        </button>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>
    </div>
  );
};

// Helper function to determine if timestamp should be shown
const shouldShowTimestamp = (prevMsg, currentMsg) => {
  // Show timestamp if messages are from different roles or time gap
  return prevMsg.role !== currentMsg.role;
};

export default ChatContainer;
