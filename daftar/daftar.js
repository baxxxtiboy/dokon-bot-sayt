// Mijozlar daftari. Hammasi faqat shu kompyuter brauzerida saqlanadi, internetga chiqmaydi.
const HOLAT = { yangi: "Yozilmagan", yozildi: "Xabar yozildi", eslatildi: "Eslatildi", javob: "Javob berdi", namuna: "Namuna so'radi", sotildi: "Sotildi", rad: "Kerak emas dedi" };
const KUN = 24 * 60 * 60 * 1000, KALIT = "mijozlar-daftari";
const $ = (id) => document.getElementById(id);
const ogoh = (m) => { $("ogoh").textContent = m; $("ogoh").hidden = !m; };

// Fayldan yoki xotiradan kelgan yozuvni tekshirib oladi.
function tartibla(x) {
  if (!x || typeof x.nom !== "string" || !x.nom.trim()) return null;
  const m = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  return {
    id: m(x.id, 60) || crypto.randomUUID?.() || String(Math.random()),
    nom: m(x.nom, 32), soha: sohaTanla(x.soha), aloqa: m(x.aloqa, 120), gap: m(x.gap, 140),
    holat: Object.hasOwn(HOLAT, x.holat) ? x.holat : "yangi", vaqt: Number(x.vaqt) || 0,
  };
}
function oqi() {
  try { return (JSON.parse(localStorage.getItem(KALIT)) || []).map(tartibla).filter(Boolean); } catch { return []; }
}
let royxat = oqi();
function saqla() {
  let xato = "";
  try { localStorage.setItem(KALIT, JSON.stringify(royxat)); }
  catch { xato = "Saqlanmadi: brauzer xotirasi yopiq. \"Nusxa saqlash\"ni bosing."; }
  ogoh(xato);
  chiz();
}

// Xabar yozilganidan 3 kun o'tsa, bir marta eslatish vaqti keladi.
const eslatKerak = (d) => d.holat === "yozildi" && Date.now() - d.vaqt >= 3 * KUN;

function havola(d) {
  const asos = $("manzil").value.trim().replace(/\/+$/, "");
  return /^https:\/\//.test(asos) ? `${asos}/namuna.html?s=${d.soha}&d=${encodeURIComponent(d.nom)}` : "";
}
function xabarMatni(d) {
  if (eslatKerak(d)) return `Assalomu alaykum! ${d.nom} uchun namuna do'kon haqida yozgan edim. Ko'rishga ulgurdingizmi? ${havola(d)}\n\nKerak bo'lmasa, aytsangiz kifoya, boshqa bezovta qilmayman.`;
  return `Assalomu alaykum! Sahifangizni ko'rdim, ${d.gap} juda chiroyli ekan.\n\nMen do'konlarga buyurtma qabul qiladigan Telegram bot va sayt qilaman. ${d.nom} uchun namuna tayyorladim:\n${havola(d)}\n\nYoqsa, 3 ta mahsulotingiz bilan bepul qilib beraman. Yoqmasa, hech narsa to'lamaysiz.`;
}

