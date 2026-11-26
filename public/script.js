(function () {
  // 1) Menyuda hozir koʻrinib turgan boʻlimni belgilash
  var links = Array.prototype.slice.call(document.querySelectorAll('nav a'));
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) {
        a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section').forEach(function (s) { io.observe(s); });

  // 2) Aloqa formasi: xabarni serverga yuboradi, server Telegram botga uzatadi
  var form = document.getElementById('form');
  var status = document.getElementById('status');
  var btn = form.querySelector('button');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    status.className = 'note';
    status.textContent = 'Yuborilmoqda…';
    btn.disabled = true;
    try {
      var res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      var data = await res.json().catch(function () { return {}; });
      if (res.ok && data.ok) {
        status.className = 'note ok';
        status.textContent = 'Xabar yuborildi. Rahmat!';
        form.reset();
      } else {
        status.className = 'note err';
        status.textContent = data.error || 'Xatolik yuz berdi.';
      }
    } catch (err) {
      status.className = 'note err';
      status.textContent = 'Serverga ulanib boʻlmadi. Saytni “node server.js” bilan ishga tushirganingizni tekshiring.';
    }
    btn.disabled = false;
  });
})();
