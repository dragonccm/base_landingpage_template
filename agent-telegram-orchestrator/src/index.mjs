import { handleMessage } from "./core.mjs";
import { runTelegramPolling } from "./telegramBot.mjs";

async function main() {
  const isDemo = process.argv.includes("--demo");
  const isTelegram = process.argv.includes("--telegram");

  if (isTelegram) {
    await runTelegramPolling();
    return;
  }

  if (isDemo) {
    const demos = [
      "/brainstorm project=expense-note-mobile Xây app mobile quản lý chi tiêu và ghi chú",
      "/plan project=expense-note-mobile scope=mvp-2-weeks",
      "/code:auto project=expense-note-mobile phase=1 branch=feature/mvp",
      "/code:review target=feature/mvp",
      "/debug CI failed at test step timeout"
    ];

    for (const d of demos) {
      const reply = await handleMessage(d, { dryRun: true });
      console.log("\n>>>", d);
      console.log(reply);
    }
    return;
  }

  const input = process.argv.slice(2).join(" ");
  if (!input) {
    console.log("Usage:\n  npm run demo\n  npm run telegram\n  npm start -- \"/plan project=expense-note-mobile scope=mvp\"");
    return;
  }

  const reply = await handleMessage(input, { dryRun: true });
  console.log(reply);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
