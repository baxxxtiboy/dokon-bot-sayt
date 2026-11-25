// Shaxsiy namuna: namuna.html?s=kiyim&d=Do'kon nomi
const par = new URLSearchParams(location.search);
const nNom = nomTozala(par.get("d")), nSoha = sohaTanla(par.get("s"));
document.title = (nNom || SOHALAR[nSoha].misol) + ": namuna do'kon";
dokonYarat(document.getElementById("dokon"), { nom: nNom, soha: nSoha, buyurtmada: (b) => {
  const joy = document.getElementById("xabar");
  xabarChiz(joy, b);
  joy.scrollIntoView({ block: "nearest" });
} });
const salom = `Assalomu alaykum! ${nNom ? nNom + " uchun" : "Do'konim uchun"} namunani ko'rdim, batafsil gaplashsak.`;
document.getElementById("yoz").href = telegramHavola(salom) || "index.html#ariza-bolim";
