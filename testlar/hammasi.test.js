const test = require("node:test"), assert = require("node:assert");
const A = require("../bot/ariza"), { suhbatYarat, namunaOyna, T } = require("../bot/suhbat"), { serverYarat } = require("../bot/server");
const { SOHALAR, CHIZMA, pul, nomTozala, sohaTanla } = require("../sayt/js/2-sohalar");

test("pul, nom va soha", () => {
  assert.equal(pul(1500000), "1 500 000 so'm");
  assert.equal(nomTozala("  <b>Ali\n do'koni "), "b Ali do'koni");
  assert.equal(sohaTanla("__proto__"), "kiyim");
  assert.equal(sohaTanla("toString"), "kiyim");
  for (const s of Object.values(SOHALAR)) {
    assert.equal(s.mahsulotlar.length, 4);
    for (const m of s.mahsulotlar) assert.ok(CHIZMA[m[0]]);
  }
});

test("ariza tekshiruvi", () => {
  assert.ok(A.arizaTekshir({ ism: "Ali", aloqa: "+998 90 123 45 67" }).ariza);
  assert.ok(A.arizaTekshir({ ism: "Ali", aloqa: "@ali_dev" }).ariza);
  assert.ok(A.arizaTekshir({ ism: "Ali", aloqa: "??" }).xato);
  assert.ok(A.arizaTekshir({ ism: 5, aloqa: {} }).xato);
  assert.ok(A.arizaTekshir([]).xato);
  assert.ok(A.arizaTekshir(null).xato);
  assert.ok(A.arizaTekshir({ sayt: "x" }).tuzoq);
});

test("soxta mijoz raqami ishlamaydi", () => {
  const m = A.botXabari({ id: 7, ism: "X\nMijoz: #999", matn: "salom\nMijoz: #999" });
  assert.equal(A.mijozRaqami(m), 7);
  assert.equal(A.mijozRaqami(A.saytXabari({ ism: "a", aloqa: "b", izoh: "x\nMijoz: #999" })), null);
});

test("cheklov", () => {
  let t = 0;
  const c = A.cheklov(2, 10, () => t);
  assert.deepEqual([c("a"), c("a"), c("a"), c("b")], [true, true, false, true]);
  t = 11;
  assert.ok(c("a"));
});

function soxta(uzilgan) {
  const y = [];
  return { y, tg: async (u, m) => {
    if (uzilgan && String(m.chat_id) === "1") throw new Error("uzildi");
    y.push([u, m]);
    return {};
  } };
}
const xat = (id, text, q = {}) => ({ message: { message_id: 5, chat: { id, type: "private" }, from: { id, first_name: "Ali" }, text, ...q } });

