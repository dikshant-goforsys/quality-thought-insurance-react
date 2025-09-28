import { API_BASE, LIST_PATH, POST_PATH, AUTH_TOKEN } from "../config";

const isMock = !API_BASE || API_BASE === "mock";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listMessages(conversationId) {
  if (isMock) {
    await delay(400);
    return {
      ok: true,
      data: [
        {
          id: "m1",
          sender: "agent",
          text: "Hi! I’m Alex. How can I help you today?",
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        // {
        //   id: "m2",
        //   sender: "user",
        //   text: "I want to compare health insurance plans.",
        //   createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        // },
        // {
        //   id: "m3",
        //   sender: "agent",
        //   text: "Great! Do you prefer individual or family coverage?",
        //   createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        // },
      ],
    };
  }

  const url = API_BASE + LIST_PATH.replace("{conversationId}", encodeURIComponent(conversationId));
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(AUTH_TOKEN ? { Authorization: AUTH_TOKEN } : {}),
    },
  });
  if (!res.ok) return { ok: false, error: `List API ${res.status}` };

  const json = await res.json();
  const data = Array.isArray(json.messages) ? json.messages : json;
  return { ok: true, data };
}

export async function postMessage({ conversationId, text }) {
  if (isMock) {
    await delay(300);
    return {
      ok: true,
      data: {
        id: "u" + Math.random().toString(36).slice(2, 8),
        sender: "user",
        text,
        createdAt: new Date().toISOString(),
      },
    };
  }

  const res = await fetch(API_BASE + POST_PATH, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(AUTH_TOKEN ? { Authorization: AUTH_TOKEN } : {}),
    },
    body: JSON.stringify({ conversationId, sender: "user", text }),
  });

  if (!res.ok) return { ok: false, error: `Post API ${res.status}` };
  const json = await res.json();
  return { ok: true, data: json };
}
