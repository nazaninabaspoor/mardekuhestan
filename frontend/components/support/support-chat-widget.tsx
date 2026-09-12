"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import {
  ensureSupportAccessToken,
  fetchSupportConversation,
  makeClientMessageId,
  postSupportMessage,
  supportWsUrl,
  type SupportMessage,
} from "@/lib/support-chat";

import styles from "./support-chat-widget.module.css";

type ChatRow = {
  key: string;
  role: "customer" | "staff" | "system";
  body: string;
  createdAt?: string;
  pending?: boolean;
};

function toRow(message: SupportMessage): ChatRow {
  return {
    key: message.id,
    role: message.sender_role,
    body: message.body,
    createdAt: message.created_at,
  };
}

function upsertMessage(prev: ChatRow[], next: ChatRow): ChatRow[] {
  const filtered = prev.filter(
    (row) =>
      row.key !== next.key &&
      !(row.pending && row.body === next.body && row.role === next.role),
  );
  return [...filtered, next];
}

export function SupportChatWidget() {
  const { user, openLoginModal } = useAuth();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [hint, setHint] = useState("از راه سبز بپرس؛ اینجاییم.");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);

  const scrollBottom = useCallback(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [rows, open, scrollBottom]);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const connect = useCallback(async () => {
    if (!user) return;
    disconnect();
    setStatus("connecting");
    setHint("در حال اتصال امن…");

    const token = await ensureSupportAccessToken();
    if (!token) {
      if (!mountedRef.current) return;
      setStatus("error");
      setHint("نشست منقضی شده؛ دوباره وارد شو.");
      return;
    }

    try {
      const conversation = await fetchSupportConversation(token);
      if (!mountedRef.current) return;
      setRows(conversation.messages.map(toRow));
    } catch {
      if (!mountedRef.current) return;
      setHint("تاریخچه نیامد؛ باز هم می‌توانی پیام بفرستی.");
    }

    const socket = new WebSocket(supportWsUrl(token));
    socketRef.current = socket;

    socket.onopen = () => {
      if (!mountedRef.current) return;
      setStatus("live");
      setHint("متصل شدی؛ پیامت را بنویس.");
    };

    socket.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const payload = JSON.parse(String(event.data)) as {
          type?: string;
          detail?: string;
          conversation?: { messages?: SupportMessage[] };
          message?: SupportMessage;
        };
        if (payload.type === "support.snapshot" && payload.conversation?.messages) {
          setRows(payload.conversation.messages.map(toRow));
          return;
        }
        if (
          (payload.type === "support.message" || payload.type === "support.ack") &&
          payload.message
        ) {
          setRows((prev) => upsertMessage(prev, toRow(payload.message!)));
          return;
        }
        if (payload.type === "support.error") {
          setHint(payload.detail || "ارسال نشد؛ دوباره تلاش کن.");
        }
      } catch {
        setHint("پاسخ سرور خوانده نشد.");
      }
    };

    socket.onerror = () => {
      if (!mountedRef.current) return;
      setStatus("error");
      setHint("اتصال زنده قطع است؛ پیام از مسیر جایگزین می‌رود.");
    };

    socket.onclose = () => {
      if (!mountedRef.current) return;
      setStatus((prev) => (prev === "live" ? "idle" : prev === "connecting" ? "error" : prev));
    };
  }, [disconnect, user]);

  useEffect(() => {
    if (!open) {
      disconnect();
      setStatus("idle");
      return;
    }
    if (!user) {
      setRows([]);
      setHint("برای گفتگو وارد حساب شو.");
      return;
    }
    void connect();
    return () => disconnect();
  }, [open, user, connect, disconnect]);

  function toggleOpen() {
    if (!open && !user) {
      openLoginModal({ next: "/#support-chat" });
      setOpen(true);
      return;
    }
    setOpen((value) => !value);
  }

  async function sendMessage() {
    const body = draft.trim();
    if (!body || sending) return;
    if (!user) {
      openLoginModal({ next: "/#support-chat" });
      return;
    }

    const clientId = makeClientMessageId();
    setRows((prev) => [
      ...prev,
      { key: clientId, role: "customer", body, pending: true },
    ]);
    setDraft("");
    setSending(true);

    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: "send_message",
          body,
          client_message_id: clientId,
        }),
      );
      setSending(false);
      return;
    }

    try {
      const message = await postSupportMessage({
        body,
        client_message_id: clientId,
      });
      setRows((prev) => upsertMessage(prev, toRow(message)));
      setHint("پیام رسید؛ پاسخ از پنل می‌آید.");
      setStatus("idle");
      void connect();
    } catch {
      setRows((prev) => prev.filter((row) => row.key !== clientId));
      setHint("پیام نرفت. FastAPI روی پورت ۸۰۰۱ را روشن کن و دوباره بفرست.");
      setStatus("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.root} id="support-chat">
      {open ? (
        <section
          className={styles.panel}
          aria-labelledby={panelId}
          role="dialog"
          aria-modal="false"
        >
          <header className={styles.head}>
            <div className={styles.avatar} aria-hidden="true">
              <svg viewBox="0 0 48 48" className={styles.avatarSvg}>
                <path
                  d="M8 34 L24 12 L40 34 Z"
                  fill="none"
                  stroke="#D4A359"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 34 L24 22 L32 34"
                  fill="none"
                  stroke="#F4F0E8"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.headCopy}>
              <p className={styles.kicker}>این راه سبز است</p>
              <h2 id={panelId}>پشتیبانی مرد کوهستان</h2>
              <p>{hint}</p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="بستن گفتگو"
            >
              ×
            </button>
          </header>

          <div className={styles.list} ref={listRef}>
            {!user ? (
              <div className={styles.empty}>
                <p>برای شروع گفتگو وارد حساب شو.</p>
                <button
                  type="button"
                  className={styles.loginBtn}
                  onClick={() => openLoginModal({ next: "/#support-chat" })}
                >
                  ورود / عضویت
                </button>
              </div>
            ) : rows.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyPeak} aria-hidden="true" />
                <p>اولین پیام را بنویس؛ سریع به پشتیبانی می‌رسد.</p>
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.key}
                  className={`${styles.bubble} ${
                    row.role === "customer" ? styles.bubbleMe : styles.bubbleThem
                  }${row.pending ? ` ${styles.bubblePending}` : ""}`}
                >
                  <span>{row.body}</span>
                </div>
              ))
            )}
          </div>

          <form
            className={styles.composer}
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <input
              className={styles.input}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={user ? "پیامت را بنویس…" : "اول وارد شو…"}
              disabled={!user || sending}
              maxLength={4000}
              autoComplete="off"
            />
            <button
              type="submit"
              className={styles.send}
              disabled={!user || !draft.trim() || sending}
              aria-label="ارسال"
            >
              بفرست
            </button>
          </form>
          <div className={styles.meta} aria-live="polite">
            {status === "live"
              ? "گفتگوی زنده"
              : status === "connecting"
                ? "در حال اتصال"
                : status === "error"
                  ? "مسیر جایگزین فعال"
                  : "آماده"}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className={`${styles.fab}${open ? ` ${styles.fabOpen}` : ""}`}
        onClick={toggleOpen}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "بستن پشتیبانی" : "باز کردن پشتیبانی مرد کوهستان"}
      >
        <span className={styles.fabRing} aria-hidden="true" />
        <span className={styles.fabCore} aria-hidden="true">
          {open ? (
            <span className={styles.fabX}>×</span>
          ) : (
            <svg viewBox="0 0 48 48" className={styles.fabPeak}>
              <path
                d="M6 36 L24 10 L42 36 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M16 36 L24 22 L32 36"
                fill="none"
                stroke="#D4A359"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="18" r="1.6" fill="#D4A359" />
            </svg>
          )}
        </span>
        {!open ? <span className={styles.fabLabel}>پشتیبانی</span> : null}
      </button>
    </div>
  );
}
