// Boshlanish joyi: node bot/index.js
const path = require("node:path");
try { process.loadEnvFile(path.join(__dirname, "..", ".env")); } catch { /* .env bo'lmasa, Render sozlamalari ishlaydi */ }
const { telegramYarat, maxfiySoz, polling } = require("./telegram");
const { suhbatYarat } = require("./suhbat");
const { serverYarat } = require("./server");

const { BOT_TOKEN, EGA_ID, RENDER_EXTERNAL_URL, SAYT_MANZIL, PORT = 3100 } = process.env;
const tg = BOT_TOKEN ? telegramYarat(BOT_TOKEN) : null;
const yangilik = tg ? suhbatYarat({ tg, egaId: EGA_ID }) : async () => {};

async function arizaniYubor(text) {
  if (!tg || !EGA_ID) throw new Error("BOT_TOKEN yoki EGA_ID yozilmagan");
  await tg("sendMessage", { chat_id: EGA_ID, text });
}

serverYarat({ arizaniYubor, yangilik, soz: tg ? maxfiySoz(BOT_TOKEN) : "", saytManzil: SAYT_MANZIL })
  .listen(PORT, () => console.log("Sayt: http://localhost:" + PORT));

async function botniYoq() {
  if (!tg) return console.log("BOT_TOKEN yo'q: sayt ishlaydi, bot ishlamaydi. OQING.md ga qarang.");
  if (!EGA_ID) console.log("EGA_ID yo'q: botga /id deb yozing va chiqqan raqamni .env ga qo'shing.");
  if (!RENDER_EXTERNAL_URL) return polling(tg, yangilik);
  await tg("setWebhook", { url: RENDER_EXTERNAL_URL + "/webhook", secret_token: maxfiySoz(BOT_TOKEN), allowed_updates: ["message", "callback_query"] });
  console.log("Webhook ulandi.");
}
botniYoq().catch((e) => console.error("Bot ishga tushmadi:", e.message));
