"use client";

import Image from "next/image";
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
  const intentionalCloseRef = useRef(false);

  const scrollBottom = useCallback(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      intentionalCloseRef.current = true;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [rows, open, scrollBottom]);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    const sock = socketRef.current;
    socketRef.current = null;
    sock?.close();
  }, []);

  const connect = useCallback(async () => {
    if (!user) return;
    disconnect();
    intentionalCloseRef.current = false;
    setStatus("connecting");
    setHint("در حال اتصال امن…");

    try {
      const conversation = await fetchSupportConversation();
      if (!mountedRef.current) return;
      setRows(conversation.messages.map(toRow));
    } catch {
      if (!mountedRef.current) return;
      setHint("پیامت را بنویس؛ همین‌جا می‌رسد.");
    }

    if (!mountedRef.current || intentionalCloseRef.current) return;

    const token = await ensureSupportAccessToken();
    if (!token) {
      setStatus("idle");
      setHint("متصل شدی؛ پیامت را بنویس.");
      return;
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
          status?: string;
          purged?: number;
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
        if (payload.type === "support.conversation") {
          if (payload.status === "closed" || (payload.purged ?? 0) > 0) {
            setRows([]);
            setHint("گفتگو پاک شد؛ از نو شروع کن.");
          }
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
      if (socketRef.current !== socket) return;
      socketRef.current = null;
      setStatus((prev) => (prev === "live" ? "idle" : prev === "connecting" ? "error" : prev));
      if (intentionalCloseRef.current) return;
      window.setTimeout(() => {
        if (!mountedRef.current || intentionalCloseRef.current || socketRef.current) return;
        void connect();
      }, 1500);
    };
  }, [disconnect, user]);

  // Keep WebSocket while logged in so admin replies land even if the panel is closed.
  useEffect(() => {
    if (!user) {
      disconnect();
      setRows([]);
      setStatus("idle");
      setHint("برای گفتگو وارد حساب شو.");
      return;
    }
    void connect();
    return () => disconnect();
  }, [user, connect, disconnect]);

  // Backup poll: if WS drops or Redis lags, pull history while the panel is open.
  useEffect(() => {
    if (!user || !open) return;
    let cancelled = false;

    async function pull() {
      try {
        if (cancelled || !mountedRef.current) return;
        const conversation = await fetchSupportConversation();
        if (cancelled || !mountedRef.current) return;
        setRows(conversation.messages.map(toRow));
      } catch {
        // keep existing rows; live socket may still work
      }
    }

    const timer = window.setInterval(() => {
      void pull();
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [user, open]);

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

    try {
      const message = await postSupportMessage({
        body,
        client_message_id: clientId,
      });
      setRows((prev) => upsertMessage(prev, toRow(message)));
      setHint("پیام رسید؛ پاسخ از پنل می‌آید.");
      setStatus("idle");
    } catch {
      setRows((prev) => prev.filter((row) => row.key !== clientId));
      setHint("پیام نرفت. کمی بعد دوباره بفرست.");
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
              <Image
                src="/brand/support-fab-seal.png"
                alt=""
                width={40}
                height={40}
                className={styles.avatarImg}
              />
            </div>
            <div className={styles.headCopy}>
              <p className={styles.kicker}>این راه سبز است</p>
              <h2 id={panelId}>گفتگوی مرد کوهستان</h2>
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
                <p>اولین پیام را بنویس؛ سریع پاسخ می‌دهیم.</p>
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
          <p className={styles.sla}>
            همسفر گرامی، پاسخ شما معمولاً تا ۵ دقیقه داده می‌شود.
            اگر پاسخی نیامد، با شمارهٔ{" "}
            <a href="tel:02156443394" className={styles.slaPhone}>
              ۰۲۱-۵۶۴۴۳۳۹۴
            </a>{" "}
            یا{" "}
            <a href="tel:02156443395" className={styles.slaPhone}>
              ۰۲۱-۵۶۴۴۳۳۹۵
            </a>{" "}
            تماس بگیرید.
          </p>
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

      {!open ? (
        <button
          type="button"
          className={styles.fab}
          onClick={toggleOpen}
          aria-expanded={false}
          aria-controls={panelId}
          aria-label="باز کردن گفتگوی مرد کوهستان"
        >
          <span className={styles.fabGlow} aria-hidden="true" />
          <Image
            src="/brand/support-fab-seal.png"
            alt=""
            width={64}
            height={64}
            className={styles.fabSeal}
            priority
          />
        </button>
      ) : null}
    </div>
  );
}
