
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      let current = 0;
      const step = Math.max(1, Math.round(target / 60));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = target === 100 ? `${current}%` : `${current}+`;
      }, 28);
      observer.unobserve(el);
    });
  }, { threshold: .55 });
  counters.forEach(counter => observer.observe(counter));
}
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  items.forEach(item => io.observe(item));
}
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightboxImage');
  const closeBtn = document.getElementById('lightboxClose');
  if (!lightbox || !image || !closeBtn) return;
  document.addEventListener('click', (e) => {
    const item = e.target.closest('[data-image]');
    if (item) {
      image.src = item.dataset.image;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    }
    if (e.target === lightbox || e.target === closeBtn) {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      image.src = '';
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      image.src = '';
    }
  });
}
function initMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
}
initCounters(); initReveal(); initLightbox(); initMenu();
