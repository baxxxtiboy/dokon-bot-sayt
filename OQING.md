# Mijoz topish to'plami

| Papka | Nima |
|---|---|
| `sayt/` | Reklama sayti va shaxsiy namuna do'kon (`namuna.html`) |
| `bot/` | Telegram bot va ariza serveri |
| `daftar/` | Mijozlar daftari. Faqat sizning kompyuteringizda |

`npm install` kerak emas.

## 1. Botni yoqish (5 daqiqa)
1. Telegramda `@BotFather` ga `/newbot` yozing, token oling. **Tokenni hech kimga bermang.**
2. `.env.example` faylidan nusxa olib, nomini `.env` qiling. `BOT_TOKEN=` dan keyin tokenni yozing.
3. `BOSHLASH.bat` ni oching, botingizga `/id` yozing.
4. Chiqqan raqamni `.env` ga `EGA_ID=` dan keyin yozing, `BOSHLASH.bat` ni yopib qayta oching.

Mijoz botga yozsa, xabar sizga keladi. Unga **javob berish (reply)** qilsangiz, javob mijozga boradi.

## 2. Saytni o'zingizniki qilish
`sayt/js/1-sozlama.js`: ism, Telegram, bot, telefon, narxlar.
Loyihani ko'rsatish uchun egasidan ruxsat olib, `ruxsat: true` qiling.
Saytdagi va'dalar (bepul namuna, 2 marta tuzatish, yarmi oldindan) `sayt/index.html` da.

## 3. Internetga chiqarish (Render)
- **Static Site**: publish papkasi `sayt`. Uxlab qolmaydi, mijoz kutmaydi.
- **Web Service**: start `node bot/index.js`, Environment: `BOT_TOKEN`, `EGA_ID`, `SAYT_MANZIL` (static sayt manzili).
- Keyin `1-sozlama.js` dagi `server` ga Web Service manzilini yozing.

## 4. Har kungi ish
1. `daftar/index.html` ni oching, "Sayt manzili"ni yozing.
2. Do'konni qo'shing: nomi, sohasi, **aynan nimasi yoqqani**.
3. "Xabarni nusxalash", o'qib chiqing, do'konga o'zingiz yuboring.
4. Holatni "Xabar yozildi" qiling. 3 kundan keyin daftar bir marta eslatadi.
5. Haftada bir "Nusxa saqlash" bosing: brauzer tozalansa, daftar o'chib ketadi.

Testlar: `npm test`
