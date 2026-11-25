// Ishlaydigan mini-do'kon. Bosh sahifadagi telefonda ham, namuna.html da ham shu ishlaydi.
function dokonYarat(ildiz, { nom, soha, buyurtmada }) {
  const savat = new Map(); // mahsulot raqami -> nechta
  let s = null;

  ildiz.innerHTML = `
    <div class="dokon-bosh"><strong class="dokon-nom"></strong><span class="dokon-soha"></span></div>
    <div class="dokon-tovar"></div>
    <div class="dokon-past"><span class="dokon-jami" aria-live="polite"></span>
      <button type="button" class="dokon-tugma" disabled>Buyurtma berish</button></div>`;
  const q = (x) => ildiz.querySelector(x);

  function jami() {
    let j = 0;
    savat.forEach((n, i) => { j += s.mahsulotlar[i][2] * n; });
    return j;
  }

  function pastniChiz() {
    q(".dokon-jami").textContent = savat.size ? pul(jami()) : "Savat bo'sh";
    q(".dokon-tugma").disabled = savat.size === 0;
    ildiz.querySelectorAll(".tovar").forEach((el, i) => {
      const n = savat.get(i) || 0;
      el.querySelector(".soni").textContent = n || "";
      el.querySelector(".kam").hidden = n === 0;
    });
  }

  function ozgartir(i, farq) {
    const n = Math.max(0, Math.min(99, (savat.get(i) || 0) + farq));
    if (n) savat.set(i, n); else savat.delete(i);
    pastniChiz();
  }

  function tovarlarniChiz() {
    q(".dokon-tovar").replaceChildren(...s.mahsulotlar.map(([chizma, nomi, narx], i) => {
      const el = document.createElement("div");
      el.className = "tovar";
      el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${CHIZMA[chizma]}</svg>
        <span class="tovar-nom"></span><span class="tovar-narx"></span>
        <div class="tovar-tugma"><button type="button" class="kam" hidden>−</button><b class="soni"></b><button type="button" class="kop">+</button></div>`;
      el.querySelector(".tovar-nom").textContent = nomi;
      el.querySelector(".tovar-narx").textContent = pul(narx);
      el.querySelector(".kop").setAttribute("aria-label", nomi + ": qo'shish");
      el.querySelector(".kam").setAttribute("aria-label", nomi + ": kamaytirish");
      el.querySelector(".kop").onclick = () => ozgartir(i, 1);
      el.querySelector(".kam").onclick = () => ozgartir(i, -1);
      return el;
    }));
  }

  q(".dokon-tugma").onclick = () => {
    const qatorlar = [...savat].map(([i, n]) => ({ nom: s.mahsulotlar[i][1], soni: n, narx: s.mahsulotlar[i][2] * n }));
    buyurtmada({ qatorlar, jami: jami() });
    savat.clear();
    pastniChiz();
  };

  function yangila(yangiNom, yangiSoha) {
    const yangi = SOHALAR[sohaTanla(yangiSoha)];
    if (yangi !== s) { s = yangi; savat.clear(); tovarlarniChiz(); }
    ildiz.style.setProperty("--dokon", s.rang);
    q(".dokon-nom").textContent = nomTozala(yangiNom) || s.misol;
    q(".dokon-soha").textContent = s.nom;
    pastniChiz();
  }

  yangila(nom, soha);
  return { yangila };
}

// Do'kon egasiga keladigan Telegram xabari ko'rinishi.
function xabarChiz(joy, { qatorlar, jami }) {
  joy.replaceChildren();
  const qosh = (matn, klass) => {
    const p = document.createElement("p");
    p.textContent = matn;
    if (klass) p.className = klass;
    joy.append(p);
  };
  qosh("Yangi buyurtma", "xabar-bosh");
  qatorlar.forEach((x) => qosh(`${x.nom} × ${x.soni}: ${pul(x.narx)}`));
  qosh("Jami: " + pul(jami), "xabar-jami");
  qosh("Mijoz: Dilnoza, +998 90 000 00 00 (misol)");
  joy.classList.remove("keldi");
  void joy.offsetWidth; // animatsiya qaytadan boshlanishi uchun
  joy.classList.add("keldi");
}
