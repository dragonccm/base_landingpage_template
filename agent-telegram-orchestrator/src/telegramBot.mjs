import { handleMessageDetailed } from "./core.mjs";

const TELEGRAM_API = "https://api.telegram.org";
const SENSITIVE_COMMANDS = new Set(["code:auto", "debug"]);
const pendingConfirms = new Map();

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

function commandName(text) {
  const m = text.match(/^\/([^\s]+)/);
  return (m?.[1] || "").toLowerCase();
}

function makeConfirmKey(chatId, userId) {
  return `${chatId}:${userId}`;
}

function makeConfirmId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
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

        if (text.startsWith("/confirm ")) {
          const confirmId = text.slice(9).trim();
          const key = makeConfirmKey(chatId, userId);
          const pending = pendingConfirms.get(key);
          if (!pending || pending.expiresAt < Date.now()) {
            pendingConfirms.delete(key);
            await sendMessage(token, chatId, "❌ No pending confirmation or it has expired.", msg.message_id);
            continue;
          }

          if (pending.confirmId !== confirmId) {
            await sendMessage(token, chatId, "❌ Invalid confirmation id.", msg.message_id);
            continue;
          }

          pendingConfirms.delete(key);
          await sendMessage(token, chatId, `⏳ Running ${pending.commandText}`, msg.message_id);
          const result = await handleMessageDetailed(pending.commandText, { dryRun: !liveMode, source: "telegram" });
          await sendMessage(token, chatId, result.reply, msg.message_id);
          continue;
        }

        const cmd = commandName(text);
        if (SENSITIVE_COMMANDS.has(cmd)) {
          const confirmId = makeConfirmId();
          const key = makeConfirmKey(chatId, userId);
          pendingConfirms.set(key, {
            confirmId,
            commandText: text,
            expiresAt: Date.now() + 10 * 60 * 1000
          });
          await sendMessage(
            token,
            chatId,
            `⚠️ Sensitive command detected: /${cmd}\nReply with /confirm ${confirmId} within 10 minutes to proceed.`,
            msg.message_id
          );
          continue;
        }

        await sendMessage(token, chatId, `⏳ Running /${cmd}...`, msg.message_id);
        const result = await handleMessageDetailed(text, { dryRun: !liveMode, source: "telegram" });
        await sendMessage(token, chatId, result.reply, msg.message_id);
      }
    } catch (err) {
      console.error("Polling loop error:", err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}
