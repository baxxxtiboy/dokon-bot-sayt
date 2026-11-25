// Botning gaplari. tg(usul, malumot): Telegramga so'rov yuboradigan funksiya.
const { botXabari, mijozRaqami, cheklov } = require("./ariza");
const { SOHALAR, pul, sohaTanla } = require("../sayt/js/2-sohalar");
const { SOZLAMA } = require("../sayt/js/1-sozlama");

const T = { namuna: "Namuna do'kon", narx: "Narxlar", ariza: "Bepul namuna so'rash", raqam: "Raqamimni yuborish" };
const MENYU = { resize_keyboard: true, keyboard: [[T.namuna, T.narx], [T.ariza], [{ text: T.raqam, request_contact: true }]] };

const narxMatni = () => SOZLAMA.narxlar
  .map((n) => `${n.nom}: ${pul(n.narx)}dan, ${n.muddat}\n` + n.ichida.map((x) => "- " + x).join("\n")).join("\n\n");

const jamiHisob = (s, sonlar) => s.mahsulotlar.reduce((j, m, i) => j + m[2] * sonlar[i], 0);

// Savat tugma ichida saqlanadi ("d:kiyim:1020"), shuning uchun server o'chib yonsa ham yo'qolmaydi.
function namunaOyna(kalit, sonlar) {
  const s = SOHALAR[kalit], jami = jamiHisob(s, sonlar);
  const tugma = s.mahsulotlar.map((m, i) => {
    const yangi = sonlar.map((n, k) => (k === i ? Math.min(9, n + 1) : n)).join("");
    return [{ text: `${m[1]}, ${pul(m[2])}${sonlar[i] ? " × " + sonlar[i] : ""}`, callback_data: `d:${kalit}:${yangi}` }];
  });
  const past = [{ text: "Boshqa soha", callback_data: "s" }];
  if (jami) {
    past.push({ text: "Tozalash", callback_data: `d:${kalit}:0000` });
    past.push({ text: "Buyurtma", callback_data: `b:${kalit}:${sonlar.join("")}` });
  }
  return {
    text: `${s.misol} (bu namuna, haqiqiy do'kon emas)\n\nMahsulotni bosing, savatga tushadi.\nJami: ${pul(jami)}`,
    reply_markup: { inline_keyboard: [...tugma, past] },
  };
}

const sohaOyna = () => ({
  text: "Qaysi do'kon namunasini ko'rasiz?",
  reply_markup: { inline_keyboard: Object.entries(SOHALAR).map(([k, s]) => [{ text: s.nom, callback_data: `d:${k}:0000` }]) },
});

