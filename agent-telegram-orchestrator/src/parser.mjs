export function parseTelegramCommand(text = "") {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) {
    return { ok: false, error: "Message must start with '/'" };
  }

  const [head, ...rest] = trimmed.split(/\s+/);
  const [rawName, ...inlineParts] = head.slice(1).split(/\s+/);
  const name = rawName?.toLowerCase();

  const argTokens = [...inlineParts, ...rest];
  const args = {};
  const free = [];

  for (const token of argTokens) {
    if (token.includes("=")) {
      const [k, ...v] = token.split("=");
      args[k.trim()] = v.join("=").trim();
    } else {
      free.push(token);
    }
  }

  return {
    ok: true,
    command: name,
    args,
    raw: trimmed,
    freeText: free.join(" ").trim()
  };
}
