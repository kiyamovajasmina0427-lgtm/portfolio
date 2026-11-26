PORTFOLIO SAYT (4 boʻlim + Telegram bot aloqasi)
================================================

Papka tuzilishi:
  server.js        - server: saytni koʻrsatadi, formadagi xabarni Telegram botga yuboradi
  package.json     - loyiha maʼlumoti ("npm start" buyrugʻi uchun)
  .env.example     - sirlar uchun namuna (nusxasini .env qilasiz)
  public/          - sayt fayllari
    index.html     - matnlar va 4 boʻlim (Ismingiz, "Universitet nomi" kabi joylarni almashtiring)
    style.css      - rang va dizayn
    script.js      - menyu belgisi va forma yuborish

1) TELEGRAM BOTNI TAYYORLASH
   a) Telegram’da @BotFather ga kiring, /newbot yozing, nom va username bering.
      U sizga TOKEN beradi (uzun matn).
   b) Yangi botingizga kirib, unga biror xabar yozing (masalan, "salom").
   c) Brauzerda oching (TOKEN oʻrniga oʻzingiznikini qoʻying):
        https://api.telegram.org/botTOKEN/getUpdates
      Chiqqan matndan  "chat":{"id":123456789  qismidagi raqamni toping. Bu CHAT_ID.

2) .env FAYLINI YARATISH
   .env.example faylidan nusxa oling, nomini .env qiling va ichiga TOKEN va CHAT_ID ni yozing.
   MUHIM: TOKEN sir. Uni hech kimga bermang, index.html ichiga yozmang,
   GitHub’ga yuklamang (.gitignore .env ni himoya qiladi).

3) ISHGA TUSHIRISH (Node.js)
   VS Code’da papkani oching, terminalni oching (Ctrl + `) va yozing:
     node server.js
   Brauzerda: http://localhost:3000
   Formani toʻldirib yuboring, xabar Telegram botingizga keladi.
   Toʻxtatish: terminalda Ctrl + C

Eslatma: sayt endi serversiz (index.html ni ikki marta bosib) ochilsa ham koʻrinadi,
lekin aloqa formasi faqat "node server.js" ishlab turganda ishlaydi.
