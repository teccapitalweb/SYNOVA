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
      .ref-compact{margin-top:28px;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:22px;box-shadow:var(--shadow-sm)}
      .ref-compact__head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:18px}.ref-compact__kicker{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:var(--primary);margin-bottom:6px}.ref-compact h3{margin:0;font-family:'Plus Jakarta Sans',sans-serif;font-size:19px;color:var(--text)}
      .ref-muted{font-size:12px;line-height:1.55;color:var(--text-2);margin-top:5px}
      .ref-code{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:800;letter-spacing:.7px;color:var(--primary);padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);white-space:nowrap}
      .ref-actions{display:flex;gap:8px;flex-wrap:wrap}.ref-actions .btn{min-width:104px}
      .ref-compact__bottom{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:18px;padding-top:17px;border-top:1px solid var(--border)}
      .ref-progress{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:18px 0 10px}
      .ref-step{height:12px;border-radius:999px;background:var(--surface-3);border:1px solid var(--border)}
      .ref-step.is-done{background:linear-gradient(90deg,var(--primary),var(--accent));border-color:transparent}
      .ref-invite-note{margin:12px 0;padding:11px 13px;border-radius:12px;background:#e8f7f4;border:1px solid #9adbcf;color:#14685d;font-size:12px;font-weight:700}
      .ref-credit-stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.ref-credit-stat{padding:9px 11px;border-radius:11px;background:var(--surface-2);border:1px solid var(--border);font-size:11px;color:var(--text-2)}.ref-credit-stat b{display:block;color:var(--text);font:800 15px 'Plus Jakarta Sans',sans-serif;margin-bottom:1px}
      [data-theme="dark"] .ref-invite-note{background:#123631;border-color:#285d55;color:#9ce1d5}
      @media(max-width:680px){.ref-compact__head,.ref-compact__bottom{display:grid;grid-template-columns:1fr}.ref-code{width:max-content;max-width:100%}.ref-actions .btn{flex:1}}
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

  function safe(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c];
    });
  }

  async function mountReferralCompact() {
    var content = document.getElementById('content');
    if (!content || content.querySelector('#ref-compact')) return;
    var mount = document.createElement('section');
    mount.className = 'ref-compact';
    mount.id = 'ref-compact';
    mount.innerHTML = '<div class="sub-loading" style="min-height:120px"><div class="sub-loading__spin"></div><div>Cargando invitaciones…</div></div>';
    content.appendChild(mount);
    try {
      var results = await Promise.all([referralFetch('/referrals/me'), referralFetch('/credits/me')]);
      var data = results[0], credits = results[1] || {};
      if (!document.getElementById('ref-compact')) return;
      mount.innerHTML = `
        <div class="ref-compact__head">
          <div><div class="ref-compact__kicker">Créditos SYNOVA</div><h3>Invita y amplía tu biblioteca</h3><div class="ref-muted">Recibe 50 créditos cuando un colega se registra y 250 más cuando activa su primera membresía VIP.</div></div>
          <div class="ref-code">${Number(credits.balance || 0)} créditos</div>
        </div>
        <div class="ref-compact__bottom">
          <div><div class="ref-code" style="font-size:12px">${safe(data.code)}</div><div class="ref-credit-stats"><span class="ref-credit-stat"><b>${Number(credits.referredRegistrations || 0)}</b>registros</span><span class="ref-credit-stat"><b>${Number(credits.referredVip || 0)}</b>nuevos VIP</span><span class="ref-credit-stat"><b>${Number(credits.lifetimeEarned || 0)}</b>créditos ganados</span></div></div>
          <div class="ref-actions"><button class="btn btn--ghost btn--sm" id="ref-copy">Copiar enlace</button><button class="btn btn--wa btn--sm" id="ref-whatsapp">WhatsApp</button></div>
        </div>
        <div class="ref-muted" style="margin-top:14px">Quien se registra con tu enlace también recibe 25 créditos; al volverse VIP obtiene 100 adicionales.</div>`;
      mount.querySelector('#ref-copy').addEventListener('click', async function () {
        await navigator.clipboard.writeText(data.link);
        if (window.Toast) Toast.success('Enlace copiado', 'Ya puedes compartirlo.');
      });
      mount.querySelector('#ref-whatsapp').addEventListener('click', function () {
        var text = 'Te invito a SYNOVA VIP. Regístrate desde mi enlace: ' + data.link;
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
      });
    } catch (err) {
      mount.innerHTML = '<div class="ref-compact__head" style="margin:0"><div><div class="ref-compact__kicker">Beneficios</div><h3>Invita y gana</h3><div class="ref-muted">Tus invitaciones no están disponibles en este momento.</div></div></div>';
    }
  }

  var renderSuscripcion = Sections.suscripcion;
  Sections.suscripcion = async function () {
    await Promise.resolve(renderSuscripcion());
    await mountReferralCompact();
  };
})();
