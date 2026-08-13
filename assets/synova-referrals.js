(function () {
  'use strict';

  var REF_KEY = 'synova_referral_code';
  var incoming = new URLSearchParams(location.search).get('ref');
  var validIncoming = !!(incoming && /^SYN-[A-F0-9]{10}$/i.test(incoming.trim()));
  if (validIncoming) {
    localStorage.setItem(REF_KEY, incoming.trim().toUpperCase());
  }

  function addStyles() {
    if (document.getElementById('syn-ref-styles')) return;
    var style = document.createElement('style');
    style.id = 'syn-ref-styles';
    style.textContent = `
      .ref-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);gap:18px}
      .ref-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:22px;box-shadow:var(--shadow-sm)}
      .ref-card h3{margin:0 0 6px;font-size:18px;color:var(--text)}
      .ref-muted{font-size:13px;line-height:1.6;color:var(--text-2)}
      .ref-link{display:flex;gap:8px;margin:18px 0 12px}.ref-link input{min-width:0;flex:1;border:1px solid var(--border-2);border-radius:11px;padding:11px 12px;background:var(--surface-2);color:var(--text);font-size:12px}
      .ref-code{font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:800;letter-spacing:1px;color:var(--primary);margin:16px 0 4px}
      .ref-progress{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:18px 0 10px}
      .ref-step{height:12px;border-radius:999px;background:var(--surface-3);border:1px solid var(--border)}
      .ref-step.is-done{background:linear-gradient(90deg,var(--primary),var(--accent));border-color:transparent}
      .ref-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}
      .ref-kpi{padding:14px;border-radius:14px;background:var(--surface-2);border:1px solid var(--border);text-align:center}.ref-kpi b{display:block;font-size:21px;color:var(--text)}.ref-kpi span{font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:var(--text-3)}
      .ref-list{display:grid;gap:8px;margin-top:14px}.ref-person{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2);font-size:12px}.ref-person strong{color:var(--text)}.ref-person span{color:var(--success);font-weight:700}
      .ref-rule{display:flex;gap:10px;align-items:flex-start;padding:11px 0;border-bottom:1px solid var(--border);font-size:12px;line-height:1.5;color:var(--text-2)}.ref-rule:last-child{border:0}.ref-rule b{color:var(--text)}
      .ref-invite-note{margin:12px 0;padding:11px 13px;border-radius:12px;background:#e8f7f4;border:1px solid #9adbcf;color:#14685d;font-size:12px;font-weight:700}
      @media(max-width:820px){.ref-grid{grid-template-columns:1fr}.ref-kpis{grid-template-columns:1fr 1fr}.ref-link{flex-wrap:wrap}.ref-link input{flex-basis:100%}}
    `;
    document.head.appendChild(style);
  }

  function showInviteNote() {
    if (!validIncoming || !document.getElementById('pane-register')) return;
    addStyles();
    var pane = document.getElementById('pane-register');
    if (pane.querySelector('.ref-invite-note')) return;
    var note = document.createElement('div');
    note.className = 'ref-invite-note';
    note.textContent = '✓ Invitación SYNOVA aplicada. Si activas un plan, ayudarás a quien te invitó a conseguir su recompensa.';
    pane.insertBefore(note, pane.firstChild);
  }

  if (document.getElementById('pane-register')) showInviteNote();

  if (typeof Sections === 'undefined') return;
  addStyles();

  async function referralFetch(path) {
    var user = window.__auth && window.__auth.currentUser;
    if (!user) throw new Error('Inicia sesión para consultar tus referidos.');
    var token = await user.getIdToken();
    var response = await fetch(window.__WEBHOOK_URL + path, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || ('HTTP ' + response.status));
    return data;
  }

  function money(value) {
    return '$' + Number(value || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 });
  }

  function safe(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c];
    });
  }

  Sections.referidos = async function () {
    var content = document.getElementById('content');
    content.innerHTML = secHero('Invita y gana', 'Referidos', 'Comparte tu enlace. Cada 3 personas diferentes que activen y paguen un plan te dan un crédito equivalente a una mensualidad.') +
      '<div class="ref-card"><div class="sub-loading"><div class="sub-loading__spin"></div><div>Cargando tu programa de referidos…</div></div></div>';
    try {
      var data = await referralFetch('/referrals/me');
      var done = Number(data.progress || 0);
      var recent = Array.isArray(data.recent) ? data.recent : [];
      content.innerHTML = secHero('Invita y gana', 'Referidos', 'Comparte tu enlace. Cada 3 personas diferentes que activen y paguen un plan te dan un crédito equivalente a una mensualidad.') + `
        <div class="ref-grid">
          <section class="ref-card">
            <h3>Tu enlace personal</h3>
            <div class="ref-muted">La invitación se guarda al abrir el enlace. Solo contará cuando Stripe confirme la primera compra pagada del referido.</div>
            <div class="ref-code">${safe(data.code)}</div>
            <div class="ref-link"><input id="ref-link-value" readonly value="${safe(data.link)}"><button class="btn btn--accent btn--sm" id="ref-copy">Copiar</button><button class="btn btn--wa btn--sm" id="ref-whatsapp">WhatsApp</button></div>
            <h3 style="margin-top:22px">Avance hacia tu siguiente recompensa</h3>
            <div class="ref-progress">${[0,1,2].map(function(i){return '<div class="ref-step '+(i<done?'is-done':'')+'"></div>';}).join('')}</div>
            <div class="ref-muted"><b style="color:var(--text)">${done} de 3</b> compras válidas en este bloque · ${Number(data.qualifiedPurchases || 0)} históricas.</div>
            <div class="ref-kpis">
              <div class="ref-kpi"><b>${Number(data.qualifiedPurchases || 0)}</b><span>Compras válidas</span></div>
              <div class="ref-kpi"><b>${Number(data.rewardsEarned || 0)}</b><span>Recompensas</span></div>
              <div class="ref-kpi"><b>${money(data.totalCredit)}</b><span>Crédito aplicado</span></div>
            </div>
            ${Number(data.pendingRewards || 0) ? '<div class="ref-invite-note">Tienes '+Number(data.pendingRewards)+' recompensa pendiente. Se aplicará automáticamente a tu cliente Stripe.</div>' : ''}
          </section>
          <aside class="ref-card">
            <h3>Cómo funciona</h3>
            <div class="ref-rule"><b>1</b><div>Comparte tu enlace personal con tus contactos.</div></div>
            <div class="ref-rule"><b>2</b><div>Cada persona debe registrarse desde ese enlace y <b>pagar</b> un plan mensual o anual.</div></div>
            <div class="ref-rule"><b>3</b><div>Al completar 3 compras únicas recibes crédito por el precio mensual vigente.</div></div>
            <div class="ref-rule"><b>4</b><div>En plan mensual reduce la próxima mensualidad; en plan anual reduce el próximo cobro anual por ese mismo importe.</div></div>
            <h3 style="margin-top:20px">Referidos confirmados</h3>
            <div class="ref-list">${recent.length ? recent.map(function(row){return '<div class="ref-person"><div><strong>'+safe(row.email)+'</strong><div class="ref-muted">Plan '+safe(row.plan || 'VIP')+'</div></div><span>Pagado</span></div>';}).join('') : '<div class="ref-muted">Aún no tienes compras referidas confirmadas.</div>'}</div>
          </aside>
        </div>`;
      document.getElementById('ref-copy').addEventListener('click', async function () {
        await navigator.clipboard.writeText(data.link);
        if (window.Toast) Toast.success('Enlace copiado', 'Ya puedes compartirlo.');
      });
      document.getElementById('ref-whatsapp').addEventListener('click', function () {
        var text = 'Te invito a SYNOVA VIP. Regístrate desde mi enlace: ' + data.link;
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
      });
    } catch (err) {
      content.innerHTML = secHero('Invita y gana', 'Referidos', 'Programa de recompensas SYNOVA.') + '<div class="ref-card"><h3>No pudimos cargar tus referidos</h3><div class="ref-muted">'+safe(err.message)+'</div></div>';
    }
  };
})();
