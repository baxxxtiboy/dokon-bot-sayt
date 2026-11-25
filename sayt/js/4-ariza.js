// Ariza yuborish: avval bot serveriga, bo'lmasa Telegramga tayyor matn bilan o'tkazadi.
function telegramHavola(matn) {
  if (SOZLAMA.telegram) return "https://t.me/" + encodeURIComponent(SOZLAMA.telegram) + "?text=" + encodeURIComponent(matn);
  if (SOZLAMA.bot) return "https://t.me/" + encodeURIComponent(SOZLAMA.bot);
  return "";
}

function arizaMatni(a) {
  return `Assalomu alaykum! Ismim ${a.ism}. Do'konim: ${a.dokon || "-"}. Aloqa: ${a.aloqa}. ${a.izoh || ""}`.trim();
}

async function arizaYubor(a) {
  const toxtat = new AbortController();
  const soat = setTimeout(() => toxtat.abort(), 60000); // bepul server uyg'onishi uchun
  try {
    const j = await fetch(SOZLAMA.server.replace(/\/$/, "") + "/api/ariza", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a),
      signal: toxtat.signal,
    });
    const t = await j.json().catch(() => ({}));
    if (j.ok && t.ok) return { ok: true };
    if (t.xato && (j.status === 400 || j.status === 429)) return { ok: false, xato: t.xato };
    return { ok: false, telegram: telegramHavola(arizaMatni(a)) };
  } catch {
    return { ok: false, telegram: telegramHavola(arizaMatni(a)) };
  } finally {
    clearTimeout(soat);
  }
}
