import { useEffect, useMemo, useRef, useState } from "react";
import { listMessages, postMessage } from "../lib/api";
import { POLL_MS } from "../config";

function useConversationId() {
  return useMemo(() => {
    const key = "qtic_conversation_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "conv_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(key, id);
    }
    return id;
  }, []);
}

function timeString(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}

export default function ChatWidget() {
  const conversationId = useConversationId();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [shortcutHint, setShortcutHint] = useState("");

  const boxRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  // Toggle with Cmd/Ctrl+B
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close on small screens
  useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      const inside =
        boxRef.current?.contains(e.target) ||
        document.getElementById("chat-toggle")?.contains(e.target);
      if (!inside && window.innerWidth < 768) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  // Determine platform-specific shortcut hint (hide on touch/mobile)
  useEffect(() => {
    try {
      const nav = window.navigator || {};
      const ua = (nav.userAgent || "").toLowerCase();
      const platform = (nav.platform || "").toLowerCase();
      const hasTouch = (nav.maxTouchPoints || 0) > 0 || /mobi|android|iphone|ipad|ipod/.test(ua);
      if (hasTouch) {
        setShortcutHint("");
        return;
      }
      const isMac = /mac/.test(platform) || /mac os x|macintosh/.test(ua);
      setShortcutHint(isMac ? "⌘ + Enter" : "Ctrl + Enter");
    } catch {
      setShortcutHint("");
    }
  }, []);

  // Poll when open
  useEffect(() => {
    if (!open) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    // initial fetch
    void fetchList();
    // pollRef.current = setInterval(fetchList, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, conversationId]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  async function fetchList() {
    try {
      setLoading(true);
      setListError("");
      const res = await listMessages(conversationId);
      if (!res.ok) throw new Error(res.error || "List failed");
      const sorted = [...res.data].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sorted);
      setTimeout(scrollToBottom, 0);
    } catch (e) {
      setListError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function onSend(e) {
    console.log("onSend", e);
    e.preventDefault();
    if (sending) return;
    const text = (inputRef.current?.value || "").trim();
    if (!text) return;

    try {
      setSending(true);
      setSendError("");

      const res = await postMessage({ conversationId, text });
      if (!res.ok) throw new Error(res.error || "Post failed");

      const next = res.data || {
        id: "local_" + Math.random().toString(36).slice(2, 8),
        sender: "user",
        text,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, next]);
      if (inputRef.current) {
        inputRef.current.value = "";
        autoResizeTextArea();
        inputRef.current.focus();
      }
      scrollToBottom();
    } catch (e) {
      setSendError(e.message || "Could not send");
    } finally {
      setSending(false);
    }
  }

  function autoResizeTextArea() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSend(e);
    }
  }

  return (
    <>
      {/* Floating Toggle */}
      <button
        id="chat-toggle"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        aria-controls="chat-panel"
        aria-expanded={open}
        className="cursor-pointer fixed right-6 bottom-6 z-40 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-white shadow-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4a2 2 0 00-2 2v16l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>
        </svg>
        Chat
        <span className="relative ml-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
      </button>

      {/* Chat Panel */}
      <section
        id="chat-panel"
        ref={boxRef}
        aria-hidden={!open}
        role="dialog"
        aria-label="Agent chat"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={[
          "fixed z-50 bottom-4 right-4 md:w-96 w-[calc(100%-1.5rem)] md:max-h-[70vh] max-h-[85vh]",
          "shadow-2xl rounded-2xl overflow-hidden border bg-white",
          open ? "" : "hidden",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold">A</div>
            <div>
              <h5 className="font-semibold leading-5">Live Support</h5>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Agent online
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="bg-gray-50">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading messages…</div>
          )}
          {!!listError && (
            <div className="px-4 py-3 text-sm text-red-600">{listError}</div>
          )}
          <div ref={listRef} className="h-[46vh] md:h-[44vh] overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isUser = (msg.sender || "").toLowerCase() === "user";
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={[
                        "max-w-[80%] w-fit rounded-2xl px-3 py-2 text-sm shadow-sm",
                        isUser ? "bg-brand-600 text-white" : "bg-white border text-gray-800",
                      ].join(" ")}
                    >
                      {msg.text}
                    </div>
                    <div className={`mt-1 text-[11px] text-gray-500 ${isUser ? "text-right" : "text-left"}`}>
                      {timeString(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Composer */}
        <form onSubmit={onSend} className="border-t bg-white px-3 py-2">
          <div className="flex items-end gap-2">
            <label htmlFor="messageInput" className="sr-only">Type your message</label>
            <textarea
              id="messageInput"
              ref={inputRef}
              rows={1}
              placeholder="Type your message…"
              onInput={autoResizeTextArea}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <button
                type="submit"
                disabled={sending}
                onClick={onSend}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                Send
            </button>
        
          </div>
          <div className="text-end">
          {shortcutHint && (
            <span className="text-xs text-gray-500">{shortcutHint} to send</span>
          )}
          </div>
          {!!sendError && (
            <p className="mt-2 text-xs text-red-600">{sendError}</p>
          )}
        </form>
      </section>
    </>
  );
}