function tugmaYasa(matn, klass, ish) {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = matn; b.className = klass; b.onclick = () => ish(b);
  return b;
}
function qatorYasa(d) {
  const li = document.createElement("li"), chap = document.createElement("div"), ong = document.createElement("div");
  const qosh = (teg, m, k) => { const x = document.createElement(teg); x.textContent = m; x.className = k || ""; chap.append(x); };
  qosh("h3", d.nom);
  qosh("p", [SOHALAR[d.soha].nom, d.aloqa].filter(Boolean).join(", "), "xira");
  qosh("p", "Yoqqani: " + d.gap);
  if (d.vaqt) qosh("p", "Oxirgi o'zgarish: " + new Date(d.vaqt).toLocaleDateString("ru-RU"), "xira");
  if (eslatKerak(d)) qosh("p", "3 kun o'tdi, bir marta eslating", "eslat");
  ong.className = "amal";
  const sel = document.createElement("select");
  sel.setAttribute("aria-label", d.nom + " holati");
  Object.entries(HOLAT).forEach(([k, n]) => sel.add(new Option(n, k)));
  sel.value = d.holat;
  sel.onchange = () => { d.holat = sel.value; d.vaqt = Date.now(); saqla(); };
  ong.append(
    tugmaYasa(eslatKerak(d) ? "Eslatmani nusxalash" : "Xabarni nusxalash", "", async (b) => {
      if (!havola(d)) return ogoh("Avval \"Sayt manzili\"ni yozing (https:// bilan).");
      try { await navigator.clipboard.writeText(xabarMatni(d)); ogoh(""); b.textContent = "Nusxalandi"; }
      catch { prompt("Shu matnni nusxalang:", xabarMatni(d)); }
    }),
    sel,
    tugmaYasa("O'chirish", "ochir", () => {
      if (confirm(d.nom + " o'chirilsinmi?")) { royxat = royxat.filter((x) => x !== d); saqla(); }
    }),
  );
  li.append(chap, ong);
  return li;
}
function chiz() {
  const f = $("filtr").value;
  const korin = royxat.filter((d) => f === "hamma" || (f === "eslat" ? eslatKerak(d) : d.holat === f));
  $("royxat").replaceChildren(...korin.map(qatorYasa));
  $("bosh").hidden = korin.length > 0;
  $("bosh").textContent = royxat.length ? "Bu holatda do'kon yo'q." : "Hali do'kon yo'q. Yuqoridan birinchisini qo'shing.";
  const s = (...k) => royxat.filter((d) => k.includes(d.holat)).length;
  $("hisob").textContent = `Jami ${royxat.length}. Yozilgan ${royxat.length - s("yangi")}, javob ${s("javob", "namuna", "sotildi", "rad")}, sotildi ${s("sotildi")}. Eslatish kerak: ${royxat.filter(eslatKerak).length}`;
}

// --- Boshlash ---
const sohaTanlov = document.querySelector("#yangi select");
Object.entries(SOHALAR).forEach(([k, s]) => sohaTanlov.add(new Option(s.nom, k)));
$("filtr").add(new Option("Hammasi", "hamma"));
$("filtr").add(new Option("Eslatish kerak", "eslat"));
Object.entries(HOLAT).forEach(([k, n]) => $("filtr").add(new Option(n, k)));
$("filtr").onchange = chiz;
try { $("manzil").value = localStorage.getItem(KALIT + "-manzil") || ""; } catch { /* xotira yopiq */ }
$("manzil").onchange = () => {
  try { localStorage.setItem(KALIT + "-manzil", $("manzil").value.trim()); } catch { /* xotira yopiq */ }
};
$("yangi").onsubmit = (e) => {
  e.preventDefault();
  const d = tartibla(Object.fromEntries(new FormData(e.target)));
  if (!d || !d.gap) return ogoh("Do'kon nomini va nimasi yoqqanini yozing.");
  if (royxat.some((x) => x.nom.toLowerCase() === d.nom.toLowerCase())) return ogoh(d.nom + " daftarda bor.");
  royxat.unshift(d);
  e.target.reset();
  saqla();
};
$("saqla").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(royxat, null, 1)], { type: "application/json" }));
  a.download = "daftar-nusxa.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$("och").onchange = async (e) => {
  try {
    const yangi = JSON.parse(await e.target.files[0].text()).map(tartibla).filter(Boolean);
    const bor = new Set(royxat.map((x) => x.nom.toLowerCase()));
    royxat = [...royxat, ...yangi.filter((x) => !bor.has(x.nom.toLowerCase()))];
    saqla();
  } catch {
    ogoh("Bu fayl daftar nusxasi emas.");
  }
  e.target.value = "";
};
chiz();
