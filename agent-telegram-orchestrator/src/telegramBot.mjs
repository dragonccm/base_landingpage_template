import { handleMessage } from "./core.mjs";

const TELEGRAM_API = "https://api.telegram.org";

function getEnv(name, required = true) {
  const value = process.env[name];
  if (!value && required) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function parseAllowlist(value = "") {
  return new Set(
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

async function tgRequest(token, method, body = {}) {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram API ${method} failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (!json.ok) {
    throw new Error(`Telegram API ${method} not ok: ${JSON.stringify(json)}`);
  }
  return json.result;
}

async function sendMessage(token, chatId, text, replyToMessageId) {
  return tgRequest(token, "sendMessage", {
    chat_id: chatId,
    text,
    ...(replyToMessageId ? { reply_parameters: { message_id: replyToMessageId } } : {})
  });
}

export async function runTelegramPolling() {
  const token = getEnv("TELEGRAM_BOT_TOKEN");
  const allowUsers = parseAllowlist(process.env.TELEGRAM_ALLOW_USER_IDS || "");
  const allowChats = parseAllowlist(process.env.TELEGRAM_ALLOW_CHAT_IDS || "");
  const liveMode = process.env.OPENCLAW_LIVE_MODE === "1";

  let offset = 0;
  console.log("Telegram bot polling started.");
  console.log(`Mode: ${liveMode ? "live via openclaw agent CLI" : "dry-run"}`);

  while (true) {
    try {
      const updates = await tgRequest(token, "getUpdates", {
        timeout: 30,
        offset
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        const msg = update.message || update.edited_message;
        if (!msg?.text?.startsWith("/")) continue;

        const userId = String(msg.from?.id || "");
        const chatId = String(msg.chat?.id || "");

        if (allowUsers.size > 0 && !allowUsers.has(userId)) {
          await sendMessage(token, chatId, "⛔ You are not allowed to use this bot.", msg.message_id);
          continue;
        }

        if (allowChats.size > 0 && !allowChats.has(chatId)) {
          await sendMessage(token, chatId, "⛔ This chat is not allowed.", msg.message_id);
          continue;
        }

        const text = msg.text.trim();
        if (text === "/start") {
          await sendMessage(
            token,
            chatId,
            "🤖 Agent Telegram Orchestrator online. Try: /brainstorm project=expense-note-mobile Xây app mobile quản lý chi tiêu",
            msg.message_id
          );
          continue;
        }

        const reply = await handleMessage(text, { dryRun: !liveMode });
        await sendMessage(token, chatId, reply, msg.message_id);
      }
    } catch (err) {
      console.error("Polling loop error:", err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}
