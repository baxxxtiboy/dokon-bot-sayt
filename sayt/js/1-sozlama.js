// ============================================================
//  BU YERNI O'ZGARTIRING. Saytdagi hamma ma'lumot shu faylda.
// ============================================================
const SOZLAMA = {
  // Ismingiz. Bo'sh qolsa, saytda ko'rsatilmaydi.
  ism: "",
  // Shaxsiy Telegram username'ingiz, @ belgisisiz. Masalan: "ali_dev"
  telegram: "",
  // Botingiz username'i, @ belgisisiz. Masalan: "dokon_zakaz_bot"
  bot: "",
  // Telefon, masalan: "+998 90 123 45 67". Bo'sh qolsa, ko'rsatilmaydi.
  telefon: "",
  shahar: "",
  // Bot serveri manzili (Render), masalan: "https://mening-botim.onrender.com".
  // Bo'sh bo'lsa, ariza sayt turgan serverga ketadi.
  server: "",

  // Narxlar, so'mda. O'zingiz xohlaganingizcha o'zgartiring.
  narxlar: [
    { nom: "Katalog sayt", narx: 800000, muddat: "3-5 kun",
      ichida: ["Mahsulotlar rasmi va narxi bilan", "Telefonda qulay ochiladi", "Telegram va telefon tugmalari"] },
    { nom: "Buyurtma boti", narx: 1500000, muddat: "5-7 kun",
      ichida: ["Telegram ichida katalog va savat", "Buyurtma kelsa, sizga darhol xabar", "Mahsulotni o'zingiz qo'shasiz"] },
    { nom: "Bot, sayt va boshqaruv", narx: 3000000, muddat: "10-14 kun",
      ichida: ["Sayt va bot bitta bazada", "Buyurtmalar holati va qoldiq", "Savdo hisoboti"] },
  ],

  // Ishlaringiz. ruxsat: false bo'lsa, SAYTDA KO'RINMAYDI.
  // Egasidan ruxsat olgach, true qiling.
  ishlar: [
    { nom: "Erkin kurash", tur: "Onlayn 3D o'yin", ruxsat: true,
      matn: "Brauzerda ishlaydigan ko'p kishilik o'yin: jonli server, hisoblar va reyting.",
      havola: "https://erkin-kurash.onrender.com", eslatma: "Birinchi ochilishi 15 soniyagacha cho'ziladi" },
    { nom: "Ikat by Malika Shakirova", tur: "Kiyim katalogi", ruxsat: false,
      matn: "Animatsiyali mahsulot katalogi.", havola: "https://ikat-katalog.onrender.com" },
    { nom: "Azimjanovs Store", tur: "Kosmetika do'koni boti", ruxsat: false,
      matn: "Katalog, savat, buyurtma holati va boshqaruv paneli.", havola: "" },
    { nom: "Glass Ideal Vitraj", tur: "Bot va veb-ilova", ruxsat: false,
      matn: "Katalog, savat va qarz hisobi.", havola: "" },
  ],
};
// Testlar va bot uchun (brauzerda bu qator ishlamaydi).
if (typeof module !== "undefined") module.exports = { SOZLAMA };
