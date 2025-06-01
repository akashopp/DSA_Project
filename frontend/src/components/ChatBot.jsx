import React, { useState, useImperativeHandle, forwardRef } from "react";
import { MessageSquare, X, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const INITIAL_MESSAGE = [
  { text: "👋 Hello! How can I help you today?", user: false },
];

const CHATBOT_API_URL = "http://127.0.0.1:8000/chat";

const Chatbot = forwardRef((_, ref) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGE);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      destroy: () => setMessages(INITIAL_MESSAGE),
    }),
    []
  );

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, user: true }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      setMessages([
        ...newMessages,
        { text: data?.response || "Sorry, I didn’t understand that.", user: false },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { text: "⚠️ Failed to connect to server.", user: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
      {/* Chat Box */}
      <div
        className={`w-[450px] h-[600px] max-w-full bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl transition-all duration-500 ease-in-out transform origin-bottom-right
          ${open ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-4 pointer-events-none"}
        `}
      >
        <div className="p-4 border-b border-zinc-700 bg-zinc-800 flex justify-between items-center">
          <h2 className="font-semibold text-zinc-200">Chatbot</h2>
          <div className="flex gap-2">
            <button onClick={() => setMessages(INITIAL_MESSAGE)}>
              <Trash2 className="w-5 h-5 text-zinc-400 hover:text-red-400 transition" />
            </button>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5 text-zinc-400 hover:text-zinc-200 transition" />
            </button>
          </div>
        </div>

        <div className="p-4 h-[440px] overflow-y-auto text-sm text-zinc-300 flex flex-col space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`px-4 py-3 rounded-lg max-w-full whitespace-pre-wrap break-words ${
                msg.user
                  ? "bg-blue-600 text-white self-end ml-auto"
                  : "bg-zinc-800 text-zinc-300 self-start"
              }`}
            >
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-zinc-700 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-zinc-400 italic">Bot is typing...</div>
          )}
        </div>

        <div className="p-2 border-t border-zinc-700 bg-zinc-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-full text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-full text-sm transition"
              disabled={loading}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className={`bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "scale-0" : "scale-100"
        }`}
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
});

export default Chatbot;