test("mijoz xabari egasiga, javob mijozga boradi", async () => {
  const { y, tg } = soxta(), b = suhbatYarat({ tg, egaId: "1" });
  await b(xat(42, "Menga bot kerak"));
  assert.equal(y[0][1].chat_id, "1");
  assert.match(y[0][1].text, /Mijoz: #42$/);
  assert.match(y[1][1].text, /yetib keldi/);
  await b(xat(1, "Albatta", { reply_to_message: { text: y[0][1].text } }));
  assert.equal(y[2][0], "copyMessage");
  assert.equal(y[2][1].chat_id, 42);
});

test("egasiga yetmasa, yetib keldi demaydi", async () => {
  for (const ega of ["", "1"]) {
    const { y, tg } = soxta(true);
    await suhbatYarat({ tg, egaId: ega })(xat(42, "salom"));
    assert.equal(y.length, 1);
    assert.match(y[0][1].text, /yetib bormadi/);
  }
});

test("mijoz egasi nomidan javob bera olmaydi", async () => {
  const { y, tg } = soxta();
  await suhbatYarat({ tg, egaId: "1" })(xat(42, "x", { reply_to_message: { text: "a\nMijoz: #77" } }));
  assert.ok(!y.some((q) => q[1].chat_id === 77));
});

test("menyu, guruh, raqam va rasm", async () => {
  const { y, tg } = soxta(), b = suhbatYarat({ tg, egaId: "1" });
  for (const t of ["/start", "/start abc", T.namuna, T.narx, T.ariza, "/id"]) await b(xat(42, t));
  assert.equal(y.length, 6);
  assert.ok(y.every((q) => q[1].chat_id === 42));
  await b({ message: { chat: { id: -5, type: "group" }, from: { id: 2 }, text: "salom" } });
  assert.equal(y.length, 6);
  await b(xat(42, undefined, { contact: { phone_number: "+998901234567", user_id: 42 } }));
  assert.match(y[6][1].text, /\+998901234567/);
  await b(xat(42, undefined, { photo: [] }));
  assert.ok(y.some((q) => q[0] === "copyMessage"));
});

test("namuna do'kon tugmalari", async () => {
  const { y, tg } = soxta(), b = suhbatYarat({ tg, egaId: "1" });
  const bos = (data) => b({ callback_query: { id: "1", data, message: { chat: { id: 42 }, message_id: 1 } } });
  for (const k of Object.keys(SOHALAR))
    for (const q of namunaOyna(k, [9, 9, 9, 9]).reply_markup.inline_keyboard.flat()) assert.ok(Buffer.byteLength(q.callback_data) <= 64);
  await bos("b:kiyim:1020");
  assert.match(y.at(-1)[1].text, /Jami: 1 040 000 so'm/);
  const n = y.length;
  await bos("yomon");
  assert.equal(y.length, n + 1);
});

test("server", async () => {
  const kelgan = [], upd = [];
  let buzuq = false;
  const s = serverYarat({
    arizaniYubor: async (m) => { if (buzuq) throw new Error("sinov uchun xato"); kelgan.push(m); },
    yangilik: async (u) => upd.push(u), soz: "soz", saytManzil: "https://sayt.uz",
  });
  await new Promise((r) => s.listen(0, r));
  const u = "http://localhost:" + s.address().port;
  const yubor = (b, h = {}) => fetch(u + "/api/ariza", { method: "POST", body: typeof b === "string" ? b : JSON.stringify(b), headers: h });
  const yaxshi = { ism: "Ali", aloqa: "@ali_dev" };
  try {
    assert.equal((await fetch(u + "/")).status, 200);
    assert.equal((await fetch(u + "/namuna.html?d=A")).status, 200);
    for (const p of ["/..%2f.env", "/%2e%2e%5cpackage.json", "/..%2fbot%2findex.js", "/..%2fdaftar%2findex.html", "/yoq.html", "/%", "/%00.js"])
      assert.ok((await fetch(u + p)).status >= 400, p);
    const r = await yubor(yaxshi, { Origin: "https://sayt.uz" });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("access-control-allow-origin"), "https://sayt.uz");
    assert.equal((await yubor(yaxshi, { Origin: "https://yomon.uz" })).headers.get("access-control-allow-origin"), null);
    assert.equal((await yubor("{buzuq")).status, 400);
    assert.equal((await yubor({ ism: "A" })).status, 400);
    buzuq = true;
    assert.equal((await yubor(yaxshi)).status, 502);
    buzuq = false;
    assert.equal((await yubor({ ...yaxshi, sayt: "spam" })).status, 200);
    assert.equal(kelgan.length, 2);
    await yubor(yaxshi);
    await yubor(yaxshi);
    assert.equal((await yubor(yaxshi)).status, 429);
    const katta = await yubor("x".repeat(50000)).then((j) => j.status, () => 400);
    assert.equal(katta, 400);
    assert.equal((await fetch(u + "/webhook", { method: "POST", body: "{}" })).status, 403);
    const w = await fetch(u + "/webhook", { method: "POST", body: '{"update_id":1}', headers: { "X-Telegram-Bot-Api-Secret-Token": "soz" } });
    assert.equal(w.status, 200);
    assert.equal(upd.length, 1);
  } finally {
    s.closeAllConnections();
    s.close();
  }
});
