// Saytdan kelgan arizani tekshirish va egasiga boradigan xabar matnini tuzish.
const tozala = (x, n) => (typeof x === "string" ? x : "").replace(/[\u0000-\u0009\u000b-\u001f]/g, " ").trim().slice(0, n);
const birQator = (x, n) => tozala(x, n).replace(/\n/g, " ");

function arizaTekshir(x) {
  if (!x || typeof x !== "object" || Array.isArray(x)) return { xato: "Ariza noto'g'ri." };
  if (tozala(x.sayt, 10)) return { tuzoq: true }; // yashirin maydonni faqat spam-botlar to'ldiradi
  const a = { ism: birQator(x.ism, 60), aloqa: birQator(x.aloqa, 60), dokon: birQator(x.dokon, 60), izoh: tozala(x.izoh, 600) };
  if (a.ism.length < 2) return { xato: "Ismingizni yozing." };
  const raqam = a.aloqa.replace(/\D/g, "").length >= 7;
  const username = /^(@|(https?:\/\/)?t\.me\/)?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(a.aloqa);
  if (!raqam && !username) return { xato: "Telefon raqam yoki Telegram username yozing." };
  return { ariza: a };
}

function saytXabari(a) {
  return ["SAYTDAN ARIZA", `Ism: ${a.ism}`, `Aloqa: ${a.aloqa}`, `Do'kon: ${a.dokon || "-"}`, `Izoh: ${a.izoh || "-"}`,
    "", "(Sayt arizasi: javobni telefon yoki Telegram orqali bering)"].join("\n");
}

// Botga yozgan mijoz. Oxirgi qatordagi raqam orqali egasining javobi mijozga qaytadi.
function botXabari({ id, ism, username, matn }) {
  return [matn, "", `Kim: ${birQator(ism, 100)}${username ? " @" + username : ""}`, `Mijoz: #${id}`].join("\n");
}

// Faqat oxirgi qator hisobga olinadi: mijoz matn ichiga soxta "#raqam" yoza olmaydi.
function mijozRaqami(matn) {
  const m = /\nMijoz: #(\d{1,16})$/.exec(matn || "");
  return m ? Number(m[1]) : null;
}

// Bitta odamdan ma'lum muddatda nechta xabar mumkinligini cheklaydi.
function cheklov(nechta, muddat, hozir = Date.now) {
  const kim = new Map();
  return (kalit) => {
    const t = hozir();
    if (kim.size > 5000) for (const [k, v] of kim) if (t - v.at(-1) > muddat) kim.delete(k);
    const v = (kim.get(kalit) || []).filter((x) => t - x < muddat);
    const mumkin = v.length < nechta;
    if (mumkin) v.push(t);
    if (v.length) kim.set(kalit, v);
    return mumkin;
  };
}

module.exports = { arizaTekshir, saytXabari, botXabari, mijozRaqami, cheklov };
