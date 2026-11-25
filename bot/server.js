// Sayt fayllari, ariza qabul qilish va Telegram webhook.
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
const { arizaTekshir, saytXabari, cheklov } = require("./ariza");
const { sozTogri } = require("./telegram");

const SAYT = path.join(__dirname, "..", "sayt");
const TUR = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".woff2": "font/woff2" };

function tana(req, chegara) {
  return new Promise((hal, rad) => {
    let uzun = 0;
    const b = [];
    req.on("data", (d) => {
      uzun += d.length;
      if (uzun > chegara) { rad(new Error("katta")); req.destroy(); } else b.push(d);
    });
    req.on("end", () => { try { hal(JSON.parse(Buffer.concat(b).toString("utf8"))); } catch (e) { rad(e); } });
    req.on("error", rad);
  });
}

function serverYarat({ arizaniYubor, yangilik, soz, saytManzil }) {
  const birKishi = cheklov(5, 60 * 60 * 1000), hamma = cheklov(60, 60 * 60 * 1000);

  return http.createServer(async (req, res) => {
    const json = (kod, x) => {
      if (res.headersSent || res.destroyed) return;
      res.writeHead(kod, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(x));
    };
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    let yol;
    try { yol = decodeURIComponent(req.url.split("?")[0]); } catch { return json(400, { ok: false }); }
    if (yol.includes("\0")) return json(400, { ok: false });

    if (yol === "/salom") return json(200, { ok: true });

    if (yol === "/webhook" && req.method === "POST") {
      if (!soz || !sozTogri(req.headers["x-telegram-bot-api-secret-token"], soz)) return json(403, { ok: false });
      let u;
      try { u = await tana(req, 1e6); } catch { return json(400, { ok: false }); }
      await yangilik(u); // avval ish, keyin javob: server uxlab qolsa, Telegram qayta yuboradi
      return json(200, { ok: true });
    }

    if (yol === "/api/ariza") {
      if (saytManzil && req.headers.origin === saytManzil) {
        res.setHeader("Access-Control-Allow-Origin", saytManzil);
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Vary", "Origin");
      }
      if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
      if (req.method !== "POST") return json(405, { ok: false });
      let x;
      try { x = await tana(req, 10000); } catch { return json(400, { ok: false, xato: "Ariza noto'g'ri." }); }
      const n = arizaTekshir(x);
      if (n.tuzoq) return json(200, { ok: true });
      if (n.xato) return json(400, { ok: false, xato: n.xato });
      const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress).split(",")[0].trim();
      if (!birKishi(ip) || !hamma("hamma")) return json(429, { ok: false, xato: "Juda ko'p ariza. Keyinroq urinib ko'ring." });
      try {
        await arizaniYubor(saytXabari(n.ariza));
        return json(200, { ok: true });
      } catch (e) {
        console.error("Ariza yuborilmadi:", e.message);
        return json(502, { ok: false });
      }
    }

    if (req.method !== "GET" && req.method !== "HEAD") return json(405, { ok: false });
    const fayl = path.join(SAYT, yol === "/" ? "index.html" : yol);
    const tur = TUR[path.extname(fayl)];
    if (!fayl.startsWith(SAYT + path.sep) || !tur) return json(404, { ok: false }); // faqat sayt papkasi
    fs.readFile(fayl, (e, d) => {
      if (e) return json(404, { ok: false });
      res.writeHead(200, { "Content-Type": tur, "Cache-Control": "no-cache" });
      res.end(req.method === "HEAD" ? undefined : d);
    });
  });
}

module.exports = { serverYarat };