function suhbatYarat({ tg, egaId }) {
  const ruxsat = cheklov(20, 60 * 60 * 1000);
  const ayt = (chat_id, text, qosh = {}) => tg("sendMessage", { chat_id, text, ...qosh });

  // Mijoz yozganini egasiga yetkazadi. Yetib bormasa, mijozga "yetib keldi" demaydi.
  async function egaga(xabar, matn, nusxa) {
    const { chat, from } = xabar;
    if (!ruxsat(chat.id)) return ayt(chat.id, "Juda ko'p xabar yubordingiz. Bir soatdan keyin yozing.");
    try {
      if (!egaId) throw new Error("EGA_ID yozilmagan");
      const ism = [from.first_name, from.last_name].filter(Boolean).join(" ");
      await ayt(egaId, botXabari({ id: chat.id, ism, username: from.username, matn }));
      if (nusxa) await tg("copyMessage", { chat_id: egaId, from_chat_id: chat.id, message_id: xabar.message_id });
    } catch (e) {
      console.error("Egasiga yuborilmadi:", e.message);
      return ayt(chat.id, "Xabaringiz yetib bormadi. Birozdan keyin qayta yozing.", { reply_markup: MENYU });
    }
    return ayt(chat.id, "Xabaringiz yetib keldi. Tez orada shu yerda javob beraman.", { reply_markup: MENYU });
  }

  async function egaJavobi(x) {
    const kimga = mijozRaqami(x.reply_to_message.text);
    if (!kimga) return ayt(x.chat.id, "Bunga bot orqali javob berib bo'lmaydi. Oxirida \"Mijoz: #raqam\" bor xabarga javob bering.");
    try {
      await tg("copyMessage", { chat_id: kimga, from_chat_id: x.chat.id, message_id: x.message_id });
    } catch (e) {
      return ayt(x.chat.id, "Javob yetib bormadi: " + e.message);
    }
    return ayt(x.chat.id, "Javobingiz yuborildi.");
  }

  async function xabar(x) {
    if (x.chat.type !== "private" || !x.from) return;
    const id = x.chat.id, ega = String(id) === String(egaId || ""), t = (x.text || "").trim();
    if (t === "/id") return ayt(id, "Sizning ID raqamingiz: " + id);
    if (/^\/start(\s|$)/.test(t)) {
      return ayt(id, "Assalomu alaykum! Do'konlar uchun Telegram bot va sayt qilaman.\n\nAvval namunani ko'ring. Yoqsa, o'z mahsulotlaringiz bilan bepul namuna so'rang.", { reply_markup: MENYU });
    }
    if (ega && x.reply_to_message) return egaJavobi(x);
    if (t === T.namuna || t === "/namuna") { const o = sohaOyna(); return ayt(id, o.text, { reply_markup: o.reply_markup }); }
    if (t === T.narx || t === "/narx") return ayt(id, narxMatni() + "\n\nAniq narx kelishuvda yoziladi.", { reply_markup: MENYU });
    if (t === T.ariza) {
      return ayt(id, "Bitta xabarda yozing: do'koningiz nomi, nima sotasiz va qaysi shahardasiz. Instagram sahifangiz bo'lsa, havolasini qo'shing.", { reply_markup: MENYU });
    }
    if (ega) return ayt(id, "Siz egasiz. Mijozga javob berish uchun uning xabariga \"javob berish\" qiling.", { reply_markup: MENYU });
    if (x.contact) {
      const begona = x.contact.user_id === x.from.id ? "" : " (boshqa odamning kontakti)";
      return egaga(x, "BOT: TELEFON RAQAM\n" + x.contact.phone_number + begona);
    }
    if (t) return egaga(x, "BOT: YANGI XABAR\n" + t.slice(0, 3000));
    return egaga(x, "BOT: RASM YOKI FAYL (pastda)", true);
  }

  async function tugma(c) {
    await tg("answerCallbackQuery", { callback_query_id: c.id });
    if (!c.message) return;
    const joy = { chat_id: c.message.chat.id, message_id: c.message.message_id };
    const ozgart = async (oyna) => {
      try { await tg("editMessageText", { ...joy, ...oyna }); }
      catch (e) { if (!/not modified/.test(e.message)) throw e; } // savat o'zgarmagan bo'lsa, xato emas
    };
    if (c.data === "s") return ozgart(sohaOyna());
    const m = /^([db]):(\w+):(\d{4})$/.exec(c.data || "");
    if (!m) return;
    const kalit = sohaTanla(m[2]), sonlar = [...m[3]].map(Number), s = SOHALAR[kalit];
    if (m[1] === "d") return ozgart(namunaOyna(kalit, sonlar));
    const qator = s.mahsulotlar.map((p, i) => (sonlar[i] ? `${p[1]} × ${sonlar[i]}: ${pul(p[2] * sonlar[i])}` : "")).filter(Boolean);
    return ozgart({
      text: `Do'kon egasiga shunday xabar keladi:\n\nYANGI BUYURTMA (namuna)\n${qator.join("\n")}\nJami: ${pul(jamiHisob(s, sonlar))}\nMijoz: Dilnoza, +998 90 000 00 00 (misol)`,
      reply_markup: { inline_keyboard: [[{ text: "Yana ko'rish", callback_data: "s" }]] },
    });
  }

  return async function yangilik(u) {
    try {
      if (u.message) await xabar(u.message);
      else if (u.callback_query) await tugma(u.callback_query);
    } catch (e) {
      console.error("Bot xatosi:", e.message);
    }
  };
}

module.exports = { suhbatYarat, namunaOyna, T };
