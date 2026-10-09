(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const title = String(params.get('programa') || '').trim().slice(0, 160);
  const courseId = String(params.get('curso') || '').trim().slice(0, 80);
  if (!title || params.get('origen') !== 'guia-synova') return;
  try { localStorage.setItem('synova:intended-course', JSON.stringify({ title, courseId, at:Date.now() })); } catch (_) {}
  const pane = document.getElementById('pane-register');
  if (!pane) return;
  const card = document.createElement('aside');
  card.setAttribute('aria-label', 'Curso recomendado por la guía SYNOVA');
  card.style.cssText = 'margin:0 0 16px;padding:13px 14px;border:1px solid rgba(47,209,198,.38);border-radius:14px;background:linear-gradient(135deg,rgba(47,209,198,.1),rgba(28,111,176,.08));color:inherit';
  const eyebrow = document.createElement('span');
  eyebrow.textContent = 'TU RECOMENDACIÓN SYNOVA';
  eyebrow.style.cssText = 'display:block;margin-bottom:5px;color:#2FD1C6;font:800 9px/1.2 Inter,sans-serif;letter-spacing:.12em';
  const name = document.createElement('strong');
  name.textContent = title;
  name.style.cssText = 'display:block;font:700 12px/1.4 Inter,sans-serif';
  const detail = document.createElement('small');
  detail.textContent = 'Crea tu cuenta gratis para ver este curso dentro del panel y conservar tu ruta.';
  detail.style.cssText = 'display:block;margin-top:5px;opacity:.72;font:500 10px/1.45 Inter,sans-serif';
  card.append(eyebrow, name, detail);
  pane.insertBefore(card, pane.firstChild);
})();
