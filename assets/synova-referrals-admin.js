(function () {
  'use strict';
  if (typeof PAGES === 'undefined') return;

  var style = document.createElement('style');
  style.textContent = '.panel{background:var(--surface);border:1px solid var(--border-2);border-radius:16px;overflow:hidden}.panel__header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid var(--border-2)}.panel__title{font-weight:800;font-size:16px;color:var(--text)}.panel__sub{font-size:12px;color:var(--text-3);margin-top:3px}.table{width:100%;border-collapse:collapse;min-width:720px}.table th,.table td{padding:12px 14px;text-align:left;border-bottom:1px solid var(--border);font-size:12px;color:var(--text-2)}.table th{font-size:10px;letter-spacing:.6px;text-transform:uppercase;color:var(--text-3);background:var(--surface-2)}.table tr:last-child td{border-bottom:0}.tag--warning{background:color-mix(in srgb,var(--warning) 14%,transparent);color:var(--warning)}';
  document.head.appendChild(style);

  function safe(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c];
    });
  }
  function money(value) { return '$' + Number(value || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 }); }
  function statusLabel(status) {
    if (status === 'applied') return '<span class="tag tag--success">APLICADO</span>';
    return '<span class="tag tag--warning">PENDIENTE</span>';
  }

  async function loadData() {
    var token = await window.__tokenAdmin();
    var response = await fetch(window.__WEBHOOK_URL + '/admin/referrals', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || ('HTTP ' + response.status));
    return data;
  }

  PAGES.referidos = async function () {
    var page = document.getElementById('page');
    page.innerHTML = '<div class="fade-up"><div class="sec-hero"><span class="sec-hero__eyebrow">Programa de crecimiento</span><h1 class="sec-hero__title">Referidos</h1><p class="sec-hero__sub">Audita compras atribuidas, avances y créditos aplicados por Stripe.</p></div><div class="empty">Cargando referidos…</div></div>';
    try {
      var data = await loadData();
      var totals = data.totals || {};
      var rows = Array.isArray(data.stats) ? data.stats : [];
      var rewards = Array.isArray(data.rewards) ? data.rewards : [];
      var pending = rewards.filter(function (r) { return r.status !== 'applied'; }).length;
      page.innerHTML = `
        <div class="fade-up">
          <div class="sec-hero"><span class="sec-hero__eyebrow">Programa de crecimiento</span><h1 class="sec-hero__title">Referidos</h1><p class="sec-hero__sub">Solo cuentan personas únicas después de que Stripe confirma su primera compra pagada.</p></div>
          <div class="kpi-grid">
            <div class="kpi-card" style="--c1:var(--primary)"><div class="kpi-card__label">Participantes</div><div class="kpi-card__value">${Number(totals.participants || 0)}</div></div>
            <div class="kpi-card" style="--c1:var(--success)"><div class="kpi-card__label">Compras referidas</div><div class="kpi-card__value">${Number(totals.qualifiedPurchases || 0)}</div></div>
            <div class="kpi-card" style="--c1:var(--info)"><div class="kpi-card__label">Premios aplicados</div><div class="kpi-card__value">${Number(totals.rewardsApplied || 0)}</div></div>
            <div class="kpi-card" style="--c1:var(--warning)"><div class="kpi-card__label">Crédito total</div><div class="kpi-card__value" style="font-size:25px">${money(totals.totalCredit)}</div><div class="kpi-card__sub">${pending} pendiente(s)</div></div>
          </div>
          <section class="panel" style="margin-top:18px">
            <div class="panel__header"><div><div class="panel__title">Avance por miembro</div><div class="panel__sub">Cada bloque de 3 compras genera una recompensa.</div></div><button class="btn btn-outline btn-sm" id="ref-admin-refresh">Actualizar</button></div>
            <div style="overflow:auto"><table class="table"><thead><tr><th>Miembro</th><th>Código</th><th>Compras</th><th>Avance</th><th>Premios</th><th>Crédito</th></tr></thead><tbody>
              ${rows.length ? rows.map(function (r) { return '<tr><td><b>'+safe(r.name || 'Miembro')+'</b><br><span style="color:var(--text-3);font-size:11px">'+safe(r.email)+'</span></td><td><code>'+safe(r.code)+'</code></td><td>'+Number(r.qualifiedPurchases || 0)+'</td><td>'+Number(r.qualifiedPurchases || 0)%3+' / 3</td><td>'+Number(r.rewardsApplied || 0)+' / '+Number(r.rewardsEarned || 0)+'</td><td>'+money(r.totalCredit)+'</td></tr>'; }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text-3);padding:28px">Todavía no hay participantes.</td></tr>'}
            </tbody></table></div>
          </section>
          <section class="panel" style="margin-top:18px">
            <div class="panel__header"><div><div class="panel__title">Recompensas</div><div class="panel__sub">Un estado pendiente indica que falta un cliente Stripe válido o que se reintentará.</div></div></div>
            <div style="overflow:auto"><table class="table"><thead><tr><th>ID</th><th>Miembro</th><th>Importe</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>
              ${rewards.length ? rewards.map(function (r) { return '<tr><td><code>'+safe(r.id)+'</code></td><td><code>'+safe(r.referrerUid).slice(0,12)+'…</code></td><td>'+money(r.amount)+'</td><td>'+statusLabel(r.status)+'</td><td style="max-width:320px;color:var(--text-3);font-size:11px">'+safe(r.lastError || '—')+'</td></tr>'; }).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-3);padding:28px">Aún no se han generado recompensas.</td></tr>'}
            </tbody></table></div>
          </section>
        </div>`;
      document.getElementById('ref-admin-refresh').addEventListener('click', function () { PAGES.referidos(); });
    } catch (err) {
      page.innerHTML = '<div class="fade-up"><div class="sec-hero"><h1 class="sec-hero__title">Referidos</h1></div><div class="empty"><b>No pudimos cargar los referidos</b><br>'+safe(err.message)+'</div></div>';
    }
  };
})();
