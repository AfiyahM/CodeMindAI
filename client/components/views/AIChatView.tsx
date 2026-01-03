'use client';

import { Send, Loader, Copy } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// @ts-ignore - react-syntax-highlighter does not provide types in this project
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore - style file does not provide types in this project
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function AIChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: userMessage.content,
        conversationHistory,
      });

      const assistantText = response.data?.response || "I couldn't generate a response.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + 3,
          role: "assistant",
          content: "❗ AI service error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  /* ---------- COPY BUTTON FOR CODE BLOCKS ---------- */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };


  /* -------------- UI + MARKDOWN FIXES -------------- */
  return (
    <div className="h-full flex flex-col bg-[#252526] overflow-hidden">

      <style jsx>{`
        .chat-header {
          padding: 8px 12px;
          border-bottom: 1px solid rgba(0,0,0,0.7);
          background: linear-gradient(to bottom, #2d2d30, #252526);
          font-size: 11px;
          font-weight: 600;
          color: #ccc;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
          animation: fadeIn 0.25s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
          justify-content: flex-end;
        }

        .msg-bubble {
          padding: 10px 14px;
          border-radius: 8px;
          max-width: 82%;
          font-size: 13px;
          line-height: 1.45;
        }

        .user .msg-bubble {
          background: linear-gradient(135deg, #0ea5e9, #3b82f6);
          color: white;
        }

        .assistant .msg-bubble {
          background: rgba(255,255,255,0.06);
          color: #ddd;
        }

        .chat-input-container {
          padding: 10px;
          border-top: 1px solid rgba(255,255,255,0.1);
          background: #2a2d2e;
        }
      `}</style>


      <div className="chat-header">AI Assistant</div>

      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.role}`}>
            <div className="msg-bubble">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  /* -------- FIXED MARKDOWN CODE BLOCKS -------- */
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");

                    if (!inline) {
                      const codeText = String(children).replace(/\n$/, "");

                      return (
                        <div className="relative mt-2 mb-3">
                          
                          {/* COPY BUTTON */}
                          <button
                            onClick={() => copyToClipboard(codeText)}
                            className="absolute right-2 top-2 text-xs text-gray-300 hover:text-white bg-black/20 px-2 py-1 rounded"
                          >
                            <Copy size={12} />
                          </button>

                          <pre className="!m-0 !p-0 rounded-md overflow-hidden">
                            <SyntaxHighlighter
                              language={match?.[1] || "text"}
                              style={oneDark}
                              customStyle={{
                                padding: "14px",
                                fontSize: "12px",
                                background: "rgba(0,0,0,0.25)"
                              }}
                              {...props}
                            >
                              {codeText}
                            </SyntaxHighlighter>
                          </pre>
                        </div>
                      );
                    }

                    return (
                      <code className="px-1 py-0.5 bg-black/20 rounded text-[11px]">
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="msg-bubble flex items-center gap-2 text-blue-400">
              <Loader size={14} className="animate-spin" /> Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="flex gap-2 items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 bg-black/20 rounded px-3 py-2 text-sm text-white"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
