/* =========================================================
   Créditos SYNOVA · historial en el panel admin
   · GET /admin/creditos-historial (synova-webhook)
     → regalos/ventas hechos desde el admin + canjes de libros, herramientas y materiales
   · Todas las fechas (no solo desde que se agregó esta vista). Filtros por día en hora de México.
   · Marca en las tarjetas de Miembros a quién se le dieron créditos y qué canjeó.
   ========================================================= */
(function () {
  'use strict';
  if (typeof PAGES === 'undefined') return;

  var ZONA = 'America/Mexico_City';
  var TIPOS_RECOMPENSA = { book:'Libro', tool:'Herramienta', material:'Material' };

  var style = document.createElement('style');
  style.textContent = [
    '.chx-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px}',
    '.chx-range{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px;color:var(--text-3)}',
    '.chx-range input{padding:7px 10px;border:1px solid var(--border-2);border-radius:9px;background:var(--surface-2);color:var(--text);font-family:inherit;font-size:12.5px}',
    '.chx-day{margin-top:18px}',
    '.chx-day__head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;padding:0 4px 8px;border-bottom:1px solid var(--border-2)}',
    '.chx-day__title{font-weight:800;font-size:14px;color:var(--text)}',
    '.chx-day__title small{font-weight:600;color:var(--text-3);margin-left:6px;font-size:12px}',
    '.chx-day__sum{font-size:11.5px;color:var(--text-3);display:flex;gap:10px;flex-wrap:wrap}',
    '.chx-row{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:11px 6px;border-bottom:1px solid var(--border)}',
    '.chx-row:last-child{border-bottom:none}',
    '.chx-ico{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;background:color-mix(in srgb,var(--c) 14%,transparent);color:var(--c)}',
    '.chx-main{min-width:0}',
    '.chx-name{font-weight:700;font-size:13.5px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}',
    '.chx-name:hover{color:var(--primary)}',
    '.chx-sub{font-size:11.5px;color:var(--text-3);margin-top:2px;line-height:1.45;overflow-wrap:anywhere}',
    '.chx-amt{text-align:right;font-family:"JetBrains Mono",monospace;font-weight:800;font-size:14px;white-space:nowrap}',
    '.chx-amt small{display:block;font-family:inherit;font-weight:600;font-size:10.5px;color:var(--text-3);margin-top:2px}',
    '.chx-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:10.5px;font-weight:700;color:var(--c);background:color-mix(in srgb,var(--c) 11%,transparent);border:1px solid color-mix(in srgb,var(--c) 26%,transparent);margin:2px 4px 2px 0}',
    '.chx-tbl{width:100%;border-collapse:collapse;font-size:12.5px}',
    '.chx-tbl th{text-align:left;font-size:10px;letter-spacing:.6px;text-transform:uppercase;color:var(--text-3);padding:10px 8px;border-bottom:1px solid var(--border-2);white-space:nowrap}',
    '.chx-tbl td{padding:10px 8px;border-bottom:1px solid var(--border);vertical-align:top;color:var(--text-2)}',
    '.chx-tbl tr:hover td{background:var(--surface-2)}',
    '.chx-box{background:var(--surface);border:1px solid var(--border-2);border-radius:16px;padding:6px 14px 10px;margin-top:6px}',
    '.chx-mini{margin-top:14px;border-top:1px solid var(--border);padding-top:12px}',
    '.chx-mini__title{font-size:10px;color:var(--text-3);font-weight:800;letter-spacing:.6px;text-transform:uppercase;margin-bottom:6px}',
    '.chx-mini .chx-row{padding:8px 2px;grid-template-columns:auto 1fr auto}',
    '.chx-mini .chx-ico{width:28px;height:28px;font-size:13px}',
    '@media(max-width:640px){.chx-row{grid-template-columns:auto 1fr}.chx-amt{grid-column:2;text-align:left}.chx-amt small{display:inline;margin-left:6px}}'
  ].join('');
  document.head.appendChild(style);

  function safe(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]; }); }
  function num(n) { return Number(n || 0).toLocaleString('es-MX'); }
  function money(n) { return '$' + Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 }); }
  function dayKey(d) { return d.toLocaleDateString('en-CA', { timeZone: ZONA }); }
  function shiftKey(key, days) { var p = key.split('-').map(Number); var d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + days, 12)); return d.toISOString().slice(0, 10); }
  function hora(d) { return d.toLocaleTimeString('es-MX', { hour:'numeric', minute:'2-digit', hour12:true, timeZone: ZONA }); }
  function fechaLarga(key) { var p = key.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)).toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }); }
  function etiquetaDia(key) {
    var hoy = dayKey(new Date());
    if (key === hoy) return 'Hoy';
    if (key === shiftKey(hoy, -1)) return 'Ayer';
    if (key === shiftKey(hoy, -2)) return 'Antier';
    var t = fechaLarga(key); return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function nombreDe(m) { return m.nombre || (m.email ? m.email.split('@')[0] : '') || 'Miembro sin nombre'; }
  function meta(m) {
    if (m.tipo === 'regalo') return { ico:'🎁', c:'var(--success)', label:'Regalo', signo:'+' };
    if (m.tipo === 'venta') return { ico:'💵', c:'var(--info)', label:'Venta', signo:'+' };
    return { ico:'🛒', c:'var(--warning)', label:'Canje', signo:'−' };
  }

  /* ── Datos (una sola carga, compartida por la sección, Miembros y el modal) ── */
  var CH = { data: null, loading: null, error: null };
  CH.load = function (force) {
    if (CH.data && !force) return Promise.resolve(CH.data);
    if (CH.loading && !force) return CH.loading;
    CH.loading = (async function () {
      var token = await window.__tokenAdmin();
      var r = await fetch(window.__WEBHOOK_URL + '/admin/creditos-historial', { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status));
      var movs = (Array.isArray(d.movements) ? d.movements : []).map(function (m) {
        var f = m.fecha ? new Date(m.fecha) : null;
        return Object.assign({}, m, { _date: f && !isNaN(f) ? f : null, _day: f && !isNaN(f) ? dayKey(f) : 'sin-fecha' });
      });
      var byUid = {};
      movs.forEach(function (m) {
        var u = byUid[m.uid] || (byUid[m.uid] = { uid: m.uid, nombre: m.nombre, email: m.email, recibido: 0, veces: 0, canjeado: 0, canjes: [], regalos: [], ultima: null });
        if (!u.nombre && m.nombre) u.nombre = m.nombre;
        if (!u.email && m.email) u.email = m.email;
        if (m.tipo === 'canje') { u.canjeado += m.amount; u.canjes.push(m); }
        else { u.recibido += m.amount; u.veces += 1; u.regalos.push(m); }
        if (m._date && (!u.ultima || m._date > u.ultima)) u.ultima = m._date;
      });
      CH.data = { movs: movs, byUid: byUid, saldos: d.saldos || {} };
      CH.error = null;
      return CH.data;
    })();
    CH.loading.catch(function (e) { CH.error = e; }).finally(function () { CH.loading = null; });
    return CH.loading;
  };
  CH.invalidate = function () { CH.data = null; };

  /* ── Filtros ── */
  var S = { periodo: 'todo', tipo: 'todos', search: '', desde: '', hasta: '', vista: 'dia' };
  function rango() {
    var hoy = dayKey(new Date());
    switch (S.periodo) {
      case 'hoy': return [hoy, hoy];
      case 'ayer': return [shiftKey(hoy, -1), shiftKey(hoy, -1)];
      case 'antier': return [shiftKey(hoy, -2), shiftKey(hoy, -2)];
      case '7': return [shiftKey(hoy, -6), hoy];
      case '30': return [shiftKey(hoy, -29), hoy];
      case 'rango': return [S.desde || '0000-00-00', S.hasta || '9999-99-99'];
      default: return null;
    }
  }
  function filtrar(movs) {
    var r = rango();
    return movs.filter(function (m) {
      if (S.tipo === 'regalos' && m.tipo !== 'regalo') return false;
      if (S.tipo === 'ventas' && m.tipo !== 'venta') return false;
      if (S.tipo === 'canjes' && m.tipo !== 'canje') return false;
      if (S.tipo === 'otorgados' && m.tipo === 'canje') return false;
      if (r && (m._day === 'sin-fecha' || m._day < r[0] || m._day > r[1])) return false;
      if (S.search) {
        var txt = (m.nombre + ' ' + m.email + ' ' + m.uid + ' ' + (m.rewardTitle || '') + ' ' + (m.nota || '') + ' ' + (m.adminEmail || '')).toLowerCase();
        if (txt.indexOf(S.search) === -1) return false;
      }
      return true;
    });
  }

  /* ── Render de filas ── */
  function filaMov(m, compacta) {
    var x = meta(m);
    var detalle;
    if (m.tipo === 'canje') detalle = 'Canjeó <b style="color:var(--text-2)">' + safe(m.rewardTitle) + '</b>' + (TIPOS_RECOMPENSA[m.rewardType] ? ' · ' + TIPOS_RECOMPENSA[m.rewardType] : '');
    else detalle = (m.tipo === 'venta' ? 'Venta registrada' + (m.precio ? ' por <b style="color:var(--text-2)">' + money(m.precio) + ' MXN</b>' : '') : 'Regalo de créditos') + (m.nota ? ' · “' + safe(m.nota) + '”' : '') + (m.adminEmail ? ' · por ' + safe(m.adminEmail) : '');
    var cuando = m._date ? (compacta ? etiquetaDia(m._day) + ' · ' : '') + hora(m._date) : 'Sin fecha';
    var quien = compacta ? '' : '<div class="chx-name" data-chx-uid="' + safe(m.uid) + '" title="Ver todo lo de este miembro">' + safe(nombreDe(m)) + '</div>';
    return '<div class="chx-row"><div class="chx-ico" style="--c:' + x.c + '">' + x.ico + '</div><div class="chx-main">' + quien +
      '<div class="chx-sub">' + (compacta ? '' : safe(m.email || m.uid) + ' · ') + detalle + '</div></div>' +
      '<div class="chx-amt" style="color:' + x.c + '">' + x.signo + num(m.amount) + ' cr<small>' + x.label + ' · ' + cuando + '</small></div></div>';
  }

  function vistaPorDia(lista) {
    var dias = [], grupos = {};
    lista.forEach(function (m) { if (!grupos[m._day]) { grupos[m._day] = []; dias.push(m._day); } grupos[m._day].push(m); });
    return dias.map(function (k) {
      var g = grupos[k];
      var dados = g.filter(function (m) { return m.tipo !== 'canje'; }).reduce(function (s, m) { return s + m.amount; }, 0);
      var usados = g.filter(function (m) { return m.tipo === 'canje'; }).reduce(function (s, m) { return s + m.amount; }, 0);
      var titulo = k === 'sin-fecha' ? 'Sin fecha registrada' : etiquetaDia(k) + (['Hoy', 'Ayer', 'Antier'].indexOf(etiquetaDia(k)) >= 0 ? '<small>' + safe(fechaLarga(k)) + '</small>' : '');
      return '<div class="chx-day"><div class="chx-day__head"><div class="chx-day__title">' + titulo + '</div><div class="chx-day__sum"><span>' + g.length + ' movimiento' + (g.length === 1 ? '' : 's') + '</span>' +
        (dados ? '<span style="color:var(--success)">+' + num(dados) + ' cr otorgados</span>' : '') + (usados ? '<span style="color:var(--warning)">−' + num(usados) + ' cr canjeados</span>' : '') + '</div></div>' +
        '<div class="chx-box">' + g.map(function (m) { return filaMov(m, false); }).join('') + '</div></div>';
    }).join('');
  }

  function vistaPorMiembro(lista, saldos) {
    var por = {};
    lista.forEach(function (m) {
      var u = por[m.uid] || (por[m.uid] = { uid: m.uid, nombre: m.nombre, email: m.email, recibido: 0, veces: 0, canjeado: 0, canjes: [], ultima: null });
      if (m.tipo === 'canje') { u.canjeado += m.amount; u.canjes.push(m); } else { u.recibido += m.amount; u.veces += 1; }
      if (m._date && (!u.ultima || m._date > u.ultima)) u.ultima = m._date;
    });
    var filas = Object.keys(por).map(function (k) { return por[k]; }).sort(function (a, b) { return (b.ultima || 0) - (a.ultima || 0); });
    return '<div class="chx-box" style="overflow:auto;padding:0"><table class="chx-tbl"><thead><tr><th>Miembro</th><th>Créditos dados</th><th>Canjeado</th><th>Qué canjeó</th><th>Saldo hoy</th><th>Último movimiento</th></tr></thead><tbody>' +
      filas.map(function (u) {
        var s = saldos[u.uid];
        return '<tr><td><div class="chx-name" data-chx-uid="' + safe(u.uid) + '">' + safe(nombreDe(u)) + '</div><div class="chx-sub">' + safe(u.email || u.uid) + '</div></td>' +
          '<td style="color:var(--success);font-weight:800;white-space:nowrap">' + (u.recibido ? '+' + num(u.recibido) + ' cr<div class="chx-sub">' + u.veces + ' vez' + (u.veces === 1 ? '' : 'es') + '</div>' : '—') + '</td>' +
          '<td style="color:var(--warning);font-weight:800;white-space:nowrap">' + (u.canjeado ? '−' + num(u.canjeado) + ' cr' : '—') + '</td>' +
          '<td>' + (u.canjes.length ? u.canjes.map(function (c) { return '<span class="chx-chip" style="--c:var(--warning)" title="' + safe(c._date ? c._date.toLocaleString('es-MX', { timeZone: ZONA }) : '') + '">' + safe(c.rewardTitle) + '</span>'; }).join('') : '<span class="chx-sub">Aún no canjea</span>') + '</td>' +
          '<td style="font-family:\'JetBrains Mono\',monospace;font-weight:800;white-space:nowrap">' + (s ? num(s.balance) + ' cr' : '—') + '</td>' +
          '<td class="chx-sub" style="white-space:nowrap">' + (u.ultima ? safe(etiquetaDia(dayKey(u.ultima))) + ' · ' + hora(u.ultima) : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function descargarCSV(lista) {
    var cols = ['Fecha', 'Hora', 'Tipo', 'Miembro', 'Email', 'UID', 'Créditos', 'Precio MXN', 'Recompensa', 'Nota', 'Otorgado por'];
    var rows = lista.map(function (m) {
      return [m._date ? m._day : '', m._date ? hora(m._date) : '', meta(m).label, nombreDe(m), m.email, m.uid, (m.tipo === 'canje' ? -1 : 1) * m.amount, m.precio || '', m.rewardTitle || '', m.nota || '', m.adminEmail || ''];
    });
    var csv = [cols].concat(rows).map(function (r) { return r.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'historial-creditos-' + dayKey(new Date()) + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ── Sección: Créditos ── */
  PAGES.creditos = function () {
    var page = document.getElementById('page');
    page.innerHTML = '<div class="fade-up">' +
      '<div class="sec-hero"><span class="sec-hero__eyebrow">Comunidad</span><h1 class="sec-hero__title">Historial de créditos</h1>' +
      '<p class="sec-hero__sub">A quién se le dieron créditos desde el admin (regalo o venta) y en qué los canjearon. Incluye todo lo anterior, no solo lo nuevo.</p>' +
      '<div class="sec-hero__actions"><button class="btn btn-outline btn-sm" id="chx-refresh" type="button">Actualizar</button><button class="btn btn-outline btn-sm" id="chx-csv" type="button"><svg class="ic"><use href="#i-download"/></svg>Descargar vista (CSV)</button></div></div>' +
      '<div class="kpi-grid" id="chx-kpis"></div>' +
      '<div class="curso-toolbar"><div class="curso-search-wrap"><svg class="curso-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
      '<input type="text" id="chx-search" class="curso-search__input" placeholder="Buscar por nombre, email, libro, herramienta o nota…" value="' + safe(S.search) + '"></div></div>' +
      '<div class="curso-pills chx-filters">' + [['todo', 'Todo el historial'], ['hoy', 'Hoy'], ['ayer', 'Ayer'], ['antier', 'Antier'], ['7', 'Últimos 7 días'], ['30', 'Últimos 30 días'], ['rango', 'Elegir fechas']].map(function (p) {
        return '<button class="curso-pill" data-chx-periodo="' + p[0] + '"' + (S.periodo === p[0] ? ' data-active="1"' : '') + '>' + p[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="chx-range" id="chx-range" style="display:' + (S.periodo === 'rango' ? 'flex' : 'none') + ';margin-bottom:10px">Del <input type="date" id="chx-desde" value="' + safe(S.desde) + '"> al <input type="date" id="chx-hasta" value="' + safe(S.hasta) + '"></div>' +
      '<div class="curso-pills chx-filters">' + [['todos', 'Todos los movimientos'], ['otorgados', 'Créditos dados'], ['regalos', 'Solo regalos'], ['ventas', 'Solo ventas'], ['canjes', 'Canjes']].map(function (p) {
        return '<button class="curso-pill" data-chx-tipo="' + p[0] + '"' + (S.tipo === p[0] ? ' data-active="1"' : '') + '>' + p[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="curso-pills chx-filters">' + [['dia', 'Por día'], ['miembro', 'Por miembro']].map(function (p) {
        return '<button class="curso-pill" data-chx-vista="' + p[0] + '"' + (S.vista === p[0] ? ' data-active="1"' : '') + '>' + p[1] + '</button>';
      }).join('') + '</div>' +
      '<div id="chx-list"><div class="empty">Cargando historial…</div></div></div>';

    function activar(attr, val) { page.querySelectorAll('[' + attr + ']').forEach(function (b) { if (b.getAttribute(attr) === val) b.setAttribute('data-active', '1'); else b.removeAttribute('data-active'); }); }
    page.querySelectorAll('[data-chx-periodo]').forEach(function (b) { b.addEventListener('click', function () { S.periodo = b.getAttribute('data-chx-periodo'); activar('data-chx-periodo', S.periodo); page.querySelector('#chx-range').style.display = S.periodo === 'rango' ? 'flex' : 'none'; pintar(); }); });
    page.querySelectorAll('[data-chx-tipo]').forEach(function (b) { b.addEventListener('click', function () { S.tipo = b.getAttribute('data-chx-tipo'); activar('data-chx-tipo', S.tipo); pintar(); }); });
    page.querySelectorAll('[data-chx-vista]').forEach(function (b) { b.addEventListener('click', function () { S.vista = b.getAttribute('data-chx-vista'); activar('data-chx-vista', S.vista); pintar(); }); });
    page.querySelector('#chx-desde').addEventListener('change', function (e) { S.desde = e.target.value; pintar(); });
    page.querySelector('#chx-hasta').addEventListener('change', function (e) { S.hasta = e.target.value; pintar(); });
    page.querySelector('#chx-search').addEventListener('input', function (e) { S.search = e.target.value.toLowerCase().trim(); pintar(); });
    page.querySelector('#chx-refresh').addEventListener('click', function () { cargar(true); });
    page.querySelector('#chx-csv').addEventListener('click', function () { if (CH.data) descargarCSV(filtrar(CH.data.movs)); });
    page.addEventListener('click', function (e) {
      var n = e.target.closest('[data-chx-uid]'); if (!n) return;
      var u = CH.data && CH.data.byUid[n.getAttribute('data-chx-uid')];
      S.search = String((u && (u.email || u.nombre)) || n.getAttribute('data-chx-uid')).toLowerCase();
      page.querySelector('#chx-search').value = S.search; S.periodo = 'todo'; activar('data-chx-periodo', 'todo'); page.querySelector('#chx-range').style.display = 'none'; pintar();
    });

    function pintar() {
      if (page.dataset.live !== 'creditos' || !CH.data) return;
      var lista = filtrar(CH.data.movs);
      var dados = lista.filter(function (m) { return m.tipo !== 'canje'; });
      var canjes = lista.filter(function (m) { return m.tipo === 'canje'; });
      var ventas = lista.filter(function (m) { return m.tipo === 'venta'; });
      var sum = function (a, k) { return a.reduce(function (s, m) { return s + Number(m[k] || 0); }, 0); };
      var personasDadas = new Set(dados.map(function (m) { return m.uid; })).size;
      var personasCanje = new Set(canjes.map(function (m) { return m.uid; })).size;
      document.getElementById('chx-kpis').innerHTML =
        '<div class="kpi-card" style="--c1:var(--success);--c2:#34D399"><div class="kpi-card__label">Créditos dados</div><div class="kpi-card__value">' + num(sum(dados, 'amount')) + '</div><div class="kpi-card__sub">a ' + personasDadas + ' persona' + (personasDadas === 1 ? '' : 's') + ' · ' + dados.length + ' movimiento' + (dados.length === 1 ? '' : 's') + '</div></div>' +
        '<div class="kpi-card" style="--c1:var(--info);--c2:#60A5FA"><div class="kpi-card__label">Ventas de créditos</div><div class="kpi-card__value" style="font-size:25px">' + money(sum(ventas, 'precio')) + '</div><div class="kpi-card__sub">' + ventas.length + ' venta' + (ventas.length === 1 ? '' : 's') + ' · ' + num(sum(ventas, 'amount')) + ' cr</div></div>' +
        '<div class="kpi-card" style="--c1:var(--warning);--c2:#FBBF24"><div class="kpi-card__label">Canjes</div><div class="kpi-card__value">' + canjes.length + '</div><div class="kpi-card__sub">' + num(sum(canjes, 'amount')) + ' cr usados · ' + personasCanje + ' persona' + (personasCanje === 1 ? '' : 's') + '</div></div>';
      var cont = document.getElementById('chx-list');
      if (!lista.length) { cont.innerHTML = '<div class="empty"><b>Sin movimientos en esta vista</b><br><span style="color:var(--text-3);font-size:13px">Prueba con otro periodo o tipo.</span></div>'; return; }
      cont.innerHTML = '<div style="margin:8px 0 0;font-size:12px;color:var(--text-3)">' + lista.length + ' movimiento' + (lista.length === 1 ? '' : 's') + ' en esta vista</div>' +
        (S.vista === 'miembro' ? vistaPorMiembro(lista, CH.data.saldos) : vistaPorDia(lista));
    }
    function cargar(force) {
      var cont = document.getElementById('chx-list');
      if (force && cont) cont.innerHTML = '<div class="empty">Actualizando historial…</div>';
      CH.load(force).then(function () { pintar(); refrescarMiembros(); }).catch(function (e) {
        var c = document.getElementById('chx-list');
        if (c && page.dataset.live === 'creditos') c.innerHTML = '<div class="empty"><b>No pudimos cargar el historial</b><br>' + safe(e.message) + '</div>';
      });
    }
    cargar(false);
  };

  /* ── Marca en las tarjetas de Miembros ── */
  function refrescarMiembros() {
    var page = document.getElementById('page');
    if (page && page.dataset.live === 'miembros' && typeof PAGES._refrescar_miembros === 'function') PAGES._refrescar_miembros();
  }
  if (typeof PAGES._detallesMiembro === 'function') {
    var detallesOriginal = PAGES._detallesMiembro;
    PAGES._detallesMiembro = function (m) {
      var base = detallesOriginal(m);
      var u = CH.data && CH.data.byUid[m.uid || m.id];
      if (!u) return base;
      var chips = [];
      if (u.recibido) chips.push('<span class="chx-chip" style="--c:var(--success)" title="' + safe(u.regalos.map(function (g) { return (g._date ? g._date.toLocaleString('es-MX', { timeZone: ZONA }) : 'Sin fecha') + ' · +' + g.amount + ' (' + g.tipo + ')'; }).join('\n')) + '">🎁 Ya le dimos ' + num(u.recibido) + ' cr' + (u.veces > 1 ? ' · ' + u.veces + ' veces' : '') + '</span>');
      if (u.canjes.length) chips.push('<span class="chx-chip" style="--c:var(--warning)" title="' + safe(u.canjes.map(function (c) { return c.rewardTitle; }).join(', ')) + '">🛒 Canjeó ' + u.canjes.length + ': ' + safe(u.canjes.slice(0, 2).map(function (c) { return c.rewardTitle; }).join(', ')) + (u.canjes.length > 2 ? '…' : '') + '</span>');
      return base + (chips.length ? '<span style="display:flex;flex-wrap:wrap;gap:0;margin-top:3px">' + chips.join('') + '</span>' : '');
    };
  }
  if (typeof PAGES.miembros === 'function') {
    var miembrosOriginal = PAGES.miembros;
    PAGES.miembros = function () {
      var r = miembrosOriginal.apply(this, arguments);
      CH.load(false).then(refrescarMiembros).catch(function (e) { console.warn('[Historial créditos]', e.message); });
      return r;
    };
  }

  /* ── Historial del miembro dentro del modal "Créditos SYNOVA" ── */
  function renderMiembro(el, uid) {
    if (!el) return;
    el.innerHTML = '<div class="chx-mini"><div class="chx-mini__title">Historial de este miembro</div><div class="chx-sub">Cargando…</div></div>';
    CH.load(false).then(function (d) {
      var movs = d.movs.filter(function (m) { return m.uid === uid; });
      el.innerHTML = '<div class="chx-mini"><div class="chx-mini__title">Historial de este miembro · ' + movs.length + ' movimiento' + (movs.length === 1 ? '' : 's') + '</div>' +
        (movs.length ? '<div style="max-height:220px;overflow:auto">' + movs.map(function (m) { return filaMov(m, true); }).join('') + '</div>' : '<div class="chx-sub">Todavía no le hemos dado créditos ni ha canjeado nada.</div>') + '</div>';
    }).catch(function (e) { el.innerHTML = '<div class="chx-mini"><div class="chx-sub">No se pudo cargar el historial: ' + safe(e.message) + '</div></div>'; });
  }

  window.SynovaCreditHistory = { load: CH.load, invalidate: CH.invalidate, renderMemberInto: renderMiembro };

})();
