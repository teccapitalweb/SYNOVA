/* ══════════════════════════════════════════════════════════
   SYNOVA MÉXICO · JS compartido 2026 (páginas interiores)
   Header vidrio · menú móvil · reveal · lightbox
   ══════════════════════════════════════════════════════════ */
(function () {
  /* Header con vidrio al hacer scroll */
  var hd = document.getElementById('hd');
  if (hd) {
    var onScroll = function () { hd.classList.toggle('scrolled', window.scrollY > 12); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Menú móvil (hoja desde la derecha, scroll bloqueado — fix iOS con position:fixed) */
  var sheet = document.getElementById('msheet');
  if (sheet) {
    var scrollY = 0;
    var abrir = function () {
      scrollY = window.scrollY || window.pageYOffset;
      sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false');
      document.body.style.position = 'fixed';
      document.body.style.top = (-scrollY) + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    };
    var cerrar = function () {
      sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      document.documentElement.style.scrollBehavior = '';
    };
    var burger = document.getElementById('burger');
    var closeBtn = document.getElementById('msheet-close');
    var ov = document.getElementById('msheet-ov');
    if (burger) burger.addEventListener('click', abrir);
    if (closeBtn) closeBtn.addEventListener('click', cerrar);
    if (ov) ov.addEventListener('click', cerrar);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
    /* Evitar rebote/arrastre del fondo en iOS con el menú abierto */
    sheet.addEventListener('touchmove', function (e) {
      if (!e.target.closest('.msheet__panel')) e.preventDefault();
    }, { passive: false });
  }

  /* Reveal on scroll */
  var els = document.querySelectorAll('.rv');
  if (els.length) {
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: .14 });
      els.forEach(function (el) { io.observe(el); });
    }
  }

  /* Lightbox (galería) */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = document.getElementById('lightbox-img');
    var abrirLb = function (src, alt) {
      lbImg.src = src; lbImg.alt = alt || 'Vista ampliada';
      lb.classList.add('open'); document.body.style.overflow = 'hidden';
    };
    var cerrarLb = function () {
      lb.classList.remove('open'); document.body.style.overflow = '';
      lbImg.src = '';
    };
    document.querySelectorAll('.gitem').forEach(function (fig) {
      fig.addEventListener('click', function () {
        var img = fig.querySelector('img');
        abrirLb(fig.getAttribute('data-image') || (img && img.src), img && img.alt);
      });
    });
    var lbClose = document.getElementById('lightbox-close');
    if (lbClose) lbClose.addEventListener('click', cerrarLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) cerrarLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarLb(); });
  }

  /* Carrusel de opiniones · duplicar para loop perfecto */
  var track = document.getElementById('opin-track');
  if (track) track.innerHTML += track.innerHTML;
})();
