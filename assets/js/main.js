
const data = window.SYNOVA_DATA;
const coursesTrack = document.getElementById('coursesTrack');
const galleryGrid = document.getElementById('galleryGrid');
const testimonialsTrack = document.getElementById('testimonialsTrack');

function buildCourses() {
  const cards = [...data.courses, ...data.courses].map(course => `
    <article class="course-card">
      <img src="assets/images/courses/${encodeURI(course.file)}" alt="${course.title}">
      <div class="course-body">
        <span class="course-area">${course.area}</span>
        <h3>${course.title}</h3>
        <p>${course.desc}</p>
      </div>
    </article>`).join('');
  coursesTrack.innerHTML = cards;
}

function buildGallery() {
  galleryGrid.innerHTML = data.gallery.map((file, index) => `
    <figure class="gallery-item reveal" data-image="assets/images/gallery/${encodeURI(file)}" style="transition-delay:${index * 40}ms">
      <img src="assets/images/gallery/${encodeURI(file)}" alt="Galería SYNOVA ${index + 1}">
    </figure>`).join('');
}

function buildTestimonials() {
  testimonialsTrack.innerHTML = data.testimonials.map((file, index) => `
    <article class="testimonial-card reveal" style="transition-delay:${index * 35}ms">
      <img src="assets/images/testimonials/${encodeURI(file)}" alt="Testimonio SYNOVA ${index + 1}">
    </article>`).join('');
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
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
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .16 });
  items.forEach(item => io.observe(item));
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const image = document.getElementById('lightboxImage');
  const closeBtn = document.getElementById('lightboxClose');

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

function initTestimonialsSlider() {
  const prev = document.getElementById('testiPrev');
  const next = document.getElementById('testiNext');
  const amount = 340;
  prev.addEventListener('click', () => testimonialsTrack.scrollBy({ left: -amount, behavior: 'smooth' }));
  next.addEventListener('click', () => testimonialsTrack.scrollBy({ left: amount, behavior: 'smooth' }));
}

function initMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
}

buildCourses();
buildGallery();
buildTestimonials();
initCounters();
initReveal();
initLightbox();
initTestimonialsSlider();
initMenu();
