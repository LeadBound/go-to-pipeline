/* Language runtime shared by every option.
   [data-t]       → textContent (or innerHTML when the value carries <br>)
   [data-t-list]  → one <li> per array item
   [data-t-attr="attr:key"] → an attribute
   [data-lang-toggle] → switches EN ⇄ HE.  [data-book] → the booking link.
   Language: ?lang=he|en, then the saved choice, then English. */
(function () {
  var C = window.LB_COPY, KEY = 'lb-gtp-lang';
  function pick() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'he' || q === 'en') return q;
    try { var s = localStorage.getItem(KEY); if (s === 'he' || s === 'en') return s; } catch (e) {}
    return 'en';
  }
  function apply(lang) {
    var d = C[lang] || C.en, root = document.documentElement;
    root.lang = lang; root.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var v = d[el.getAttribute('data-t')];
      if (v == null) return;
      if (String(v).indexOf('<br>') > -1) el.innerHTML = v; else el.textContent = v;
    });
    document.querySelectorAll('[data-t-list]').forEach(function (el) {
      var v = d[el.getAttribute('data-t-list')] || [];
      el.innerHTML = '';
      v.forEach(function (item) { var li = document.createElement('li'); li.textContent = item; el.appendChild(li); });
    });
    document.querySelectorAll('[data-t-attr]').forEach(function (el) {
      el.getAttribute('data-t-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); if (d[p[1]] != null) el.setAttribute(p[0], d[p[1]]);
      });
    });
    if (d['meta.title']) document.title = d['meta.title'];
    var md = document.querySelector('meta[name="description"]'); if (md && d['meta.desc']) md.setAttribute('content', d['meta.desc']);
    document.dispatchEvent(new CustomEvent('lb:lang', { detail: lang }));
  }
  var lang = pick();
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-book]').forEach(function (a) {
      a.href = window.LB_BOOK; a.target = '_blank'; a.rel = 'noopener';
    });
    document.querySelectorAll('[data-replies]').forEach(function (box) {
      var tpl = box.querySelector('template');
      (window.LB_REPLIES || []).forEach(function (txt, i) {
        var n = tpl.content.cloneNode(true);
        var tag = n.querySelector('[data-rep-tag]'); if (tag) tag.setAttribute('data-t', 'rep.' + (i + 1) + '.tag');
        var body = n.querySelector('[data-rep-body]'); if (body) body.textContent = txt;
        box.appendChild(n);
      });
    });
    apply(lang);
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        lang = lang === 'en' ? 'he' : 'en';
        try { localStorage.setItem(KEY, lang); } catch (e) {}
        apply(lang);
      });
    });
  });
})();
