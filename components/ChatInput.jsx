"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Upload,
  Loader2,
  X,
  FileText,
  Sparkles,
  Paperclip,
} from "lucide-react";

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((input.trim() || uploadedFile) && !isLoading) {
      onSendMessage(input, uploadedFile);
      setInput("");
      setUploadedFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    const textarea = e.currentTarget;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file only.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB.");
        return;
      }

      setUploadedFile(file);
    }
    e.target.value = "";
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/80 backdrop-blur-xl"></div>

      <div className="relative p-6">
        <div className="max-w-4xl mx-auto">
          {/* File Upload Preview */}
          {uploadedFile && (
            <div className="mb-4 group">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-blue-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready
                      to analyze
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 hover:bg-red-500/20 rounded-xl transition-all duration-200 group"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Input Container */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-30"></div>

            <form
              onSubmit={handleSubmit}
              className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl"
            >
              <div className="flex items-end p-2">
                {/* Upload Button */}
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="flex items-center justify-center w-12 h-12 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-2xl transition-all duration-200 cursor-pointer group"
                    aria-label="Upload PDF file"
                  >
                    <Paperclip className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                  </label>
                </div>

                {/* Text Input Area */}
                <div className="flex-1 relative mx-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    placeholder={
                      uploadedFile
                        ? "Ask me anything about your PDF..."
                        : isLoading
                        ? "Thinking with AI magic..."
                        : "What's on your mind?"
                    }
                    rows="1"
                    className="w-full bg-transparent text-gray-100 placeholder-gray-400 resize-none py-3 px-1 focus:outline-none text-base leading-6"
                    style={{ maxHeight: "120px", overflow: "hidden" }}
                    disabled={isLoading}
                  />

                  {/* Character limit indicator */}
                  {input.length > 800 && (
                    <div className="absolute -top-6 right-0 text-xs text-gray-500">
                      {input.length}/1000
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !uploadedFile)}
                  className="group relative w-12 h-12 rounded-2xl transition-all duration-200 disabled:cursor-not-allowed overflow-hidden"
                  aria-label="Send message"
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 group-disabled:opacity-40 transition-opacity"></div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-sm transition-opacity"></div>

                  {/* Icon container */}
                  <div className="relative flex items-center justify-center w-full h-full">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform duration-200" />
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>

          {/* Enhanced Footer */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
              <p className="text-xs text-gray-400">Powered by Gemini AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
