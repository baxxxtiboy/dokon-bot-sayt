// Namuna do'konlar uchun mahsulotlar. Rasm o'rnida oddiy SVG chizmalar.
const CHIZMA = {
  koylak: '<path d="M38 18q12 9 24 0l8 8-7 16 15 46q-28 10-56 0l15-46-7-16z"/><path d="M36 44h28" class="chiziq"/>',
  chopon: '<path d="M36 16h28l20 14-8 22-8-4v40H32V48l-8 4-8-22z"/><path d="M50 16v72M40 60h6M54 60h6" class="chiziq"/>',
  sumka: '<path d="M20 42h60l6 44H14z"/><path d="M34 42q0-24 16-24t16 24" class="chiziq rangli"/>',
  romol: '<path d="M14 24h72L50 88z"/><path d="M28 34h44M37 48h26" class="chiziq"/>',
  shisha: '<rect x="28" y="40" width="44" height="48" rx="7"/><rect x="42" y="28" width="16" height="12"/><rect x="38" y="12" width="24" height="15" rx="3"/><path d="M38 58h24M38 66h16" class="chiziq"/>',
  krem: '<rect x="20" y="44" width="60" height="42" rx="9"/><rect x="16" y="28" width="68" height="14" rx="5"/><path d="M34 64h32" class="chiziq"/>',
  lab: '<path d="M38 48h24v40H38z"/><path d="M42 48V24l16-10v34z"/><path d="M38 60h24" class="chiziq"/>',
  tort: '<path d="M16 54h68v34H16z"/><path d="M26 32h48v22H26z"/><path d="M50 32V14" class="chiziq rangli"/><path d="M16 66q9 9 17 0t17 0 17 0 17 0" class="chiziq"/>',
  keks: '<path d="M28 56h44l-7 32H35z"/><path d="M20 53q0-16 14-18 4-20 24-14 18 2 14 18 10 4 8 14z"/><path d="M42 62v20M58 62v20" class="chiziq"/>',
  non: '<circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="22" class="chiziq"/><path d="M50 40v20M40 50h20" class="chiziq"/>',
  kursi: '<path d="M30 12h40v36H30z"/><path d="M24 52h52v12H24z"/><path d="M30 64v24M70 64v24" class="chiziq rangli"/>',
  divan: '<path d="M26 26h48v32H26z"/><path d="M10 44h14v18h52V44h14v34H10z"/><path d="M50 28v30" class="chiziq"/>',
  stol: '<path d="M10 34h80v12H10z"/><path d="M22 46v42M78 46v42M22 66h56" class="chiziq rangli"/>',
  vitraj: '<path d="M22 88V42a28 28 0 0156 0v46z"/><path d="M50 14v74M22 46h56M22 68h56M34 46l16-32 16 32" class="chiziq"/>',
  oyna: '<ellipse cx="50" cy="50" rx="30" ry="40"/><path d="M36 48L54 24M42 62l22-30" class="chiziq"/>',
  eshik: '<rect x="26" y="10" width="48" height="80" rx="3"/><path d="M34 20h32v28H34zM34 56h32v26H34z" class="chiziq"/>',
};

const SOHALAR = {
  kiyim: { nom: "Kiyim", misol: "Nafis atelyesi", rang: "#b3173f", mahsulotlar: [
    ["koylak", "Ipak ko'ylak", 420000], ["chopon", "Bahorgi chopon", 560000], ["sumka", "Charm sumka", 310000], ["romol", "Ipak ro'mol", 140000]] },
  parfyum: { nom: "Parfyum va kosmetika", misol: "Atir olami", rang: "#6a3d8f", mahsulotlar: [
    ["shisha", "Atir, 50 ml", 380000], ["krem", "Yuz kremi", 120000], ["lab", "Lab bo'yog'i", 75000], ["shisha", "Atir, 100 ml", 620000]] },
  shirinlik: { nom: "Tort va shirinlik", misol: "Asal tortlar", rang: "#a34a08", mahsulotlar: [
    ["tort", "Ikki qavatli tort", 350000], ["keks", "Keks, 6 dona", 90000], ["non", "Patir non", 15000], ["tort", "Bolalar torti", 280000]] },
  mebel: { nom: "Mebel", misol: "Qulay uy", rang: "#2c6146", mahsulotlar: [
    ["divan", "Uch kishilik divan", 4200000], ["kursi", "Yumshoq stul", 450000], ["stol", "Oshxona stoli", 1800000], ["kursi", "Bolalar stuli", 320000]] },
  oyna: { nom: "Oyna va vitraj", misol: "Shaffof", rang: "#0b6a7d", mahsulotlar: [
    ["vitraj", "Vitraj oyna", 900000], ["oyna", "Devor oynasi", 380000], ["eshik", "Oynali eshik", 1600000], ["oyna", "Hammom oynasi", 290000]] },
};

// 420000 -> "420 000 so'm" (bo'shliqlar qatorni bo'lmaydi)
function pul(son) { return String(son).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm"; }

// Foydalanuvchi yozgan do'kon nomini tartibga soladi.
function nomTozala(matn) {
  return String(matn || "").replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 32);
}

// Ro'yxatda yo'q soha kelsa, "kiyim" olinadi.
function sohaTanla(kalit) { return Object.hasOwn(SOHALAR, kalit) ? kalit : "kiyim"; }

// Testlar va bot uchun (brauzerda bu qator ishlamaydi).
if (typeof module !== "undefined") module.exports = { SOHALAR, CHIZMA, pul, nomTozala, sohaTanla };
