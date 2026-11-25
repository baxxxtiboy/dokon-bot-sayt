// Bosh sahifa.
const el = (id) => document.getElementById(id);
function yasa(teg, klass, matn) {
  const x = document.createElement(teg);
  if (klass) x.className = klass;
  if (matn) x.textContent = matn;
  return x;
}

// --- Jonli namuna ---
const nomMaydon = el("nom"), sohaMaydon = el("soha");
Object.entries(SOHALAR).forEach(([k, s]) => sohaMaydon.add(new Option(s.nom, k)));
const dokon = dokonYarat(el("dokon"), { nom: "", soha: "kiyim", buyurtmada: (b) => {
  xabarChiz(el("xabar"), b);
  el("xabar").scrollIntoView({ block: "nearest" });
} });
function namunaYangila() {
  dokon.yangila(nomMaydon.value, sohaMaydon.value);
  nomMaydon.placeholder = SOHALAR[sohaMaydon.value].misol;
  const nom = nomTozala(nomMaydon.value);
  el("toliq").href = "namuna.html?s=" + sohaMaydon.value + (nom ? "&d=" + encodeURIComponent(nom) : "");
}
nomMaydon.oninput = namunaYangila;
sohaMaydon.onchange = namunaYangila;
namunaYangila();

// --- Narxlar ---
SOZLAMA.narxlar.forEach((n) => {
  const li = yasa("li", "narx"), ul = yasa("ul");
  n.ichida.forEach((x) => ul.append(yasa("li", "", x)));
  li.append(yasa("h3", "", n.nom), yasa("p", "narx-son", pul(n.narx) + "dan"), yasa("p", "narx-muddat", n.muddat), ul);
  el("narxlar").append(li);
});

// --- Ishlar: faqat ruxsat olinganlari ---
const korinadi = SOZLAMA.ishlar.filter((i) => i.ruxsat);
el("ishlar-bolim").hidden = korinadi.length === 0;
korinadi.forEach((i) => {
  const li = yasa("li", "ish");
  li.append(yasa("h3", "", i.nom), yasa("p", "ish-tur", i.tur), yasa("p", "", i.matn));
  if (i.havola) {
    const a = yasa("a", "", "Ochib ko'rish");
    a.href = i.havola; a.target = "_blank"; a.rel = "noopener";
    li.append(a);
  }
  if (i.eslatma) li.append(yasa("small", "", i.eslatma));
  el("ishlar").append(li);
});

// --- Aloqa ---
el("kim").textContent = [SOZLAMA.ism, SOZLAMA.shahar].filter(Boolean).join(", ");
function aloqaQosh(matn, havola) {
  const a = yasa("a", "", matn);
  a.href = havola;
  el("aloqa").append(a);
}
if (SOZLAMA.telegram) aloqaQosh("Telegram: @" + SOZLAMA.telegram, "https://t.me/" + SOZLAMA.telegram);
if (SOZLAMA.bot) aloqaQosh("Bot: @" + SOZLAMA.bot, "https://t.me/" + SOZLAMA.bot);
if (SOZLAMA.telefon) aloqaQosh(SOZLAMA.telefon, "tel:" + SOZLAMA.telefon.replace(/[^+\d]/g, ""));

// --- Ariza ---
el("ariza").onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target, holat = el("holat"), tugma = f.querySelector("button");
  const a = Object.fromEntries(new FormData(f));
  a.dokon = a.dokon || nomTozala(nomMaydon.value);
  tugma.disabled = true;
  holat.className = "holat";
  holat.textContent = "Yuborilyapti...";
  const j = await arizaYubor(a);
  tugma.disabled = false;
  if (j.ok) {
    f.reset();
    holat.classList.add("yaxshi");
    holat.textContent = "Arizangiz yetib keldi. Tez orada bog'lanaman.";
    return;
  }
  holat.classList.add("yomon");
  if (j.xato) { holat.textContent = j.xato; return; }
  holat.textContent = "Ariza yuborilmadi. ";
  if (j.telegram) {
    const t = yasa("a", "", "Telegramda yozing");
    t.href = j.telegram; t.target = "_blank"; t.rel = "noopener";
    holat.append(t);
  } else holat.append("Birozdan keyin qayta urinib ko'ring.");
};
