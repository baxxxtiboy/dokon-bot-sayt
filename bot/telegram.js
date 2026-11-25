// Telegram API bilan aloqa: so'rov yuborish, webhook (Render) va polling (kompyuter).
const { createHash, timingSafeEqual } = require("node:crypto");

function telegramYarat(token) {
  // Xato matnida token ko'rinmasligi uchun manzil hech qayerga yozilmaydi.
  return async function tg(usul, malumot = {}, kutish = 20000) {
    let j;
    try {
      j = await fetch(`https://api.telegram.org/bot${token}/${usul}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(malumot),
        signal: AbortSignal.timeout(kutish),
      });
    } catch {
      throw new Error(usul + ": Telegramga ulanib bo'lmadi");
    }
    const t = await j.json().catch(() => ({}));
    if (!t.ok) throw new Error(`${usul}: ${t.description || j.status}`);
    return t.result;
  };
}

const maxfiySoz = (token) => createHash("sha256").update("webhook:" + token).digest("hex");

function sozTogri(kelgan, kerak) {
  const a = Buffer.from(String(kelgan || "")), b = Buffer.from(kerak);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function polling(tg, yangilik) {
  const w = await tg("getWebhookInfo");
  if (w.url) {
    console.log("Bot internetdagi serverda ishlayapti, bu yerda ishga tushirilmadi.");
    return;
  }
  console.log("Bot ishga tushdi.");
  let offset = 0;
  for (;;) {
    try {
      const r = await tg("getUpdates", { offset, timeout: 25, allowed_updates: ["message", "callback_query"] }, 40000);
      for (const u of r) { offset = u.update_id + 1; await yangilik(u); }
    } catch (e) {
      console.error(e.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

module.exports = { telegramYarat, maxfiySoz, sozTogri, polling };
