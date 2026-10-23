/* ═══════════════════ MARKETING · Encuestas, Métricas y Pruebas gratuitas ═══════════════════
   Portado tal cual del admin de Alintec Food (misma lógica, flujo, estructura y diseño),
   con la paleta de SYNOVA. Fuentes de datos:
   · Encuestas         → GET /api/admin/encuestas   (encuesta del landing, assets/synova-encuesta.js)
   · Métricas          → GET /api/admin/metricas y /api/admin/visitas (contador assets/synova-visitas.js)
   · Pruebas gratuitas → miembros (Firestore) + GET /api/admin/pruebas (curso de bienvenida elegido)
   ═════════════════════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
const AdminEsc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

const Pages = {
  _webhookUrl: window.__WEBHOOK_URL || 'https://synova-webhook-production.up.railway.app',
  _mbToDate(v){ return typeof window.toDate === 'function' ? window.toDate(v) : (v ? (v.toDate ? v.toDate() : new Date(v)) : null); },
  async _getAuthToken(){
    for (let i = 0; i < 60 && !(window.__auth && window.__auth.currentUser); i++) await new Promise(r => setTimeout(r, 250));
    return window.__tokenAdmin ? window.__tokenAdmin() : null;
  },
  async _api(ruta, init = {}){
    const token = await Pages._getAuthToken();
    const headers = { 'Authorization': 'Bearer ' + token, ...(init.headers || {}) };
    if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const r = await fetch(Pages._webhookUrl + ruta, { ...init, headers, cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
    return j;
  },
  _encuestasLanding(p){
    p.innerHTML = `
      <div class="fade-up">
        <div class="sec-hero">
          <span class="sec-hero__eyebrow">Marketing</span>
          <h1 class="sec-hero__title">Encuestas</h1>
          <p class="sec-hero__sub">Resultados de la encuesta del landing de SYNOVA · quién visita, qué busca, qué urgencia tiene y quién pidió que lo contacten.</p>
        </div>
        <div class="kpi-grid">
          <div class="kpi-card" style="--c1:#1C6FB0;--c2:#5FB6E0;">
            <div class="kpi-card__label">Respuestas totales</div>
            <div class="kpi-card__value" id="enc-kpi-total">—</div>
            <div class="kpi-card__sub">Incluye completas e incompletas</div>
          </div>
          <div class="kpi-card" style="--c1:#14B8A6;--c2:#5EEAD4;">
            <div class="kpi-card__label">Completaron la encuesta</div>
            <div class="kpi-card__value" id="enc-kpi-completas">—</div>
            <div class="kpi-card__sub" id="enc-kpi-completas-sub">—</div>
          </div>
          <div class="kpi-card" style="--c1:#F7941D;--c2:#FBBF24;">
            <div class="kpi-card__label">Leads calientes</div>
            <div class="kpi-card__value" id="enc-kpi-calientes">—</div>
            <div class="kpi-card__sub">Quieren empezar lo antes posible</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Perfil de quién responde</h3>
            <canvas id="enc-chart-perfil" height="220"></canvas>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Cómo nos conoció</h3>
            <canvas id="enc-chart-origen" height="220"></canvas>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Urgencia declarada</h3>
            <canvas id="enc-chart-urgencia" height="220"></canvas>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Qué los detiene hoy</h3>
            <canvas id="enc-chart-freno" height="220"></canvas>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Qué quieren lograr este año</h3>
            <canvas id="enc-chart-meta" height="200"></canvas>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Área donde trabajan</h3>
            <canvas id="enc-chart-giro" height="200"></canvas>
          </div>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-top:16px;">
          <h3 style="margin:0 0 4px;font-size:14px;color:var(--text);">Dónde se quedan los que no terminan</h3>
          <p style="margin:0 0 12px;font-size:12px;color:var(--text-3);">Última pregunta que alcanzaron a contestar antes de irse. Solo cuenta a quienes contestaron al menos una; quien no contestó ninguna no deja registro.</p>
          <canvas id="enc-chart-abandono" height="170"></canvas>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-top:16px;">
          <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Tema de interés · para saber qué más ofrecer</h3>
          <canvas id="enc-chart-interes" height="160"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Lugar de trabajo · solo profesionales en activo</h3>
            <canvas id="enc-chart-tamano" height="200"></canvas>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Experiencia con cursos online</h3>
            <canvas id="enc-chart-experiencia" height="200"></canvas>
          </div>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-top:16px;">
          <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Personas que pidieron que las contacten</h3>
          <div id="enc-leads" style="color:var(--text-2);font-size:13px;">Cargando…</div>
        </div>
      </div>
    `;
    if (!Pages._encSinCarga) Pages._cargarEncuestas();
  },

  // Al abrir el panel se restaura la última sección ANTES de que Firebase confirme la sesión de
  // administrador; leer Firestore en ese momento da permission-denied. Se espera al evento 'adminready'.
  _esperarAdmin(){
    if (window.__currentAdmin) return Promise.resolve();
    return new Promise(resolver => {
      window.addEventListener('adminready', () => resolver(), { once: true });
      setTimeout(resolver, 10000);
    });
  },

  async _cargarEncuestas(){
    let docs = [];
    try {
      await Pages._esperarAdmin();
      // SYNOVA: las encuestas se leen por el webhook (el navegador nunca toca encuestasProspectos)
      const datos = await Pages._api('/api/admin/encuestas');
      docs = (datos.items || []).map(d => {
        const ms = d.creado ? Date.parse(d.creado) : 0;
        return { ...d, creado: ms ? { toMillis: () => ms, toDate: () => new Date(ms) } : null };
      });
    } catch (e) {
      console.error('❌ No se pudo leer encuestasProspectos:', e.code || '', e.message);
      const leadsEl = document.getElementById('enc-leads');
      if (leadsEl) {
        leadsEl.innerHTML = 'No se pudieron cargar los datos (' + (e.code || e.message || 'error') + '). <a href="#" id="enc-reintentar" style="color:var(--primary);font-weight:700;">Reintentar</a>';
        const re = document.getElementById('enc-reintentar');
        if (re) re.addEventListener('click', ev => { ev.preventDefault(); Pages._cargarEncuestas(); });
      }
      return;
    }
    // Una misma persona puede tener varias copias (parcial, completa, otra vuelta, una con WhatsApp):
    // por sesión nos quedamos con una sola. La completa gana a la parcial; entre completas, la más reciente
    // (a igualdad, la que tiene más respuestas); y si la elegida no trae WhatsApp pero otra copia sí, se conserva.
    const msDe = x => (x && x.creado && typeof x.creado.toMillis === 'function') ? x.creado.toMillis() : 0;
    const nResp = x => Object.keys(x.respuestas || {}).length;
    const grupos = new Map();
    docs.forEach((d, i) => {
      const clave = d.sessionId || ('sin-sesion-' + i);
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(d);
    });
    const porSesion = new Map();
    grupos.forEach((g, clave) => {
      const elegida = g.reduce((a, d) => {
        if (!!d.completada !== !!a.completada) return d.completada ? d : a;
        if (msDe(d) !== msDe(a)) return msDe(d) > msDe(a) ? d : a;
        return nResp(d) > nResp(a) ? d : a;
      });
      const conContacto = g.find(d => d.contacto);
      porSesion.set(clave, (conContacto && !elegida.contacto)
        ? { ...elegida, contacto: conContacto.contacto, avisoAceptado: conContacto.avisoAceptado, avisoVersion: conContacto.avisoVersion }
        : elegida);
    });
    docs = [...porSesion.values()];
    const total = docs.length;
    const completas = docs.filter(d => d.completada === true);
    const contar = (campo) => {
      const conteo = {};
      completas.forEach(d => {
        const v = d.respuestas?.[campo];
        if (!v) return; // los pasos condicionales (ej. "tamano") no existen para todos
        conteo[v] = (conteo[v] || 0) + 1;
      });
      return conteo;
    };
    const porPerfil = contar('p1');
    const porOrigen = contar('origen');
    const porUrgencia = contar('urgencia');
    const porFreno = contar('freno');
    const porInteres = contar('interes');
    const porTamano = contar('tamano');
    const porExperiencia = contar('experiencia');
    const porMeta = contar('meta');
    const porGiro = contar('giro');
    // Abandono: para cada persona que no terminó, la última pregunta que contestó según el
    // orden del flujo (las barras salen en ese mismo orden).
    const ORDEN_PREGUNTAS = [
      ['meta', 'Qué quieren lograr'], ['p1', 'Perfil'], ['origen', 'Cómo nos conoció'], ['giro', 'Área'],
      ['p2', 'Reto principal'], ['p2b', 'Profundización del reto'], ['tamano', 'Lugar de trabajo'],
      ['interes', 'Tema de interés'], ['experiencia', 'Cursos online'], ['urgencia', 'Cuándo empezar'], ['freno', 'Qué los detiene']
    ];
    const porAbandono = {};
    ORDEN_PREGUNTAS.forEach(([, nombre]) => { porAbandono[nombre] = 0; });
    docs.filter(d => d.completada !== true).forEach(d => {
      const ultima = [...ORDEN_PREGUNTAS].reverse().find(([k]) => d.respuestas && d.respuestas[k]);
      if (ultima) porAbandono[ultima[1]]++;
    });
    Object.keys(porAbandono).forEach(k => { if (!porAbandono[k]) delete porAbandono[k]; });
    const calientes = completas.filter(d => d.respuestas?.urgencia === 'Lo antes posible');

    const elTotal = document.getElementById('enc-kpi-total');
    if (elTotal) elTotal.textContent = total;
    const elCompletas = document.getElementById('enc-kpi-completas');
    if (elCompletas) elCompletas.textContent = completas.length;
    const elCompletasSub = document.getElementById('enc-kpi-completas-sub');
    if (elCompletasSub) elCompletasSub.innerHTML = total > 0 ? `<strong>${Math.round(completas.length/total*100)}%</strong> de las visitas` : 'Sin respuestas aún';
    const elCalientes = document.getElementById('enc-kpi-calientes');
    if (elCalientes) elCalientes.textContent = calientes.length;

    // Si una pregunta aún no tiene respuestas, en vez de una tarjeta en blanco se avisa.
    const sinDatos = (cv, datos) => {
      if (Object.keys(datos).length) return false;
      cv.insertAdjacentHTML('afterend', '<p style="margin:24px 0;text-align:center;font-size:13px;color:var(--text-3);">Aún no hay respuestas para esta pregunta.</p>');
      cv.style.display = 'none';
      return true;
    };
    if (!window.Chart) {
      document.querySelectorAll('canvas[id^="enc-chart-"]').forEach(cv => {
        cv.insertAdjacentHTML('afterend', '<p style="margin:24px 0;text-align:center;font-size:13px;color:var(--text-3);">No se pudo cargar la librería de gráficas. Recarga la página.</p>');
        cv.style.display = 'none';
      });
    }
    if (window.Chart) {
      Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('--text-2').trim() || '#666';
      const colores = ['#1C6FB0','#14B8A6','#F7941D','#D4537E','#9CA3AF'];
      const pie = (id, datos) => {
        const cv = document.getElementById(id);
        if (cv && sinDatos(cv, datos)) return;
        if (cv) new Chart(cv, {
          type: 'pie',
          data: { labels: Object.keys(datos), datasets: [{ data: Object.values(datos), backgroundColor: colores }] },
          options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }
        });
      };
      const barra = (id, datos, color, horizontal) => {
        const cv = document.getElementById(id);
        if (cv && sinDatos(cv, datos)) return;
        if (cv) new Chart(cv, {
          type: 'bar',
          data: { labels: Object.keys(datos), datasets: [{ data: Object.values(datos), backgroundColor: color }] },
          options: {
            indexAxis: horizontal ? 'y' : 'x',
            plugins: { legend: { display: false } },
            scales: horizontal
              ? { x: { beginAtZero: true, ticks: { precision: 0 } } }
              : { y: { beginAtZero: true, ticks: { precision: 0 } } }
          }
        });
      };
      pie('enc-chart-perfil', porPerfil);
      pie('enc-chart-origen', porOrigen);
      barra('enc-chart-urgencia', porUrgencia, '#14B8A6', false);
      barra('enc-chart-freno', porFreno, '#D4537E', false);
      barra('enc-chart-interes', porInteres, '#F7941D', true);
      barra('enc-chart-meta', porMeta, '#14B8A6', true);
      pie('enc-chart-giro', porGiro);
      barra('enc-chart-abandono', porAbandono, '#D4537E', true);
      barra('enc-chart-tamano', porTamano, '#1C6FB0', false);
      barra('enc-chart-experiencia', porExperiencia, '#9CA3AF', false);
    }

    const leadsEl = document.getElementById('enc-leads');
    if (leadsEl) {
      // Todos pasan por el paso de WhatsApp (opcional): aquí salen quienes lo dejaron, con los
      // urgentes primero y un enlace para escribirles directo.
      const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
      // Misma regla que la encuesta: detecta números que no parecen reales (para revisarlos antes de escribir).
      const patronFalso = n => {
        if (n.length < 6) return true;
        for (let p = 1; p <= 5; p++) if (n.length % p === 0 && n === n.slice(0, p).repeat(n.length / p)) return true;
        const dif = [...n].slice(1).map((c, i) => (Number(c) - Number(n[i]) + 10) % 10);
        return dif.every(x => x === 1) || dif.every(x => x === 9);
      };
      const numeroDudoso = crudo => {
        let n = String(crudo).replace(/\D/g, '');
        if (n.length < 8 || n.length > 15) return true;
        if (n.length === 10 || n.startsWith('52')) {
          // México (lo guardado antes de los demás países llegaba a 10 dígitos): lada válida y 10 dígitos.
          if (n.length === 13 && n.startsWith('521')) n = n.slice(3);
          else if (n.length === 12 && n.startsWith('52')) n = n.slice(2);
          if (n.length !== 10 || !/^[2-9]/.test(n)) return true;
        }
        return patronFalso(n) || /^(\d)\1{7}$/.test(n.slice(-8)); // los últimos 8 dígitos no pueden ser todos iguales
      };
      const conContacto = completas.filter(d => d.contacto).sort((a, b) =>
        (b.respuestas?.urgencia === 'Lo antes posible') - (a.respuestas?.urgencia === 'Lo antes posible'));
      if (conContacto.length === 0) {
        leadsEl.textContent = 'Nadie ha dejado su WhatsApp todavía.';
      } else {
        leadsEl.innerHTML = conContacto.map(d => {
          const fecha = d.creado?.toDate ? d.creado.toDate().toLocaleDateString('es-MX') : '—';
          const digitos = String(d.contacto).replace(/\D/g, '');
          const wa = digitos.length === 10 ? '52' + digitos : digitos;
          const urgencia = d.respuestas?.urgencia || '—';
          const urgente = urgencia === 'Lo antes posible';
          const etiqueta = `<span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:${urgente ? 'rgba(247,148,29,.18)' : 'var(--surface-3)'};color:${urgente ? '#C9740A' : 'var(--text-2)'};">${esc(urgencia)}</span>`;
          const enlace = digitos ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener" style="color:var(--primary);font-weight:700;text-decoration:none;">${esc(d.contacto)}</a>` : esc(d.contacto);
          const dudoso = numeroDudoso(d.contacto) ? '<span title="No parece un WhatsApp válido de México: revísalo antes de escribir" style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(179,38,30,.14);color:#B3261E;">Número dudoso</span>' : '';
          const constancia = dudoso + (d.avisoAceptado ? `<span title="Aceptó el Aviso de privacidad (${esc(d.avisoVersion || 'sin versión')})" style="font-size:11px;color:var(--text-3);">✓ Aviso aceptado</span>` : '');
          return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);flex-wrap:wrap;"><span>${enlace}</span>${etiqueta}${constancia}<span style="color:var(--text-3);">${fecha}</span></div>`;
        }).join('');
      }
    }
  },

  // ─── Pruebas gratuitas: cuántos eligen curso, cuáles y cuántos terminan pagando ───
  // ─────────── MÉTRICAS DE VISITAS · tráfico, origen de los miembros, países e historial ───────────
  metricas(p){
    const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
    const num = n => (Number(n) || 0).toLocaleString('es-MX');
    const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const NOMBRE_PAGINA = { landing: 'Sitio público', acceso: 'Inicio de sesión', panel: 'Panel de miembros', demo: 'Demo gratuita' };
    const NOMBRE_FUENTE = { directo: 'Directo', interno: 'Dentro del sitio', google: 'Google', bing: 'Bing', duckduckgo: 'DuckDuckGo', yahoo: 'Yahoo', facebook: 'Facebook', instagram: 'Instagram', meta: 'Meta (Facebook o Instagram)', whatsapp: 'WhatsApp', linkedin: 'LinkedIn', x: 'X (Twitter)', youtube: 'YouTube', tiktok: 'TikTok', correo: 'Correo electrónico', otros: 'Otros sitios' };
    const COLOR_FUENTE = { directo: '#94A3B8', interno: '#CBD5E1', google: '#4285F4', bing: '#00809D', duckduckgo: '#DE5833', yahoo: '#7E1FFF', facebook: '#1877F2', instagram: '#E1306C', meta: '#6366F1', whatsapp: '#25D366', linkedin: '#0A66C2', x: '#64748B', youtube: '#FF0000', tiktok: '#14B8A6', correo: '#F59E0B', otros: '#A8A29E' };
    const NOMBRE_DISP = { movil: 'Teléfono', tablet: 'Tableta', computadora: 'Computadora' };
    const COLOR_DISP = { movil: '#1C6FB0', tablet: '#F7941D', computadora: '#14B8A6' };
    const VERDE = '#1C6FB0', VERDE_OSC = '#0B4A7C', AZUL = '#14B8A6';
    const RANGOS = [['semana', 'Semana'], ['30', '30 días'], ['90', '90 días'], ['365', '12 meses'], ['todo', 'Todo']];
    const nombresPaises = (() => { try { return new Intl.DisplayNames(['es'], { type: 'region' }); } catch (e) { return { of: c => c }; } })();
    const nombrePais = c => (c === 'ZZ' ? 'No identificado' : (nombresPaises.of(c) || c));

    // Gráficas anteriores de esta pantalla (si se vuelve a entrar) se destruyen para no acumularlas
    (Pages._mxCharts || []).forEach(c => { try { c.destroy(); } catch (e) {} });
    Pages._mxCharts = [];

    if (!document.getElementById('mx2-estilos')) {
      const st = document.createElement('style');
      st.id = 'mx2-estilos';
      st.textContent = `
.mx2{--mx-g:#1C6FB0;--mx-line:var(--border);max-width:1240px}
.mx2 *{box-sizing:border-box}
.mx2-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px}
.mx2-hero h1{margin:0;font:800 30px/1.1 'Plus Jakarta Sans','Inter',sans-serif;letter-spacing:-.8px}
.mx2-hero p{margin:8px 0 0;max-width:640px;font-size:13.5px;line-height:1.6;color:var(--text-2)}
.mx2-eyebrow{display:block;margin-bottom:8px;font:700 10.5px 'JetBrains Mono',monospace;letter-spacing:1.6px;text-transform:uppercase;color:var(--primary)}
.mx2-estado{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid var(--border);border-radius:999px;background:var(--surface);font:600 12px Inter,sans-serif;color:var(--text-2)}
.mx2-estado i{width:9px;height:9px;border-radius:50%;background:#94A3B8}
.mx2-estado.ok i{background:#22C55E;box-shadow:0 0 0 4px rgba(34,197,94,.18)}
.mx2-estado.error i{background:#EF4444;box-shadow:0 0 0 4px rgba(239,68,68,.16)}
.mx2-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px;padding:10px;border:1px solid var(--border);border-radius:18px;background:var(--surface)}
.mx2-seg{display:flex;gap:4px;padding:4px;border-radius:13px;background:var(--surface-2);flex-wrap:wrap}
.mx2-seg button{border:0;background:transparent;color:var(--text-2);padding:8px 15px;border-radius:10px;font:700 12.5px Inter,sans-serif;cursor:pointer;transition:.18s}
.mx2-seg button:hover{color:var(--text)}
.mx2-seg button.on{background:var(--surface);color:var(--primary);box-shadow:0 2px 8px rgba(0,0,0,.09)}
.mx2-semnav{display:flex;align-items:center;gap:8px}
.mx2-semnav button{width:34px;height:34px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--text);font-size:17px;font-weight:700;cursor:pointer}
.mx2-semnav button:hover:not(:disabled){border-color:var(--primary);color:var(--primary)}
.mx2-semnav button:disabled{opacity:.35;cursor:default}
.mx2-semnav span{min-width:150px;text-align:center;font:700 13px 'Plus Jakarta Sans',Inter,sans-serif}
.mx2-semnav small{display:block;font:600 10px 'JetBrains Mono',monospace;color:var(--text-3);letter-spacing:.6px}
.mx2-btn{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border);background:var(--surface);color:var(--text);padding:9px 14px;border-radius:11px;font:700 12.5px Inter,sans-serif;cursor:pointer}
.mx2-btn:hover{border-color:var(--primary);color:var(--primary)}
.mx2-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:14px;margin-bottom:16px}
.mx2-kpi{position:relative;overflow:hidden;padding:18px 20px 14px;border:1px solid var(--border);border-radius:20px;background:var(--surface)}
.mx2-kpi::before{content:'';position:absolute;inset:0 auto 0 0;width:4px;background:var(--c)}
.mx2-kpi__l{font:700 10.5px 'JetBrains Mono',monospace;letter-spacing:1.2px;text-transform:uppercase;color:var(--text-3)}
.mx2-kpi__v{margin-top:8px;font:800 34px/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-1px}
.mx2-kpi__s{margin-top:6px;font-size:12px;color:var(--text-3)}
.mx2-kpi svg{display:block;width:100%;height:34px;margin-top:10px}
.mx2-d{display:inline-flex;align-items:center;gap:4px;margin-top:8px;padding:2px 9px;border-radius:999px;font:700 11px 'JetBrains Mono',monospace}
.mx2-d.up{background:rgba(16,185,129,.14);color:#0E9F6E}.mx2-d.down{background:rgba(239,68,68,.13);color:#DC2626}.mx2-d.eq{background:var(--surface-2);color:var(--text-3)}
.mx2-grid{display:grid;gap:16px;margin-bottom:16px}
.mx2-g2{grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.mx2-g3{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}
.mx2-card{min-width:0;padding:20px 22px;border:1px solid var(--border);border-radius:22px;background:var(--surface)}
.mx2-card h3{margin:0;font:700 16px 'Plus Jakarta Sans',Inter,sans-serif;letter-spacing:-.3px}
.mx2-sub{margin:5px 0 14px;font-size:12.5px;line-height:1.55;color:var(--text-3)}
.mx2-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.mx2-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--text-2)}
.mx2-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.mx2-cv{position:relative;width:100%}
.mx2-hero-card{border-color:color-mix(in srgb,var(--primary) 35%,var(--border));background:linear-gradient(150deg,color-mix(in srgb,var(--primary) 7%,var(--surface)),var(--surface) 60%)}
.mx2-top{display:flex;align-items:center;gap:14px;margin:4px 0 16px;padding:14px 16px;border-radius:16px;background:var(--surface);border:1px solid var(--border)}
.mx2-top b{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;flex:none;color:#fff;font:800 18px Inter,sans-serif}
.mx2-top div{font-size:13px;line-height:1.5;color:var(--text-2)}
.mx2-top strong{color:var(--text);font-size:15px}
.mx2-tbl{width:100%;border-collapse:collapse;font-size:13px;margin-top:14px}
.mx2-tbl th{padding:6px 8px;text-align:right;font:700 10px 'JetBrains Mono',monospace;letter-spacing:1px;text-transform:uppercase;color:var(--text-3);border-bottom:1px solid var(--border)}
.mx2-tbl th:first-child,.mx2-tbl td:first-child{text-align:left}
.mx2-tbl td{padding:9px 8px;text-align:right;border-bottom:1px solid var(--border);font-variant-numeric:tabular-nums}
.mx2-tbl tr:last-child td{border-bottom:0}
.mx2-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:9px;vertical-align:-1px}
.mx2-pill{display:inline-block;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--primary);font:700 11px 'JetBrains Mono',monospace}
.mx2-heat{display:grid;grid-template-columns:36px repeat(24,minmax(0,1fr));gap:3px;align-items:center}
.mx2-heat span{font:600 10px 'JetBrains Mono',monospace;color:var(--text-3)}
.mx2-heat i{display:block;aspect-ratio:1/1;border-radius:4px;background:var(--surface-2)}
.mx2-hl{display:grid;grid-template-columns:36px repeat(24,minmax(0,1fr));gap:3px;margin-top:8px;font:600 10px 'JetBrains Mono',monospace;color:var(--text-3)}
.mx2-hl span{white-space:nowrap;overflow:visible}
.mx2-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 12px;align-items:center;margin-bottom:12px}
.mx2-row__t{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mx2-row__n{font:700 12px 'JetBrains Mono',monospace;color:var(--text-2)}
.mx2-row__b{grid-column:1/-1;height:8px;border-radius:999px;background:var(--surface-2);overflow:hidden}
.mx2-row__b i{display:block;height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#1C6FB0,#5FB6E0);transition:width .8s cubic-bezier(.2,.8,.25,1)}
.mx2-q{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border)}
.mx2-q:last-child{border-bottom:0}
.mx2-q__av{width:40px;height:40px;border-radius:12px;flex:none;display:grid;place-items:center;color:#fff;font:800 13px Inter,sans-serif;background:linear-gradient(135deg,#1C6FB0,#0B4A7C)}
.mx2-q__m{flex:1;min-width:0}
.mx2-q__n{font-weight:700;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mx2-q__e{font-size:11.5px;color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mx2-q__tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
.mx2-q__tag{padding:1px 8px;border-radius:999px;font:700 10px 'JetBrains Mono',monospace;background:var(--surface-2);color:var(--text-2)}
.mx2-q__tag.vip{background:rgba(247,148,29,.16);color:#C26A00}
.mx2-q__u{text-align:right;font:600 11px 'JetBrains Mono',monospace;color:var(--text-3);min-width:96px}
.mx2-rec{display:grid;grid-template-columns:70px minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,.9fr);gap:6px 12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px}
.mx2-rec:last-child{border-bottom:0}
.mx2-rec__t{font:600 11px 'JetBrains Mono',monospace;color:var(--text-3)}
.mx2-rec__o{display:inline-flex;align-items:center;gap:7px;font-weight:700;min-width:0}
.mx2-rec__o i{width:9px;height:9px;border-radius:50%;flex:none}
.mx2-rec small{color:var(--text-3);font-size:11px;font-weight:600}
.mx2-nuevo{display:inline-block;padding:1px 7px;border-radius:999px;background:color-mix(in srgb,var(--primary) 14%,transparent);color:var(--primary);font:700 10px 'JetBrains Mono',monospace}
@media(max-width:700px){.mx2-rec{grid-template-columns:62px minmax(0,1fr) minmax(0,1fr)}.mx2-rec>:nth-child(n+4){grid-column:2/-1}}
.mx2-seg2{display:flex;gap:4px;padding:4px;border-radius:13px;background:var(--surface-2);flex-wrap:wrap}
.mx2-seg2 button{border:0;background:transparent;color:var(--text-2);padding:7px 13px;border-radius:10px;font:700 12.5px Inter,sans-serif;cursor:pointer;transition:.18s}
.mx2-seg2 button:hover{color:var(--text)}
.mx2-seg2 button.on{background:var(--surface);color:var(--primary);box-shadow:0 2px 8px rgba(0,0,0,.09)}
.mx2-per__k{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:14px}
.mx2-per__k div{padding:12px 14px;border-radius:14px;background:var(--surface-2);min-width:0}
.mx2-per__k b{display:block;font:800 22px/1.1 'Plus Jakarta Sans',sans-serif;letter-spacing:-.5px;overflow-wrap:anywhere}
.mx2-per__k span{display:block;margin-top:3px;font:600 10.5px 'JetBrains Mono',monospace;letter-spacing:.6px;text-transform:uppercase;color:var(--text-3)}
.mx2-mb{display:flex;align-items:flex-end;gap:4px;height:92px;margin-bottom:12px}
.mx2-mb div{flex:1 1 0;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:stretch;gap:4px}
.mx2-mb i{display:block;width:100%;border-radius:5px 5px 2px 2px;background:linear-gradient(180deg,#5FB6E0,#0B4A7C)}
.mx2-mb span{font:600 9.5px 'JetBrains Mono',monospace;color:var(--text-3);text-align:center;height:11px;white-space:nowrap;overflow:visible}
.mx2-chips{display:flex;flex-wrap:wrap;gap:8px}
.mx2-chip{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--surface-2);font-size:12.5px;font-weight:600}
.mx2-chip i{width:9px;height:9px;border-radius:50%;flex:none}
.mx2-chip b{font:800 12px 'JetBrains Mono',monospace;color:var(--text-2)}
.mx2-det{margin-top:16px;border-top:1px solid var(--border);padding-top:12px}
.mx2-det summary{display:flex;align-items:center;gap:10px;cursor:pointer;font:700 13px Inter,sans-serif;color:var(--text-2);list-style:none}
.mx2-det summary::-webkit-details-marker{display:none}
.mx2-det summary::before{content:'▸';font-size:12px;transition:transform .2s}
.mx2-det[open] summary::before{transform:rotate(90deg)}
.mx2-det__top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:10px}
.mx2-det__top .mx2-sub{margin:0;flex:1 1 260px}
.mx2-det__lista{max-height:300px;overflow-y:auto;margin-top:8px;padding-right:4px}
.mx2-r2{display:grid;grid-template-columns:130px minmax(0,1fr) minmax(0,1.3fr);gap:2px 12px;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);font-size:12.5px}
.mx2-r2:last-child{border-bottom:0}
.mx2-r2__m{color:var(--text-2)}
.mx2-r2__p{grid-column:2/-1;font-size:11px;color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:700px){.mx2-per__k{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.mx2-per__k b{font-size:17px}.mx2-r2{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.mx2-r2__m,.mx2-r2__p{grid-column:1/-1}}
.mx2-trio{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:18px;margin-bottom:6px}
.mx2-mini h4{margin:0 0 8px;font:700 10.5px 'JetBrains Mono',monospace;letter-spacing:1px;text-transform:uppercase;color:var(--text-3)}
.mx2-mr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 8px;align-items:center;margin-bottom:9px;font-size:13px}
.mx2-mr__t{display:flex;align-items:center;gap:8px;min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mx2-mr__t i{width:9px;height:9px;border-radius:50%;flex:none}
.mx2-mr b{font:700 12px 'JetBrains Mono',monospace;color:var(--text-2)}
.mx2-mr__b{grid-column:1/-1;height:5px;border-radius:99px;background:var(--surface-2);overflow:hidden}
.mx2-mr__b u{display:block;height:100%;border-radius:99px;text-decoration:none}
.mx2-mr__v{font-size:12.5px;color:var(--text-3)}
.mx2-det__top h4{margin:0;font:700 14px 'Plus Jakarta Sans',Inter,sans-serif}
.mx2-det__top{display:flex;align-items:center;gap:10px}
.mx2-det__lista .mx2-r2:nth-child(n+6){display:none}
.mx2-det__lista{max-height:none;overflow:visible;margin-top:8px;padding-right:0}
.mx2-det__lista.abierta{max-height:340px;overflow-y:auto;padding-right:4px}
.mx2-det__lista.abierta .mx2-r2:nth-child(n+6){display:grid}
.mx2-mas{margin-top:10px;width:100%;border:1px dashed var(--border);background:transparent;color:var(--primary);border-radius:12px;padding:9px;font:700 12.5px Inter,sans-serif;cursor:pointer}
.mx2-mas:hover{background:color-mix(in srgb,var(--primary) 8%,transparent)}
.mx2-r2__m strong{color:var(--text)}
.mx2-log{max-height:430px;overflow-y:auto;padding-right:4px}
.mx2-log .mx2-r2:first-child{padding-top:2px}
.mx2-log__pie{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:11.5px;color:var(--text-3)}
@media(max-width:700px){.mx2-trio{gap:12px;margin-bottom:0}.mx2-mr{margin-bottom:6px}.mx2-mr__b{display:none}.mx2-mini .mx2-mr:nth-child(n+5){display:none}.mx2-mini h4{margin-bottom:5px}}
.mx2-empty{padding:34px 16px;text-align:center;color:var(--text-3);font-size:13px;line-height:1.6}
.mx2-empty b{display:block;margin-bottom:4px;font:700 15px 'Plus Jakarta Sans',sans-serif;color:var(--text)}
.mx2-big{padding:56px 20px}
@media(max-width:480px){.mx2-tbl th,.mx2-tbl td{padding:8px 3px;font-size:12px}.mx2-tbl th{font-size:9px;letter-spacing:.4px}.mx2-heat{grid-template-columns:30px repeat(24,minmax(0,1fr));gap:2px}.mx2-hl{grid-template-columns:30px repeat(24,minmax(0,1fr));gap:2px}}
@media(max-width:700px){.mx2-hero h1{font-size:25px}.mx2-q{flex-wrap:wrap}.mx2-q__u{min-width:0;width:100%;text-align:left;padding-left:52px}.mx2-card{padding:18px 16px}.mx2-bar{padding:8px}.mx2-seg button{padding:7px 11px}}
`;
      document.head.appendChild(st);
    }

    p.innerHTML = `<div class="mx2 fade-up"><div id="mx2-raiz"><div class="mx2-empty"><b>Cargando métricas…</b>Un momento.</div></div></div>`;
    const raiz = p.querySelector('#mx2-raiz');

    // ── Utilidades de fechas (claves AAAA-MM-DD en hora de México) ──
    const sumarDias = (clave, n) => { const [a, m, d] = clave.split('-').map(Number); return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10); };
    const dow = clave => { const [a, m, d] = clave.split('-').map(Number); return (new Date(Date.UTC(a, m - 1, d)).getUTCDay() + 6) % 7; };
    const lunesDe = clave => sumarDias(clave, -dow(clave));
    const corta = clave => { const [, m, d] = clave.split('-').map(Number); return d + ' ' + MESES[m - 1]; };
    const mesDe = clave => { const [a, m] = clave.split('-').map(Number); return MESES[m - 1] + ' ' + String(a).slice(2); };
    const lista = (desde, hasta) => { const r = []; for (let c = desde; c <= hasta; c = sumarDias(c, 1)) r.push(c); return r; };

    // Al recargar la página directamente en esta sección, Firebase tarda un instante en confirmar la sesión
    const esperarSesion = async () => {
      for (let i = 0; i < 60; i++) {
        if (window.__auth && window.__auth.currentUser) return;
        await new Promise(r => setTimeout(r, 250));
      }
    };
    const cargar = async dias => {
      await esperarSesion();
      const token = await Pages._getAuthToken();
      const r = await fetch(Pages._webhookUrl + '/api/admin/metricas?dias=' + dias, { headers: { 'Authorization': 'Bearer ' + token } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'No se pudieron cargar las métricas');
      return d;
    };

    const pintar = datos => {
      const estado = { rango: 'semana', semana: 0 };
      let diasCargados = datos.dias.length;
      const hoy = datos.hoy;
      const cero = clave => ({ dia: clave, total: 0, unicos: 0, miembros: 0, dispositivos: {}, paginas: {}, fuentes: {}, paises: {}, horas: {} });
      let porDia = {};
      const indexar = () => { porDia = {}; datos.dias.forEach(d => { porDia[d.dia] = d; }); };
      indexar();
      const dato = clave => porDia[clave] || cero(clave);
      const origenes = () => (datos.origenes || []).map(o => ({ ...o, dia: o.creada ? String(o.creada).slice(0, 10) : null }));
      // 'creada' viene en UTC; el día que importa es el de México
      const diaMx = iso => { try { return new Intl.DateTimeFormat('en-CA', { timeZone: datos.zona, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso)); } catch (e) { return String(iso).slice(0, 10); } };
      const cuentas = () => (datos.origenes || []).map(o => ({ ...o, dia: o.creada ? diaMx(o.creada) : null })).filter(o => o.dia);

      // ── Rango activo: periodo actual y el anterior (para comparar) ──
      const rangoActual = () => {
        const primerDia = datos.dias[0].dia;
        if (estado.rango === 'semana') {
          const lunes = sumarDias(lunesDe(hoy), -7 * estado.semana);
          const hasta = sumarDias(lunes, 6);
          const parcial = hasta > hoy;
          const finVisto = parcial ? hoy : hasta;
          const largo = lista(lunes, finVisto).length;
          const pLunes = sumarDias(lunes, -7);
          return { desde: lunes, hasta: finVisto, completo: hasta, prev: lista(pLunes, sumarDias(pLunes, largo - 1)), parcial, titulo: corta(lunes) + ' – ' + corta(hasta) };
        }
        if (estado.rango === 'todo') {
          const con = datos.dias.find(d => d.total > 0);
          const desde = con ? con.dia : sumarDias(hoy, -29);
          return { desde, hasta: hoy, prev: [], titulo: 'Todo el historial' };
        }
        const n = Number(estado.rango);
        const desde = sumarDias(hoy, -(n - 1));
        const pDesde = sumarDias(desde, -n);
        return { desde: desde < primerDia && n > diasCargados ? primerDia : desde, hasta: hoy, prev: lista(pDesde, sumarDias(desde, -1)), titulo: 'Últimos ' + (n === 365 ? '12 meses' : n + ' días') };
      };

      const suma = (claves, campo) => claves.reduce((t, c) => t + (dato(c)[campo] || 0), 0);
      const sumaMapa = (claves, campo) => { const o = {}; claves.forEach(c => Object.entries(dato(c)[campo] || {}).forEach(([k, v]) => { o[k] = (o[k] || 0) + v; })); return o; };
      const delta = (ahora, antes, hayPrev) => {
        if (!hayPrev) return '';
        if (!antes && !ahora) return '<span class="mx2-d eq">— sin cambio</span>';
        if (!antes) return '<span class="mx2-d up">▲ nuevo</span>';
        const pct = Math.round((ahora - antes) / antes * 100);
        if (pct === 0) return '<span class="mx2-d eq">= igual que antes</span>';
        return '<span class="mx2-d ' + (pct > 0 ? 'up">▲ +' : 'down">▼ ') + Math.abs(pct) + '% vs periodo anterior</span>';
      };
      const spark = (vals, color) => {
        const max = Math.max(1, ...vals), w = 200, h = 34;
        if (vals.length < 2) return '';
        const pts = vals.map((v, i) => [i / (vals.length - 1) * w, h - 3 - v / max * (h - 8)]);
        const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
        const id = 'sp' + Math.random().toString(36).slice(2, 7);
        return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${w} ${h} L0 ${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
      };
      const filas = (obj, nombres, color) => {
        const orden = Object.entries(obj).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
        const max = Math.max(1, ...orden.map(o => o[1]));
        return orden.length ? orden.map(([k, v]) => `<div class="mx2-row"><span class="mx2-row__t">${esc(nombres[k] || k)}</span><span class="mx2-row__n">${num(v)}</span><div class="mx2-row__b"><i data-w="${Math.round(v / max * 100)}"${color ? ' style="background:' + color(k) + '"' : ''}></i></div></div>`).join('')
          : '<div class="mx2-empty">Sin datos en este periodo</div>';
      };

      // ── Estilo común de Chart.js ──
      const colorTexto = () => (getComputedStyle(document.body).getPropertyValue('--text-3').trim() || '#6b7280');
      const colorLinea = () => (getComputedStyle(document.body).getPropertyValue('--border').trim() || 'rgba(0,0,0,.08)');
      const crear = (canvas, config) => {
        if (!canvas || typeof Chart === 'undefined') return null;
        Chart.defaults.font.family = "Inter, system-ui, sans-serif";
        Chart.defaults.font.size = 12;
        const c = new Chart(canvas, config);
        Pages._mxCharts.push(c);
        return c;
      };
      const tooltip = { backgroundColor: '#0A1F33', titleColor: '#fff', bodyColor: '#E3EEF8', padding: 12, cornerRadius: 12, boxPadding: 5, titleFont: { weight: '700', size: 13 }, bodyFont: { size: 12 } };
      const degradado = (color, alto) => ctx => {
        const area = ctx.chart.chartArea; if (!area) return color + '33';
        const g = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
        g.addColorStop(0, color + '59'); g.addColorStop(1, color + '00'); return g;
      };
      const ejes = (extra) => ({
        x: { grid: { display: false }, border: { display: false }, ticks: { color: colorTexto(), maxRotation: 0, autoSkipPadding: 14 } },
        y: { beginAtZero: true, grid: { color: colorLinea(), drawTicks: false }, border: { display: false }, ticks: { color: colorTexto(), precision: 0, padding: 8 }, ...(extra || {}) }
      });

      const dibujar = () => {
        (Pages._mxCharts || []).forEach(c => { try { c.destroy(); } catch (e) {} });
        Pages._mxCharts = [];
        const R = rangoActual();
        const claves = lista(R.desde, R.hasta);
        const hayPrev = R.prev.length > 0 && suma(R.prev, 'total') + suma(R.prev, 'unicos') > 0;
        const total = suma(claves, 'total'), unicos = suma(claves, 'unicos');
        const totalPrev = suma(R.prev, 'total'), unicosPrev = suma(R.prev, 'unicos');
        const todasCuentas = cuentas();
        const enRango = lista0 => todasCuentas.filter(o => lista0.includes(o.dia));
        const nuevas = enRango(claves), nuevasPrev = enRango(R.prev);
        const vipNuevos = nuevas.filter(o => o.vip).length;
        const promedio = Math.round(total / Math.max(1, claves.length));
        const hayAlgo = datos.dias.some(d => d.total > 0) || (datos.miembros || []).length || todasCuentas.length;
        const est = datos.estado || null;
        const estadoHtml = est ? (est.errores > 0 && !est.ultimoOk ? `<span class="mx2-estado error" title="${esc((est.ultimoError && est.ultimoError.mensaje) || '')}"><i></i>El contador tuvo errores</span>`
          : est.ultimoOk ? `<span class="mx2-estado ok"><i></i>Contador activo · última visita ${esc(new Date(est.ultimoOk).toLocaleString('es-MX', { timeZone: datos.zona, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }))}</span>`
          : '<span class="mx2-estado"><i></i>Contador activo · esperando la primera visita</span>') : '';

        const barra = `
          <div class="mx2-bar">
            <div class="mx2-seg" role="tablist">${RANGOS.map(([k, t]) => `<button type="button" role="tab" data-r="${k}" class="${estado.rango === k ? 'on' : ''}">${t}</button>`).join('')}</div>
            ${estado.rango === 'semana' ? `<div class="mx2-semnav"><button type="button" id="mx2-ant" aria-label="Semana anterior" ${estado.semana >= 51 ? 'disabled' : ''}>‹</button><span>${esc(R.titulo)}<small>${estado.semana === 0 ? 'ESTA SEMANA' : 'HACE ' + estado.semana + (estado.semana === 1 ? ' SEMANA' : ' SEMANAS')}</small></span><button type="button" id="mx2-sig" aria-label="Semana siguiente" ${estado.semana === 0 ? 'disabled' : ''}>›</button></div>` : `<span style="font:700 13px 'Plus Jakarta Sans',Inter,sans-serif">${esc(R.titulo)}</span>`}
            <button type="button" class="mx2-btn" id="mx2-csv"><svg class="ic" width="15" height="15"><use href="#i-download"/></svg>Descargar historial (CSV)</button>
          </div>`;

        const cab = `
          <div class="mx2-hero">
            <div><span class="mx2-eyebrow">Marketing</span><h1>Métricas de visitas</h1>
            <p>Cuánta gente visita SYNOVA, desde dónde llega y de qué red social salen tus miembros. Conteo anónimo y sin cookies; todo se guarda día a día para que consultes el historial.</p>${datos.importacion ? `<p style="margin-top:6px;font-size:12px;color:var(--text-3)">Del ${esc(corta(datos.importacion.desde))} al ${esc(corta(datos.importacion.hasta))} los datos vienen del contador anterior de SYNOVA: visitas, personas, horas, páginas y miembros. Origen, país y dispositivo se registran a partir del contador nuevo.</p>` : ''}</div>
            ${estadoHtml}
          </div>`;

        if (!hayAlgo) {
          raiz.innerHTML = cab + `<div class="mx2-card"><div class="mx2-empty mx2-big"><b>Todavía no hay visitas registradas</b>El contador ya está encendido. En cuanto entre la primera persona al sitio verás aquí las gráficas, y el historial se irá guardando solo, día tras día.</div></div>`;
          return;
        }

        // ── Serie del gráfico principal ──
        let serie;
        if (estado.rango === 'semana') {
          const lunes = R.desde;
          serie = { tipo: 'barras', etiquetas: DIAS, visitas: DIAS.map((_, i) => { const c = sumarDias(lunes, i); return c > hoy ? null : dato(c).total; }), unicos: DIAS.map((_, i) => { const c = sumarDias(lunes, i); return c > hoy ? null : dato(c).unicos; }) };
        } else if (estado.rango === '30' || estado.rango === '90') {
          serie = { tipo: 'linea', etiquetas: claves.map(corta), visitas: claves.map(c => dato(c).total), unicos: claves.map(c => dato(c).unicos), previa: R.prev.map(c => dato(c).total) };
        } else {
          const meses = {};
          claves.forEach(c => { const k = c.slice(0, 7); meses[k] = meses[k] || { v: 0, u: 0 }; meses[k].v += dato(c).total; meses[k].u += dato(c).unicos; });
          const ks = Object.keys(meses).sort();
          serie = { tipo: 'barras', etiquetas: ks.map(k => mesDe(k + '-01')), visitas: ks.map(k => meses[k].v), unicos: ks.map(k => meses[k].u) };
        }

        // Los mismos grupos de la gráfica principal (días o meses), para repartir las redes sociales en el tiempo
        let grupos;
        if (estado.rango === 'semana') grupos = DIAS.map((_, i) => { const c = sumarDias(R.desde, i); return c > hoy ? [] : [c]; });
        else if (estado.rango === '30' || estado.rango === '90') grupos = claves.map(c => [c]);
        else { const m = {}; claves.forEach(c => { (m[c.slice(0, 7)] = m[c.slice(0, 7)] || []).push(c); }); grupos = Object.keys(m).sort().map(k => m[k]); }

        // ── Origen de los miembros ──
        const porOrigen = {};
        nuevas.forEach(o => { const k = o.origen || 'directo'; porOrigen[k] = porOrigen[k] || { n: 0, vip: 0 }; porOrigen[k].n += 1; if (o.vip) porOrigen[k].vip += 1; });
        const ordenOrigen = Object.entries(porOrigen).sort((a, b) => b[1].n - a[1].n);
        const ganador = ordenOrigen[0];
        const sinDato = Number(datos.sinOrigen) || 0;

        // ── Datos de apoyo ──
        const disp = sumaMapa(claves, 'dispositivos');
        const totDisp = Object.values(disp).reduce((a, b) => a + b, 0);
        const paises = sumaMapa(claves, 'paises');
        const totPaises = Object.values(paises).reduce((a, b) => a + b, 0);
        const topPaises = Object.entries(paises).sort((a, b) => b[1] - a[1]).slice(0, 8);
        const fueraMx = totPaises - (paises.MX || 0) - (paises.ZZ || 0);
        const fuentes = sumaMapa(claves, 'fuentes');
        const ordenFuentes = Object.entries(fuentes).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
        const totFuentes = ordenFuentes.reduce((a, [, v]) => a + v, 0);
        const REDES = ['facebook', 'instagram', 'meta', 'whatsapp', 'tiktok', 'youtube', 'linkedin', 'x'];
        const sociales = REDES.map(k => ({ k, total: fuentes[k] || 0 })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);
        const totSociales = sociales.reduce((a, x) => a + x.total, 0);
        const serieRedes = sociales.slice(0, 5).map(x => ({ k: x.k, datos: grupos.map(g => g.reduce((t, c) => t + (((dato(c).fuentes || {})[x.k]) || 0), 0)) }));
        const redesVacio = '<div class="mx2-empty"><b>Todavía nadie ha llegado desde una red social</b>Aquí verás cuántas personas llegan desde cada una. Comparte tus enlaces con <code>?utm_source=facebook</code> o <code>?utm_source=instagram</code> para medirlo con exactitud.<div class="mx2-leg" style="justify-content:center;margin-top:14px">' + REDES.map(k => `<span><i style="background:${COLOR_FUENTE[k]};border-radius:50%"></i>${NOMBRE_FUENTE[k]} <b>0</b></span>`).join('') + '</div></div>';
        const pags = sumaMapa(claves, 'paginas');
        const porSemDia = DIAS.map((_, i) => { const l = claves.filter(c => dow(c) === i); return l.length ? l.reduce((s, c) => s + dato(c).total, 0) / l.length : 0; });
        const diaFuerte = porSemDia.indexOf(Math.max(...porSemDia));
        const mapa = DIAS.map(() => Array(24).fill(0));
        claves.forEach(c => { const h = dato(c).horas || {}; for (let i = 0; i < 24; i++) mapa[dow(c)][i] += Number(h[String(i).padStart(2, '0')]) || 0; });
        const maxMapa = Math.max(1, ...mapa.flat());
        const horaPico = (() => { const t = Array(24).fill(0); mapa.forEach(f => f.forEach((v, i) => { t[i] += v; })); const m = Math.max(...t); return m ? t.indexOf(m) : -1; })();
        const recientes = (datos.recientes || []).map(r => {
          const d = new Date(r.t);
          const ok = !Number.isNaN(d.getTime());
          const p = r.pistas || {};
          const pistas = [p.ref ? 'viene de ' + p.ref : '', p.utm ? 'etiqueta ' + p.utm : '', p.app ? 'app de ' + (NOMBRE_FUENTE[p.app] || p.app) : '', p.fbclid ? 'enlace con marca de Meta' : '', p.igshid ? 'enlace compartido desde Instagram' : ''].filter(Boolean);
          return { ...r,
            pistaTxt: pistas.length ? pistas.join(' · ') : 'sin pistas del origen',
            hora: ok ? d.toLocaleTimeString('es-MX', { timeZone: datos.zona, hour: 'numeric', minute: '2-digit' }) : '',
            fecha: ok ? d.toLocaleDateString('es-MX', { timeZone: datos.zona, day: 'numeric', month: 'short' }) : '' };
        });
        const quienes = (datos.miembros || []).map(m => ({ ...m, enRango: claves.reduce((s, c) => s + ((m.dias || {})[c] || 0), 0), act: claves.map(c => (m.dias || {})[c] || 0) })).filter(m => m.enRango > 0).sort((a, b) => b.enRango - a.enRango).slice(0, 15);
        const origenDe = new Map((datos.origenes || []).map(o => [o.uid, o]));
        const anonimos = Math.max(0, unicos - (datos.miembros || []).filter(m => claves.some(c => (m.dias || {})[c])).length);

        // ── Tarjeta "Visitas por periodo": el registro de visitas (guardado en el servidor) por Hoy, Ayer, 7 y 30 días ──
        const PERIODOS = [['hoy', 'Hoy'], ['ayer', 'Ayer'], ['7', '7 días'], ['30', '30 días']];
        if (!estado.periodo) estado.periodo = 'hoy';
        if (!estado.visibles) estado.visibles = 10;
        const clavesPeriodo = k => k === 'hoy' ? [hoy] : k === 'ayer' ? [sumarDias(hoy, -1)] : lista(sumarDias(hoy, -(Number(k) - 1)), hoy);
        const enriquecerVisita = r => {
          const d = new Date(r.t);
          const ok = !Number.isNaN(d.getTime());
          const p = r.pistas || {};
          const pistas = [p.ref ? 'viene de ' + p.ref : '', p.utm ? 'etiqueta ' + p.utm : '', p.app ? 'app de ' + (NOMBRE_FUENTE[p.app] || p.app) : '', p.fbclid ? 'enlace con marca de Meta' : '', p.igshid ? 'enlace compartido desde Instagram' : ''].filter(Boolean);
          return { ...r, pistaTxt: pistas.length ? pistas.join(' · ') : 'sin pistas del origen',
            hora: ok ? d.toLocaleTimeString('es-MX', { timeZone: datos.zona, hour: 'numeric', minute: '2-digit' }) : '',
            fecha: ok ? d.toLocaleDateString('es-MX', { timeZone: datos.zona, day: 'numeric', month: 'short' }) : '' };
        };
        const filaVisita = r => '<div class="mx2-r2"><span class="mx2-rec__t">' + esc(r.hora) + ' · ' + esc(r.fecha) + '</span>'
          + '<span class="mx2-rec__o"><i style="background:' + (COLOR_FUENTE[r.fuente] || '#64748B') + '"></i>' + esc(NOMBRE_FUENTE[r.fuente] || r.fuente) + '</span>'
          + '<span class="mx2-r2__m"><strong>' + esc(nombrePais(r.pais)) + '</strong> · ' + esc(NOMBRE_DISP[r.dispositivo] || '') + (r.nuevo ? ' · primera del día' : '') + '</span>'
          + '<span class="mx2-r2__p" title="' + esc(r.pistaTxt) + '">' + esc(r.pistaTxt) + '</span></div>';
        const tarjetaVisitas = '<div class="mx2-card" style="margin-bottom:16px" id="mx2-per">'
          + '<div class="mx2-head"><div><h3>Visitas por periodo</h3><p class="mx2-sub" style="margin-bottom:6px" id="mx2-per-resumen">&nbsp;</p></div>'
          + '<div class="mx2-seg2" role="tablist">' + PERIODOS.map(([k, t]) => '<button type="button" role="tab" data-per="' + k + '" class="' + (estado.periodo === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div></div>'
          + '<div class="mx2-log" id="mx2-log"><div class="mx2-empty" style="padding:22px 10px">Cargando visitas…</div></div>'
          + '<button type="button" class="mx2-mas" id="mx2-log-mas" style="display:none"></button>'
          + '<div class="mx2-log__pie"><span id="mx2-log-hora">Cada visita se guarda sola al ocurrir, sin datos personales.</span><button type="button" class="mx2-btn" id="mx2-rec-actualizar">Actualizar</button></div></div>';

        raiz.innerHTML = cab + barra + `
          <div class="mx2-kpis">
            <div class="mx2-kpi" style="--c:${VERDE}"><div class="mx2-kpi__l">Visitas</div><div class="mx2-kpi__v">${num(total)}</div><div class="mx2-kpi__s">Páginas vistas</div>${delta(total, totalPrev, hayPrev)}${spark(claves.map(c => dato(c).total), VERDE)}</div>
            <div class="mx2-kpi" style="--c:${AZUL}"><div class="mx2-kpi__l">Personas distintas</div><div class="mx2-kpi__v">${num(unicos)}</div><div class="mx2-kpi__s">Visitantes únicos por día, sumados</div>${delta(unicos, unicosPrev, hayPrev)}${spark(claves.map(c => dato(c).unicos), AZUL)}</div>
            <div class="mx2-kpi" style="--c:#F7941D"><div class="mx2-kpi__l">Cuentas nuevas</div><div class="mx2-kpi__v">${num(nuevas.length)}</div><div class="mx2-kpi__s">${vipNuevos ? num(vipNuevos) + ' ya son VIP' : 'Personas que crearon su cuenta'}</div>${delta(nuevas.length, nuevasPrev.length, hayPrev && nuevasPrev.length > 0)}${spark(claves.map(c => todasCuentas.filter(o => o.dia === c).length), '#F7941D')}</div>
            <div class="mx2-kpi" style="--c:#8B5CF6"><div class="mx2-kpi__l">Promedio por día</div><div class="mx2-kpi__v">${num(promedio)}</div><div class="mx2-kpi__s">${horaPico >= 0 ? 'Hora pico: ' + (horaPico % 12 || 12) + (horaPico < 12 ? ' a. m.' : ' p. m.') : 'Aún sin visitas'}</div>${spark(claves.map(c => dato(c).total), '#8B5CF6')}</div>
          </div>

          <div class="mx2-card" style="margin-bottom:16px">
            <div class="mx2-head"><div><h3>${estado.rango === 'semana' ? 'Visitas por día de la semana' : estado.rango === '365' || estado.rango === 'todo' ? 'Visitas por mes' : 'Visitas día a día'}</h3><p class="mx2-sub" style="margin-bottom:6px">${estado.rango === 'semana' ? 'De lunes a domingo; los días que aún no pasan quedan vacíos.' : serie.previa && hayPrev ? 'La línea punteada es el periodo anterior, para comparar.' : 'Evolución del periodo seleccionado.'}</p></div>
              <div class="mx2-leg"><span><i style="background:${VERDE}"></i>Visitas</span><span><i style="background:${AZUL}"></i>Personas distintas</span>${serie.previa && hayPrev ? '<span><i style="background:#94A3B8"></i>Periodo anterior</span>' : ''}</div></div>
            <div class="mx2-cv" style="height:300px"><canvas id="mx2-principal"></canvas></div>
          </div>

          ${tarjetaVisitas}

          <div class="mx2-card mx2-hero-card" style="margin-bottom:16px">
            <h3>¿De dónde vienen tus miembros?</h3>
            <p class="mx2-sub">Cuentas creadas en este periodo, según la red social o el enlace por el que llegaron${sinDato ? ' · ' + num(sinDato) + ' cuentas anteriores al contador no tienen origen' : ''}.</p>
            ${ordenOrigen.length ? `
              <div class="mx2-top"><b style="background:${COLOR_FUENTE[ganador[0]] || '#64748B'}">${esc((NOMBRE_FUENTE[ganador[0]] || ganador[0]).slice(0, 1))}</b><div><strong>${esc(NOMBRE_FUENTE[ganador[0]] || ganador[0])}</strong> es de donde más miembros llegaron: <strong>${num(ganador[1].n)}</strong> de ${num(nuevas.length)} cuentas nuevas (${Math.round(ganador[1].n / nuevas.length * 100)}%)${ganador[1].vip ? ', y <strong>' + num(ganador[1].vip) + '</strong> ya son VIP' : ''}.</div></div>
              <div class="mx2-g2" style="display:grid;gap:18px;align-items:start">
                <div class="mx2-cv" style="height:${Math.max(180, ordenOrigen.length * 46 + 40)}px"><canvas id="mx2-origen"></canvas></div>
                <table class="mx2-tbl"><thead><tr><th>Origen</th><th>Cuentas</th><th>VIP</th><th>Conversión</th></tr></thead><tbody>
                  ${ordenOrigen.map(([k, v]) => `<tr><td><span class="mx2-dot" style="background:${COLOR_FUENTE[k] || '#64748B'}"></span>${esc(NOMBRE_FUENTE[k] || k)}</td><td>${num(v.n)}</td><td>${num(v.vip)}</td><td><span class="mx2-pill">${Math.round(v.vip / v.n * 100)}%</span></td></tr>`).join('')}
                </tbody></table>
              </div>` : `<div class="mx2-empty"><b>Aún no hay cuentas con origen en este periodo</b>Desde que se publicó el contador, cada cuenta nueva guarda por dónde llegó (Facebook, Instagram, Google, WhatsApp…). Cuando alguien se registre lo verás aquí.</div>`}
          </div>

          <div class="mx2-grid mx2-g2">
            <div class="mx2-card"><h3>Redes sociales · ¿cuánta gente llega de cada una?</h3>
              <p class="mx2-sub">${totSociales ? '<strong>' + num(totSociales) + '</strong> de ' + num(totFuentes) + ' personas (' + Math.round(totSociales / Math.max(1, totFuentes) * 100) + '%) llegaron desde una red social. La más fuerte: <strong>' + esc(NOMBRE_FUENTE[sociales[0].k]) + '</strong>.' : 'Personas que llegaron desde Facebook, Instagram, WhatsApp, TikTok y más.'}</p>
              ${sociales.length ? `<div class="mx2-cv" style="height:${Math.max(170, sociales.length * 44 + 30)}px"><canvas id="mx2-redes"></canvas></div>` : redesVacio}</div>
            <div class="mx2-card"><h3>Redes sociales a lo largo del tiempo</h3>
              <p class="mx2-sub">Cuántas personas llegaron de cada red ${estado.rango === '365' || estado.rango === 'todo' ? 'mes a mes' : 'día a día'}.</p>
              ${sociales.length ? `<div class="mx2-cv" style="height:${Math.max(220, sociales.length * 44 + 30)}px"><canvas id="mx2-redes-tiempo"></canvas></div>` : redesVacio}</div>
          </div>

          <div class="mx2-grid mx2-g2">
            <div class="mx2-card"><h3>¿Qué día entra más gente?</h3><p class="mx2-sub">Promedio de visitas por día de la semana en el periodo.${porSemDia[diaFuerte] > 0 ? ' El más fuerte: <strong>' + DIAS[diaFuerte] + '</strong>.' : ''}</p><div class="mx2-cv" style="height:250px"><canvas id="mx2-semana"></canvas></div></div>
            <div class="mx2-card"><h3>Mapa de calor · día y hora</h3><p class="mx2-sub">Cuándo entra la gente (hora de México). Más oscuro = más visitas.</p>
              <div class="mx2-heat">${DIAS.map((n, d) => `<span>${n}</span>` + mapa[d].map((v, h) => `<i title="${n} ${h}:00 · ${v} visitas" style="background:${v ? 'color-mix(in srgb,#1C6FB0 ' + Math.max(15, Math.round(v / maxMapa * 100)) + '%,var(--surface-2))' : 'var(--surface-2)'}"></i>`).join('')).join('')}</div>
              <div class="mx2-hl"><span></span>${Array.from({ length: 24 }, (_, h) => `<span>${h % 6 === 0 ? (h % 12 || 12) + (h < 12 ? 'a' : 'p') : ''}</span>`).join('')}</div></div>
          </div>

          <div class="mx2-grid mx2-g3">
            <div class="mx2-card"><h3>Países</h3><p class="mx2-sub">${totPaises ? (fueraMx > 0 ? 'Hubo <strong>' + num(fueraMx) + '</strong> persona' + (fueraMx === 1 ? '' : 's') + ' de fuera de México.' : 'Por ahora todas las visitas identificadas son de México.') : 'Aún sin visitas.'}</p><div class="mx2-cv" style="height:${Math.max(160, topPaises.length * 36 + 30)}px"><canvas id="mx2-paises"></canvas></div></div>
            <div class="mx2-card"><h3>Dispositivos</h3><p class="mx2-sub">Desde qué aparato entra la gente.</p><div class="mx2-cv" style="height:210px"><canvas id="mx2-disp"></canvas></div>
              <div class="mx2-leg" style="justify-content:center;margin-top:12px">${Object.keys(NOMBRE_DISP).map(k => `<span><i style="background:${COLOR_DISP[k]};border-radius:50%"></i>${NOMBRE_DISP[k]} <b>${totDisp ? Math.round((disp[k] || 0) / totDisp * 100) : 0}%</b></span>`).join('')}</div></div>
            <div class="mx2-card"><h3>Cómo llegan al sitio</h3><p class="mx2-sub">Por dónde entró cada persona en su primera visita del día.</p>${ordenFuentes.length ? `<div class="mx2-cv" style="height:210px"><canvas id="mx2-fuentes"></canvas></div>
              <div class="mx2-leg" style="margin-top:12px">${ordenFuentes.slice(0, 6).map(([k, v]) => `<span><i style="background:${COLOR_FUENTE[k] || '#64748B'};border-radius:50%"></i>${esc(NOMBRE_FUENTE[k] || k)} <b>${Math.round(v / totFuentes * 100)}%</b></span>`).join('')}</div>` : '<div class="mx2-empty">Sin datos en este periodo</div>'}</div>
          </div>

          <div class="mx2-grid mx2-g2">
            <div class="mx2-card"><h3>Páginas más vistas</h3><p class="mx2-sub">Dónde entra la gente.</p>${filas(pags, NOMBRE_PAGINA)}</div>
            <div class="mx2-card"><h3>Quiénes entraron al panel</h3><p class="mx2-sub">Miembros con sesión iniciada en el periodo${anonimos ? '. Además hubo <strong>' + num(anonimos) + '</strong> visitantes anónimos que no se identifican' : ''}.</p>
              ${quienes.length ? quienes.map(m => {
                const ini = (m.nombre || m.email || '?').trim().slice(0, 2).toUpperCase();
                const o = origenDe.get(m.uid);
                const ult = m.ultima ? new Date(m.ultima).toLocaleString('es-MX', { timeZone: datos.zona, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
                return `<div class="mx2-q"><div class="mx2-q__av">${esc(ini)}</div><div class="mx2-q__m"><div class="mx2-q__n">${esc(m.nombre || 'Sin nombre')}</div><div class="mx2-q__e">${esc(m.email)}</div><div class="mx2-q__tags">${o ? '<span class="mx2-q__tag">' + esc(NOMBRE_FUENTE[o.origen] || o.origen) + '</span>' : ''}${o && o.vip ? '<span class="mx2-q__tag vip">VIP</span>' : ''}</div></div><div class="mx2-q__u">${num(m.enRango)} visita${m.enRango === 1 ? '' : 's'}<br>${esc(ult)}</div></div>`;
              }).join('') : '<div class="mx2-empty">Ningún miembro entró al panel en este periodo.</div>'}
            </div>
          </div>`;

        // ── Gráficas ──
        const ej = ejes();
        if (serie.tipo === 'linea') {
          crear(raiz.querySelector('#mx2-principal'), { type: 'line', data: { labels: serie.etiquetas, datasets: [
            { label: 'Visitas', data: serie.visitas, borderColor: VERDE, backgroundColor: degradado(VERDE), fill: true, tension: .38, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 6, pointHoverBackgroundColor: '#fff', pointHoverBorderColor: VERDE, pointHoverBorderWidth: 3 },
            { label: 'Personas distintas', data: serie.unicos, borderColor: AZUL, backgroundColor: degradado(AZUL), fill: true, tension: .38, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 6, pointHoverBackgroundColor: '#fff', pointHoverBorderColor: AZUL, pointHoverBorderWidth: 3 },
            ...(hayPrev ? [{ label: 'Periodo anterior', data: serie.previa, borderColor: '#94A3B8', borderDash: [6, 6], borderWidth: 1.8, pointRadius: 0, pointHoverRadius: 0, fill: false, tension: .38 }] : [])
          ] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip }, scales: ej } });
        } else {
          crear(raiz.querySelector('#mx2-principal'), { type: 'bar', data: { labels: serie.etiquetas, datasets: [
            { label: 'Visitas', data: serie.visitas, backgroundColor: ctx => { const a = ctx.chart.chartArea; if (!a) return VERDE; const g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, '#5FB6E0'); g.addColorStop(1, VERDE_OSC); return g; }, borderRadius: 10, borderSkipped: false, maxBarThickness: 38 },
            { label: 'Personas distintas', data: serie.unicos, backgroundColor: ctx => { const a = ctx.chart.chartArea; if (!a) return AZUL; const g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, '#5EEAD4'); g.addColorStop(1, '#2563EB'); return g; }, borderRadius: 10, borderSkipped: false, maxBarThickness: 38 }
          ] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, tooltip }, scales: ej } });
        }
        if (ordenOrigen.length) {
          crear(raiz.querySelector('#mx2-origen'), { type: 'bar', data: { labels: ordenOrigen.map(([k]) => NOMBRE_FUENTE[k] || k), datasets: [
            { label: 'Cuentas creadas', data: ordenOrigen.map(([, v]) => v.n), backgroundColor: ordenOrigen.map(([k]) => COLOR_FUENTE[k] || '#64748B'), borderRadius: 8, borderSkipped: false, barThickness: 20 },
            { label: 'Ya son VIP', data: ordenOrigen.map(([, v]) => v.vip), backgroundColor: ordenOrigen.map(([k]) => (COLOR_FUENTE[k] || '#64748B') + '55'), borderColor: ordenOrigen.map(([k]) => COLOR_FUENTE[k] || '#64748B'), borderWidth: 1.5, borderRadius: 8, borderSkipped: false, barThickness: 12 }
          ] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: colorTexto() } }, tooltip }, scales: { x: { beginAtZero: true, grid: { color: colorLinea() }, border: { display: false }, ticks: { precision: 0, color: colorTexto() } }, y: { grid: { display: false }, border: { display: false }, ticks: { color: colorTexto(), font: { weight: '600' } } } } } });
        }
        if (sociales.length) {
          crear(raiz.querySelector('#mx2-redes'), { type: 'bar', data: { labels: sociales.map(x => NOMBRE_FUENTE[x.k]), datasets: [{ label: 'Personas', data: sociales.map(x => x.total), backgroundColor: sociales.map(x => COLOR_FUENTE[x.k]), borderRadius: 10, borderSkipped: false, barThickness: 22 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => ' ' + num(c.parsed.x) + ' personas (' + Math.round(c.parsed.x / Math.max(1, totSociales) * 100) + '% de las redes)' } } }, scales: { x: { beginAtZero: true, grid: { color: colorLinea() }, border: { display: false }, ticks: { precision: 0, color: colorTexto() } }, y: { grid: { display: false }, border: { display: false }, ticks: { color: colorTexto(), font: { weight: '600' } } } } } });
          crear(raiz.querySelector('#mx2-redes-tiempo'), { type: 'bar', data: { labels: serie.etiquetas, datasets: serieRedes.map(s => ({ label: NOMBRE_FUENTE[s.k], data: s.datos, backgroundColor: COLOR_FUENTE[s.k], borderRadius: 4, borderSkipped: false, maxBarThickness: 30 })) }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: colorTexto() } }, tooltip }, scales: { x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { color: colorTexto(), maxRotation: 0, autoSkipPadding: 14 } }, y: { stacked: true, beginAtZero: true, grid: { color: colorLinea(), drawTicks: false }, border: { display: false }, ticks: { color: colorTexto(), precision: 0, padding: 8 } } } } });
        }
        crear(raiz.querySelector('#mx2-semana'), { type: 'bar', data: { labels: DIAS, datasets: [{ label: 'Visitas por día (promedio)', data: porSemDia.map(v => Math.round(v * 10) / 10), backgroundColor: porSemDia.map((v, i) => (i === diaFuerte && v > 0 ? VERDE : VERDE + '66')), borderRadius: 10, borderSkipped: false, maxBarThickness: 34 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip }, scales: ej } });
        if (topPaises.length) {
          crear(raiz.querySelector('#mx2-paises'), { type: 'bar', data: { labels: topPaises.map(([k]) => nombrePais(k)), datasets: [{ label: 'Personas', data: topPaises.map(([, v]) => v), backgroundColor: topPaises.map(([k], i) => (k === 'MX' ? VERDE : AZUL + (i % 2 ? 'AA' : 'CC'))), borderRadius: 8, borderSkipped: false, barThickness: 18 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip }, scales: { x: { beginAtZero: true, grid: { color: colorLinea() }, border: { display: false }, ticks: { precision: 0, color: colorTexto() } }, y: { grid: { display: false }, border: { display: false }, ticks: { color: colorTexto(), font: { weight: '600' } } } } } });
        }
        const centro = texto => ({ id: 'centro', afterDraw(c) { const { ctx, chartArea: a } = c; ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#111'; ctx.font = "800 28px 'Plus Jakarta Sans',Inter,sans-serif"; ctx.fillText(texto, (a.left + a.right) / 2, (a.top + a.bottom) / 2 + 4); ctx.fillStyle = colorTexto(); ctx.font = "600 10px 'JetBrains Mono',monospace"; ctx.fillText('PERSONAS', (a.left + a.right) / 2, (a.top + a.bottom) / 2 + 22); ctx.restore(); } });
        crear(raiz.querySelector('#mx2-disp'), { type: 'doughnut', data: { labels: Object.values(NOMBRE_DISP), datasets: [{ data: Object.keys(NOMBRE_DISP).map(k => disp[k] || 0), backgroundColor: Object.keys(NOMBRE_DISP).map(k => COLOR_DISP[k]), borderWidth: 0, hoverOffset: 6, borderRadius: 6, spacing: 3 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false }, tooltip } }, plugins: [centro(num(totDisp))] });
        if (ordenFuentes.length) {
          crear(raiz.querySelector('#mx2-fuentes'), { type: 'doughnut', data: { labels: ordenFuentes.map(([k]) => NOMBRE_FUENTE[k] || k), datasets: [{ data: ordenFuentes.map(([, v]) => v), backgroundColor: ordenFuentes.map(([k]) => COLOR_FUENTE[k] || '#64748B'), borderWidth: 0, hoverOffset: 6, borderRadius: 6, spacing: 3 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false }, tooltip } }, plugins: [centro(num(totFuentes))] });
        }
        requestAnimationFrame(() => requestAnimationFrame(() => raiz.querySelectorAll('[data-w]').forEach(el => { el.style.width = el.dataset.w + '%'; })));

        // ── Interacciones ──
        raiz.querySelectorAll('.mx2-seg button').forEach(b => b.addEventListener('click', async () => {
          const r = b.dataset.r;
          estado.rango = r; estado.semana = 0;
          if ((r === 'todo' || r === '365') && diasCargados < 730 && !pintar._pidio) {
            pintar._pidio = true;
            raiz.querySelectorAll('.mx2-seg button').forEach(x => { x.disabled = true; });
            try { const mas = await cargar(730); datos.dias = mas.dias; datos.miembros = mas.miembros; datos.origenes = mas.origenes; datos.sinOrigen = mas.sinOrigen; diasCargados = mas.dias.length; indexar(); } catch (e) { /* se queda con lo cargado */ }
          }
          dibujar();
        }));
        // Registro de visitas por periodo: se pide al servidor, se guarda en memoria un momento y se actualiza solo cada minuto
        const cacheLog = estado.cacheLog || (estado.cacheLog = {});
        const pintarLog = () => {
          const cuerpoLog = raiz.querySelector('#mx2-log');
          if (!cuerpoLog) return;
          const cl = clavesPeriodo(estado.periodo);
          const resumen = raiz.querySelector('#mx2-per-resumen');
          if (resumen) resumen.innerHTML = '<strong>' + num(suma(cl, 'total')) + '</strong> visitas · <strong>' + num(suma(cl, 'unicos')) + '</strong> personas en este periodo';
          const c = cacheLog[estado.periodo];
          const mas = raiz.querySelector('#mx2-log-mas');
          if (!c) { cuerpoLog.innerHTML = '<div class="mx2-empty" style="padding:22px 10px">Cargando visitas…</div>'; if (mas) mas.style.display = 'none'; return; }
          const visibles = estado.visibles;
          cuerpoLog.innerHTML = c.items.length ? c.items.slice(0, visibles).map(filaVisita).join('') : '<div class="mx2-empty" style="padding:22px 10px">Sin visitas registradas en este periodo.</div>';
          const faltan = c.items.length - visibles;
          if (mas) { mas.style.display = faltan > 0 ? '' : 'none'; mas.textContent = 'Ver más (' + faltan + ' restantes)'; }
          const pie = raiz.querySelector('#mx2-log-hora');
          if (pie) pie.textContent = 'Se guarda cada visita sola, sin datos personales · actualizado ' + new Date(c.t).toLocaleTimeString('es-MX', { timeZone: datos.zona, hour: 'numeric', minute: '2-digit' });
        };
        const cargarLog = async (k, silencioso) => {
          try {
            await esperarSesion();
            const token = await Pages._getAuthToken();
            const r = await fetch(Pages._webhookUrl + '/api/admin/visitas?periodo=' + k, { headers: { 'Authorization': 'Bearer ' + token } });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(d.error || 'No se pudo cargar');
            cacheLog[k] = { items: (d.items || []).map(enriquecerVisita), t: Date.now() };
            if (estado.periodo === k) pintarLog();
          } catch (e) {
            if (!silencioso) { const c = raiz.querySelector('#mx2-log'); if (c) c.innerHTML = '<div class="mx2-empty" style="padding:22px 10px">No se pudo cargar el registro: ' + esc(e.message) + '</div>'; }
          }
        };
        pintarLog();
        if (!cacheLog[estado.periodo] || Date.now() - cacheLog[estado.periodo].t > 20000) cargarLog(estado.periodo);
        if (Pages._mxTimer) clearInterval(Pages._mxTimer);
        Pages._mxTimer = setInterval(() => {
          if (!document.getElementById('mx2-log')) { clearInterval(Pages._mxTimer); return; }
          if (document.hidden) return;
          cargarLog(estado.periodo, true);
        }, 60000);
        raiz.querySelector('#mx2-log-mas')?.addEventListener('click', () => { estado.visibles += 20; pintarLog(); });
        raiz.querySelectorAll('.mx2-seg2 button').forEach(b => b.addEventListener('click', () => {
          estado.periodo = b.dataset.per;
          estado.visibles = 10;
          raiz.querySelectorAll('.mx2-seg2 button').forEach(x => x.classList.toggle('on', x === b));
          pintarLog();
          if (!cacheLog[estado.periodo] || Date.now() - cacheLog[estado.periodo].t > 20000) cargarLog(estado.periodo);
        }));
        raiz.querySelector('#mx2-rec-actualizar')?.addEventListener('click', async (ev) => {
          const b = ev.currentTarget; b.disabled = true; b.textContent = 'Actualizando…';
          await cargarLog(estado.periodo);
          b.disabled = false; b.textContent = 'Actualizar';
        });
        raiz.querySelector('#mx2-ant')?.addEventListener('click', () => { estado.semana += 1; dibujar(); });
        raiz.querySelector('#mx2-sig')?.addEventListener('click', () => { if (estado.semana > 0) { estado.semana -= 1; dibujar(); } });
        raiz.querySelector('#mx2-csv')?.addEventListener('click', () => {
          const fuentesCols = Object.keys(NOMBRE_FUENTE);
          const filasCsv = [['fecha', 'visitas', 'personas_distintas', 'miembros_que_entraron', 'telefono', 'tableta', 'computadora', ...fuentesCols.map(k => 'origen_' + k), 'paises', 'cuentas_nuevas']];
          const todos = lista(datos.dias[0].dia, hoy);
          todos.forEach(c => { const d = dato(c); filasCsv.push([c, d.total, d.unicos, d.miembros, d.dispositivos.movil || 0, d.dispositivos.tablet || 0, d.dispositivos.computadora || 0, ...fuentesCols.map(k => (d.fuentes || {})[k] || 0), Object.entries(d.paises || {}).map(([k, v]) => k + ':' + v).join('|'), todasCuentas.filter(o => o.dia === c).length]); });
          const csv = '﻿' + filasCsv.map(f => f.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
          const a = document.createElement('a');
          a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
          a.download = 'historial-visitas-synova-' + hoy + '.csv';
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        });
      };
      dibujar();
    };

    cargar(400).then(pintar).catch(err => {
      raiz.innerHTML = `<div class="mx2-card"><div class="mx2-empty"><b>No se pudieron cargar las métricas</b>${esc(err.message)}<br><button type="button" class="mx2-btn" id="mx2-reintentar" style="margin-top:14px">Reintentar</button></div></div>`;
      raiz.querySelector('#mx2-reintentar')?.addEventListener('click', () => Pages.metricas(p));
    });
  },

  pruebas(p){
    p.innerHTML = `
      <div class="fade-up">
        <div class="sec-hero">
          <span class="sec-hero__eyebrow">Marketing</span>
          <h1 class="sec-hero__title">Pruebas gratuitas</h1>
          <p class="sec-hero__sub">Qué curso de bienvenida eligen las cuentas nuevas como su prueba gratuita y cuántas de ellas terminan pagando la membresía.</p>
        </div>
        <div class="kpi-grid">
          <div class="kpi-card" style="--c1:#1C6FB0;--c2:#5FB6E0;">
            <div class="kpi-card__label">Pruebas elegidas</div>
            <div class="kpi-card__value" id="pg-kpi-elegidas">—</div>
            <div class="kpi-card__sub" id="pg-kpi-elegidas-sub">—</div>
          </div>
          <div class="kpi-card" style="--c1:#F7941D;--c2:#FBBF24;">
            <div class="kpi-card__label">Cuentas nuevas sin elegir</div>
            <div class="kpi-card__value" id="pg-kpi-sin">—</div>
            <div class="kpi-card__sub">Se registraron y todavía no escogen curso</div>
          </div>
          <div class="kpi-card" style="--c1:#14B8A6;--c2:#5EEAD4;">
            <div class="kpi-card__label">Eligieron y ya pagaron</div>
            <div class="kpi-card__value" id="pg-kpi-pagaron">—</div>
            <div class="kpi-card__sub" id="pg-kpi-pagaron-sub">—</div>
          </div>
          <div class="kpi-card" style="--c1:#A855F7;--c2:#C084FC;">
            <div class="kpi-card__label">Pagaron sin elegir curso</div>
            <div class="kpi-card__value" id="pg-kpi-pagaron-sin">—</div>
            <div class="kpi-card__sub" id="pg-kpi-pagaron-sin-sub">Para comparar contra los que sí eligieron</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Cursos más elegidos</h3>
            <canvas id="pg-chart-cursos" height="260"></canvas>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:var(--text);">Pruebas elegidas por día (últimos 14 días)</h3>
            <canvas id="pg-chart-dias" height="260"></canvas>
          </div>
        </div>
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-top:16px;">
          <style>.pg-tabs{display:inline-flex;gap:4px;padding:3px;border:1px solid var(--border);border-radius:999px}.pg-tabs button{border:0;background:transparent;padding:6px 13px;border-radius:999px;font:700 12px Inter,sans-serif;color:var(--text-2);cursor:pointer}.pg-tabs button.on{background:var(--primary);color:#fff}</style>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 12px;">
            <h3 id="pg-lista-titulo" style="margin:0;font-size:14px;color:var(--text);">Últimas pruebas elegidas</h3>
            <div class="pg-tabs" role="tablist" aria-label="Ver cuentas">
              <button type="button" role="tab" data-pg-modo="elegidas" class="on">Eligieron <span id="pg-tab-elegidas"></span></button>
              <button type="button" role="tab" data-pg-modo="sin">Sin elegir <span id="pg-tab-sin"></span></button>
            </div>
          </div>
          <div id="pg-lista" style="font-size:13px;color:var(--text-2);">Cargando…</div>
        </div>
        <p style="font-size:11.5px;color:var(--text-3);margin-top:12px;line-height:1.5;">"Cuentas nuevas" son las creadas desde el <span id="pg-nota-corte">arranque de esta función</span> (la primera vez que alguien eligió su curso de bienvenida). "Pagó" significa que la cuenta tiene o tuvo una membresía.</p>
      </div>`;
    Pages._cargarPruebas();
  },

  async _cargarPruebas(){
    const lista = document.getElementById('pg-lista');
    let miembros = [], cursosPorId = {};
    try {
      await Pages._esperarAdmin();
      // SYNOVA: la "prueba gratuita" es el curso de bienvenida (colección cursos_gratis_elegidos, leída por el webhook)
      const { db, collection, getDocs } = window.__fs;
      const [mSnap, datos] = await Promise.all([getDocs(collection(db, 'miembros')), Pages._api('/api/admin/pruebas')]);
      const porUid = {};
      (datos.items || []).forEach(x => { porUid[x.uid] = x; });
      miembros = mSnap.docs.map(d => {
        const m = { id: d.id, ...d.data() };
        const elegido = porUid[d.id];
        if (elegido) {
          m.cursoPruebaElegido = elegido.titulo || elegido.collectionId;
          m.pruebaElegidaEn = elegido.elegidoEn;
        }
        return m;
      });
      Pages._corteSynova = (datos.items || []).map(x => Date.parse(x.elegidoEn || '')).filter(Number.isFinite).sort((a, b) => a - b)[0] || null;
    } catch (e) {
      console.error('❌ No se pudieron leer las pruebas gratuitas:', e.code || '', e.message);
      if (lista) {
        lista.innerHTML = 'No se pudieron cargar los datos (' + AdminEsc(e.code || e.message || 'error') + '). <a href="#" id="pg-reintentar" style="color:var(--primary);font-weight:700;">Reintentar</a>';
        const re = document.getElementById('pg-reintentar');
        if (re) re.addEventListener('click', ev => { ev.preventDefault(); Pages._cargarPruebas(); });
      }
      return;
    }
    // Fecha de arranque de la función en SYNOVA: la primera vez que alguien eligió su curso de bienvenida
    const CORTE = Pages._corteSynova ? new Date(Pages._corteSynova) : new Date(Date.now() - 30 * 86400000);
    const notaCorte = document.getElementById('pg-nota-corte');
    if (notaCorte) notaCorte.textContent = CORTE.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    const fechaReg = m => Pages._mbToDate(m.fechaRegistro || m.createdAt);
    const pago = m => !!(m.fechaAlta || m.stripeSubscriptionId || m.activa === true || m.activo === true || m.esRegalo === true);
    const nuevas = miembros.filter(m => { const f = fechaReg(m); return f && f >= CORTE; });
    const elegidas = miembros.filter(m => typeof m.cursoPruebaElegido === 'string' && m.cursoPruebaElegido);
    const sinElegir = nuevas.filter(m => !m.cursoPruebaElegido && !pago(m));
    const elegidasPagaron = elegidas.filter(pago);
    const nuevasSinElegir = nuevas.filter(m => !m.cursoPruebaElegido);
    const sinElegirPagaron = nuevasSinElegir.filter(pago);
    const pct = (a, b) => b > 0 ? Math.round(a / b * 100) + '%' : '—';
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('pg-kpi-elegidas', elegidas.length);
    set('pg-kpi-elegidas-sub', nuevas.length ? pct(elegidas.length, nuevas.length) + ' de las cuentas nuevas (' + nuevas.length + ')' : 'Aún no hay cuentas nuevas');
    set('pg-kpi-sin', sinElegir.length);
    set('pg-kpi-pagaron', elegidasPagaron.length);
    set('pg-kpi-pagaron-sub', elegidas.length ? pct(elegidasPagaron.length, elegidas.length) + ' de quienes eligieron' : 'Todavía nadie elige');
    set('pg-kpi-pagaron-sin', sinElegirPagaron.length);
    set('pg-kpi-pagaron-sin-sub', nuevasSinElegir.length ? pct(sinElegirPagaron.length, nuevasSinElegir.length) + ' de las cuentas nuevas que no eligieron' : 'Para comparar contra los que sí eligieron');

    // Cursos más elegidos
    const porCurso = {};
    elegidas.forEach(m => { const t = cursosPorId[m.cursoPruebaElegido] || m.cursoPruebaElegido; porCurso[t] = (porCurso[t] || 0) + 1; });
    const ordenCursos = Object.entries(porCurso).sort((a, b) => b[1] - a[1]).slice(0, 12);
    // Por día (últimos 14)
    const dias = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); dias.push(d); }
    const claveDia = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    const porDia = {};
    elegidas.forEach(m => { const f = Pages._mbToDate(m.pruebaElegidaEn); if (f) porDia[claveDia(f)] = (porDia[claveDia(f)] || 0) + 1; });

    const mostrarVacio = (cv) => { cv.insertAdjacentHTML('afterend', '<p style="margin:24px 0;text-align:center;font-size:13px;color:var(--text-3);">Aún no hay datos.</p>'); cv.style.display = 'none'; };
    const cvCursos = document.getElementById('pg-chart-cursos');
    const cvDias = document.getElementById('pg-chart-dias');
    if (!window.Chart) {
      [cvCursos, cvDias].forEach(cv => { if (cv) { cv.insertAdjacentHTML('afterend', '<p style="margin:24px 0;text-align:center;font-size:13px;color:var(--text-3);">No se pudo cargar la librería de gráficas. Recarga la página.</p>'); cv.style.display = 'none'; } });
    } else {
      Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('--text-2').trim() || '#666';
      if (cvCursos) {
        if (!ordenCursos.length) mostrarVacio(cvCursos);
        else new Chart(cvCursos, { type: 'bar', data: { labels: ordenCursos.map(c => c[0].length > 38 ? c[0].slice(0, 38) + '…' : c[0]), datasets: [{ data: ordenCursos.map(c => c[1]), backgroundColor: '#1C6FB0' }] },
          options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } } });
      }
      if (cvDias) {
        if (!elegidas.length) mostrarVacio(cvDias);
        else new Chart(cvDias, { type: 'bar', data: { labels: dias.map(d => d.getDate() + '/' + (d.getMonth() + 1)), datasets: [{ data: dias.map(d => porDia[claveDia(d)] || 0), backgroundColor: '#14B8A6' }] },
          options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } });
      }
    }

    // Listas: quienes ya eligieron y las cuentas nuevas que todavía no escogen su curso (marcadas "Sin elegir")
    if (lista) {
      const fmt = f => f ? f.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
      const fmtHora = f => f ? f.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Mexico_City' }) + ' · ' + f.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Mexico_City' }) : '—';
      const chip = (txt, fondo, color) => '<span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:' + fondo + ';color:' + color + ';">' + txt + '</span>';
      const chipPago = m => pago(m)
        ? '<span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(52,211,153,.18);color:#0f9f6e;">Pagó</span>'
        : '<span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:var(--surface-3);color:var(--text-2);">Sin pagar</span>';
      const fila = (m, centro, chips, fecha) => {
        const nombre = m.nombre || m.displayName || (m.email || '').split('@')[0] || 'Miembro';
        return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);flex-wrap:wrap;">'
          + '<span style="min-width:0;flex:1 1 220px;"><strong style="color:var(--text);">' + AdminEsc(nombre) + '</strong><br><span style="font-size:11.5px;color:var(--text-3);">' + AdminEsc(m.email || '') + '</span></span>'
          + '<span style="flex:2 1 260px;color:var(--text);">' + centro + '</span>'
          + chips + '<span style="color:var(--text-3);">' + AdminEsc(fecha) + '</span></div>';
      };
      const recientes = elegidas.slice().sort((a, b) => ((Pages._mbToDate(b.pruebaElegidaEn) || 0) - (Pages._mbToDate(a.pruebaElegidaEn) || 0))).slice(0, 15);
      const pendientes = sinElegir.slice().sort((a, b) => ((fechaReg(b) || 0) - (fechaReg(a) || 0))).slice(0, 30);
      const pintar = modo => {
        const titulo = document.getElementById('pg-lista-titulo');
        document.querySelectorAll('[data-pg-modo]').forEach(b => b.classList.toggle('on', b.dataset.pgModo === modo));
        if (modo === 'sin') {
          if (titulo) titulo.textContent = 'Cuentas nuevas que aún no eligen su prueba';
          if (!pendientes.length) { lista.textContent = 'No hay cuentas nuevas pendientes de elegir.'; return; }
          lista.innerHTML = pendientes.map(m => fila(m,
            'Todavía no elige su curso · se registró el ' + AdminEsc(fmtHora(fechaReg(m))),
            chip('Sin elegir', 'rgba(247,148,29,.18)', '#b45309') + chipPago(m),
            fmt(fechaReg(m)))).join('')
            + (sinElegir.length > pendientes.length ? '<p style="margin:10px 0 0;font-size:11.5px;color:var(--text-3);">Mostrando las ' + pendientes.length + ' más recientes de ' + sinElegir.length + '.</p>' : '');
          return;
        }
        if (titulo) titulo.textContent = 'Últimas pruebas elegidas';
        if (!recientes.length) { lista.textContent = 'Todavía nadie ha elegido su prueba gratuita.'; return; }
        lista.innerHTML = recientes.map(m => {
          const curso = cursosPorId[m.cursoPruebaElegido] || m.cursoPruebaElegido;
          return fila(m, AdminEsc(curso), chipPago(m), fmt(Pages._mbToDate(m.pruebaElegidaEn)));
        }).join('');
      };
      set('pg-tab-elegidas', '(' + elegidas.length + ')');
      set('pg-tab-sin', '(' + sinElegir.length + ')');
      document.querySelectorAll('[data-pg-modo]').forEach(b => { b.onclick = () => pintar(b.dataset.pgModo); });
      pintar('elegidas');
    }
  },

};
// En SYNOVA el admin ya está confirmado cuando se pinta una sección (adminready); se conserva la espera por si acaso.
// ═══ Encuestas con dos pestañas: la encuesta del landing (igual que Alintec) y la ruta de la guía virtual ═══
Pages._encTab = 'landing';
Pages.encuestas = function(p){
  // La cabecera es la misma en ambas pestañas; en "ruta" no se descargan las respuestas del landing
  Pages._encSinCarga = Pages._encTab === 'ruta';
  Pages._encuestasLanding(p);
  Pages._encSinCarga = false;
  const hero = p.querySelector('.sec-hero');
  if (!hero) return;
  if (!document.getElementById('enc-tabs-estilos')) {
    const st = document.createElement('style');
    st.id = 'enc-tabs-estilos';
    st.textContent = `.enc-tabs{display:inline-flex;gap:4px;padding:4px;margin:-8px 0 22px;border:1px solid var(--border);border-radius:14px;background:var(--surface)}
.enc-tabs button{border:0;background:transparent;color:var(--text-2);padding:9px 16px;border-radius:10px;font:700 12.5px Inter,sans-serif;cursor:pointer;transition:.18s}
.enc-tabs button:hover{color:var(--text)}.enc-tabs button.on{background:var(--primary);color:#fff;box-shadow:0 4px 14px color-mix(in srgb,var(--primary) 30%,transparent)}
.enc-card{background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px}
.enc-card h3{margin:0 0 12px;font-size:14px;color:var(--text)}
.enc-card p.enc-sub{margin:-6px 0 12px;font-size:12px;color:var(--text-3);line-height:1.5}
.enc-g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:16px;margin-top:16px}
.enc-fila{display:grid;grid-template-columns:110px minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr);gap:4px 12px;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);font-size:12.5px}
.enc-fila:last-child{border-bottom:0}.enc-fila small{color:var(--text-3);font-size:11px}
.enc-chip{display:inline-block;padding:2px 9px;border-radius:999px;font:700 10.5px Inter,sans-serif}
@media(max-width:700px){.enc-fila{grid-template-columns:1fr 1fr}}`;
    document.head.appendChild(st);
  }
  const tabs = document.createElement('div');
  tabs.className = 'enc-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.innerHTML = `<button type="button" role="tab" data-enc-tab="landing" class="${Pages._encTab === 'landing' ? 'on' : ''}">Encuesta del landing</button><button type="button" role="tab" data-enc-tab="ruta" class="${Pages._encTab === 'ruta' ? 'on' : ''}">Ruta de la guía virtual</button>`;
  hero.after(tabs);
  tabs.addEventListener('click', e => {
    const b = e.target.closest('[data-enc-tab]');
    if (!b || b.dataset.encTab === Pages._encTab) return;
    Pages._encTab = b.dataset.encTab;
    Pages.encuestas(p);
  });
  if (Pages._encTab === 'ruta') Pages._rutasGuia(p, tabs);
};

// ─── Ruta de la guía virtual ("Preparar mi ruta", 7 preguntas) ───
Pages._rutasGuia = async function(p, tabs){
  const sub = p.querySelector('.sec-hero__sub');
  if (sub) sub.textContent = 'Resultados de la ruta de la guía virtual del landing · quién la abre, quién la termina, qué responde y qué curso elige al final.';
  // Se reemplaza todo lo que va después de las pestañas
  let n = tabs.nextSibling;
  while (n) { const sig = n.nextSibling; n.remove(); n = sig; }
  const vista = document.createElement('div');
  vista.id = 'ruta-vista';
  vista.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card" style="--c1:#1C6FB0;--c2:#5FB6E0;"><div class="kpi-card__label">Abrieron la ruta</div><div class="kpi-card__value" id="rt-kpi-total">—</div><div class="kpi-card__sub" id="rt-kpi-total-sub">Cada intento cuenta una vez</div></div>
      <div class="kpi-card" style="--c1:#14B8A6;--c2:#5EEAD4;"><div class="kpi-card__label">Completaron las 7 preguntas</div><div class="kpi-card__value" id="rt-kpi-comp">—</div><div class="kpi-card__sub" id="rt-kpi-comp-sub">—</div></div>
      <div class="kpi-card" style="--c1:#F7941D;--c2:#FBBF24;"><div class="kpi-card__label">Se fueron a la mitad</div><div class="kpi-card__value" id="rt-kpi-parcial">—</div><div class="kpi-card__sub">Empezaron y no terminaron</div></div>
      <div class="kpi-card" style="--c1:#94A3B8;--c2:#CBD5E1;"><div class="kpi-card__label">Dijeron "Ahora no"</div><div class="kpi-card__value" id="rt-kpi-desc">—</div><div class="kpi-card__sub">Cerraron la invitación sin empezar</div></div>
      <div class="kpi-card" style="--c1:#A855F7;--c2:#C084FC;"><div class="kpi-card__label">Abrieron un curso</div><div class="kpi-card__value" id="rt-kpi-clic">—</div><div class="kpi-card__sub" id="rt-kpi-clic-sub">—</div></div>
    </div>
    <div class="enc-g2">
      <div class="enc-card"><h3>Perfil de quién responde</h3><canvas id="rt-chart-perfil" height="220"></canvas></div>
      <div class="enc-card"><h3>Área que quieren fortalecer</h3><canvas id="rt-chart-area" height="220"></canvas></div>
    </div>
    <div class="enc-g2">
      <div class="enc-card"><h3>Situación que quieren resolver</h3><canvas id="rt-chart-reto" height="220"></canvas></div>
      <div class="enc-card"><h3>Nivel de profundidad</h3><canvas id="rt-chart-nivel" height="220"></canvas></div>
    </div>
    <div class="enc-g2">
      <div class="enc-card"><h3>Resultado más valioso para ellos</h3><canvas id="rt-chart-objetivo" height="200"></canvas></div>
      <div class="enc-card"><h3>Cómo prefieren avanzar</h3><canvas id="rt-chart-ritmo" height="200"></canvas></div>
    </div>
    <div class="enc-card" style="margin-top:16px"><h3>Tema con el que quieren empezar · para saber qué más ofrecer</h3><canvas id="rt-chart-tema" height="170"></canvas></div>
    <div class="enc-card" style="margin-top:16px"><h3>Dónde se quedan los que no terminan</h3><p class="enc-sub">Última pregunta que alcanzaron a contestar antes de irse. "Sin contestar" son quienes pulsaron "Preparar mi ruta" y se fueron sin elegir nada.</p><canvas id="rt-chart-abandono" height="170"></canvas></div>
    <div class="enc-g2">
      <div class="enc-card"><h3>Cursos que más recomienda la ruta</h3><canvas id="rt-chart-recom" height="240"></canvas></div>
      <div class="enc-card"><h3>Cursos que abrieron desde la ruta</h3><p class="enc-sub">Al tocar un curso del resultado se les lleva a crear su cuenta gratis.</p><canvas id="rt-chart-elegidos" height="220"></canvas></div>
    </div>
    <div class="enc-card" style="margin-top:16px"><h3>Últimas rutas</h3><div id="rt-lista" style="color:var(--text-2);font-size:13px;">Cargando…</div></div>`;
  p.querySelector('.fade-up').appendChild(vista);

  let items = [];
  try {
    await Pages._esperarAdmin();
    const datos = await Pages._api('/api/admin/rutas');
    items = datos.items || [];
  } catch (e) {
    const lista = document.getElementById('rt-lista');
    if (lista) {
      lista.innerHTML = 'No se pudieron cargar los datos (' + AdminEsc(e.message || 'error') + '). <a href="#" id="rt-reintentar" style="color:var(--primary);font-weight:700;">Reintentar</a>';
      document.getElementById('rt-reintentar')?.addEventListener('click', ev => { ev.preventDefault(); Pages.encuestas(p); });
    }
    return;
  }
  if (!document.body.contains(vista)) return;

  const total = items.length;
  const comp = items.filter(x => x.estado === 'completada');
  const parcial = items.filter(x => x.estado === 'parcial');
  const desc = items.filter(x => x.estado === 'descartada');
  const empezaron = comp.length + parcial.length;
  const clic = comp.filter(x => x.cursoElegido);
  const pct = (a, b) => b > 0 ? Math.round(a / b * 100) + '%' : '—';
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('rt-kpi-total', total);
  set('rt-kpi-total-sub', total ? empezaron + ' empezaron a contestar' : 'Aún no hay intentos');
  set('rt-kpi-comp', comp.length);
  set('rt-kpi-comp-sub', empezaron ? pct(comp.length, empezaron) + ' de quienes empezaron' : 'Sin respuestas aún');
  set('rt-kpi-parcial', parcial.length);
  set('rt-kpi-desc', desc.length);
  set('rt-kpi-clic', clic.length);
  set('rt-kpi-clic-sub', comp.length ? pct(clic.length, comp.length) + ' de quienes completaron' : 'Sin rutas completadas');

  const contar = campo => { const o = {}; comp.forEach(x => { const v = x.respuestas && x.respuestas[campo]; if (v) o[v] = (o[v] || 0) + 1; }); return o; };
  const ORDEN = [['perfil', 'Sobre ti'], ['area', 'Tu área'], ['reto', 'Tu reto'], ['nivel', 'Tu experiencia'], ['objetivo', 'Tu objetivo'], ['ritmo', 'Tu ritmo'], ['tema', 'Primer paso']];
  const abandono = { 'Sin contestar': 0 };
  ORDEN.forEach(([, n]) => { abandono[n] = 0; });
  parcial.forEach(x => {
    const ultima = [...ORDEN].reverse().find(([k]) => x.respuestas && x.respuestas[k]);
    abandono[ultima ? ultima[1] : 'Sin contestar']++;
  });
  Object.keys(abandono).forEach(k => { if (!abandono[k]) delete abandono[k]; });
  const recom = {}, elegidos = {};
  comp.forEach(x => { (x.recomendados || []).forEach(t => { recom[t] = (recom[t] || 0) + 1; }); if (x.cursoElegido) elegidos[x.cursoElegido] = (elegidos[x.cursoElegido] || 0) + 1; });
  const top = (o, n) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => [k.length > 34 ? k.slice(0, 34) + '…' : k, v]));

  const sinDatos = (cv, datos) => {
    if (Object.keys(datos).length) return false;
    cv.insertAdjacentHTML('afterend', '<p style="margin:24px 0;text-align:center;font-size:13px;color:var(--text-3);">Aún no hay respuestas para esta pregunta.</p>');
    cv.style.display = 'none';
    return true;
  };
  if (!window.Chart) {
    vista.querySelectorAll('canvas').forEach(cv => { cv.insertAdjacentHTML('afterend', '<p style="margin:24px 0;text-align:center;font-size:13px;color:var(--text-3);">No se pudo cargar la librería de gráficas. Recarga la página.</p>'); cv.style.display = 'none'; });
  } else {
    Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('--text-2').trim() || '#666';
    const colores = ['#1C6FB0', '#14B8A6', '#F7941D', '#D4537E', '#A855F7', '#9CA3AF'];
    const pie = (id, datos) => { const cv = document.getElementById(id); if (!cv || sinDatos(cv, datos)) return;
      new Chart(cv, { type: 'pie', data: { labels: Object.keys(datos), datasets: [{ data: Object.values(datos), backgroundColor: colores }] }, options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } } }); };
    const barra = (id, datos, color, horizontal) => { const cv = document.getElementById(id); if (!cv || sinDatos(cv, datos)) return;
      new Chart(cv, { type: 'bar', data: { labels: Object.keys(datos), datasets: [{ data: Object.values(datos), backgroundColor: color }] },
        options: { indexAxis: horizontal ? 'y' : 'x', plugins: { legend: { display: false } }, scales: horizontal ? { x: { beginAtZero: true, ticks: { precision: 0 } } } : { y: { beginAtZero: true, ticks: { precision: 0 } } } } }); };
    pie('rt-chart-perfil', contar('perfil'));
    pie('rt-chart-area', contar('area'));
    barra('rt-chart-reto', contar('reto'), '#14B8A6', true);
    barra('rt-chart-nivel', contar('nivel'), '#1C6FB0', false);
    barra('rt-chart-objetivo', contar('objetivo'), '#F7941D', true);
    barra('rt-chart-ritmo', contar('ritmo'), '#A855F7', false);
    barra('rt-chart-tema', contar('tema'), '#14B8A6', true);
    barra('rt-chart-abandono', abandono, '#D4537E', true);
    barra('rt-chart-recom', top(recom, 10), '#1C6FB0', true);
    barra('rt-chart-elegidos', top(elegidos, 10), '#A855F7', true);
  }

  const lista = document.getElementById('rt-lista');
  if (lista) {
    const msDe = x => Date.parse(x.actualizado || x.creado || '') || 0;
    const recientes = items.filter(x => x.estado !== 'descartada').sort((a, b) => msDe(b) - msDe(a)).slice(0, 25);
    const zona = 'America/Mexico_City';
    const fecha = x => { const ms = msDe(x); return ms ? new Date(ms).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: zona }) + ' · ' + new Date(ms).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: zona }) : '—'; };
    const chip = x => x.estado === 'completada'
      ? '<span class="enc-chip" style="background:rgba(20,184,166,.16);color:#0F9F8F">Completó</span>'
      : '<span class="enc-chip" style="background:rgba(247,148,29,.18);color:#C9740A">Se quedó en ' + (x.pasos || 0) + ' de 7</span>';
    lista.innerHTML = recientes.length ? recientes.map(x => {
      const r = x.respuestas || {};
      return `<div class="enc-fila"><small>${AdminEsc(fecha(x))}</small><span><strong style="color:var(--text)">${AdminEsc(r.perfil || '—')}</strong><br><small>${AdminEsc(r.area || '')}</small></span><span>${chip(x)}<br><small>${AdminEsc(r.tema ? 'Empezaría con: ' + r.tema : '')}</small></span><span>${x.cursoElegido ? '<small>Abrió</small><br><strong style="color:var(--text)">' + AdminEsc(x.cursoElegido) + '</strong>' : '<small>' + (x.estado === 'completada' ? 'No abrió ningún curso' : '—') + '</small>'}</span></div>`;
    }).join('') : 'Todavía nadie ha hecho la ruta de la guía.';
  }
};

Pages.correos = function(p){
  const miembros = ((window.Store && window.Store.miembros) || [])
    .filter(m => m && m.email && !/^(teccapitalweb|synovamexico)@/i.test(String(m.email)))
    .sort((a, b) => String(a.nombre || a.displayName || a.email).localeCompare(String(b.nombre || b.displayName || b.email), 'es'));
  if (!miembros.length && window.Store && typeof window.Store.subscribe === 'function') {
    const stop = window.Store.subscribe(what => {
      if (what !== 'miembros' || !window.Store.miembros.length) return;
      stop();
      if (p.dataset.live === 'correos') Pages.correos(p);
    });
  }
  const destinatarios = miembros.map(m => {
    const nombre = m.nombre || m.displayName || String(m.email).split('@')[0] || 'Cuenta';
    const uid = String(m.uid || m.id || '');
    return `<label class="ce-recipient" data-ce-search="${AdminEsc((nombre + ' ' + m.email).toLowerCase())}"><input type="checkbox" value="${AdminEsc(uid)}"><span><strong>${AdminEsc(nombre)}</strong><small>${AdminEsc(m.email)}</small></span></label>`;
  }).join('');
  p.innerHTML = `<div class="fade-up ce-page">
    <style>
      .ce-page{--ce-cyan:#2fd1c6;--ce-blue:#1c6fb0}.ce-hero{background:linear-gradient(135deg,#0b2940,#173f61 62%,#1c6fb0);border-radius:22px;padding:30px 32px;color:#fff;box-shadow:0 18px 45px rgba(13,46,73,.18);position:relative;overflow:hidden}.ce-hero:after{content:"";position:absolute;width:260px;height:260px;border:1px solid rgba(255,255,255,.12);border-radius:50%;right:-95px;top:-150px}.ce-hero small{display:inline-flex;align-items:center;gap:7px;font:700 10px 'JetBrains Mono',monospace;letter-spacing:1.5px;text-transform:uppercase;color:#8ff1ea}.ce-hero h1{margin:12px 0 7px;font:800 clamp(31px,5vw,45px)/1 'Plus Jakarta Sans',sans-serif;letter-spacing:-1.5px}.ce-hero p{max-width:690px;margin:0;color:#d6e7f4;font-size:14px;line-height:1.6}.ce-status,.ce-panel{margin-top:18px;background:var(--surface);border:1px solid var(--border-2);border-radius:18px;padding:20px}.ce-status{display:flex;align-items:center;justify-content:space-between;gap:18px;border-left:4px solid var(--text-3)}.ce-status.on{border-left-color:var(--success)}.ce-status__copy small{display:block;font:700 9px 'JetBrains Mono',monospace;letter-spacing:1.3px;color:var(--text-3);text-transform:uppercase}.ce-status__copy strong{display:block;margin-top:5px;font:800 21px 'Plus Jakarta Sans',sans-serif}.ce-status__copy span{display:block;margin-top:4px;font-size:12px;color:var(--text-2)}.ce-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:14px}.ce-kpis.delivery{grid-template-columns:repeat(5,minmax(0,1fr))}.ce-kpi{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:17px}.ce-kpi span{display:block;font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:var(--text-3)}.ce-kpi strong{display:block;margin-top:7px;font:800 27px 'Plus Jakarta Sans',sans-serif}.ce-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}.ce-mail{padding:19px;border-radius:17px;background:linear-gradient(145deg,color-mix(in srgb,var(--ce-blue) 7%,var(--surface)),var(--surface));border:1px solid var(--border)}.ce-mail__num{width:32px;height:32px;border-radius:10px;background:color-mix(in srgb,var(--ce-cyan) 17%,transparent);color:var(--primary);display:grid;place-items:center;font:800 11px 'JetBrains Mono',monospace}.ce-mail h3{margin:13px 0 7px;font-size:15px}.ce-mail p{margin:0;color:var(--text-2);font-size:12px;line-height:1.55}.ce-mail b{display:inline-block;margin-top:12px;font-size:11px;color:var(--primary)}.ce-bulk{display:grid;grid-template-columns:minmax(260px,1fr) minmax(300px,1.4fr);gap:16px}.ce-recipient-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.ce-recipient-search{flex:1;min-width:190px;height:42px;padding:0 12px;border:1px solid var(--border-2);border-radius:10px;background:var(--surface-2);color:var(--text)}.ce-recipient-list{max-height:300px;overflow:auto;margin-top:10px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2)}.ce-recipient{display:flex;align-items:center;gap:10px;padding:10px 12px;border-top:1px solid var(--border);cursor:pointer}.ce-recipient:first-child{border-top:0}.ce-recipient:hover{background:color-mix(in srgb,var(--ce-blue) 6%,var(--surface))}.ce-recipient input{width:17px;height:17px;accent-color:var(--primary)}.ce-recipient span{min-width:0}.ce-recipient strong,.ce-recipient small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ce-recipient small{margin-top:2px;color:var(--text-3);font-size:10px}.ce-selected{margin-top:9px;color:var(--text-2);font-size:11px}.ce-send{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ce-send button{min-height:43px}.ce-lists{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.ce-list{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:17px}.ce-list h3{margin:0 0 10px;font-size:14px}.ce-list>p{margin:-5px 0 10px;color:var(--text-3);font-size:10.5px}.ce-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:10px 0;border-top:1px solid var(--border);font-size:12px}.ce-row:first-of-type{border-top:0}.ce-row strong,.ce-row small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ce-row small{color:var(--text-3);margin-top:3px}.ce-chip{display:inline-block;padding:3px 7px;border-radius:999px;background:color-mix(in srgb,var(--text-3) 13%,transparent);font-size:9px;font-weight:800;text-transform:uppercase}.ce-chip.delivered{background:rgba(34,197,94,.13);color:#15803d}.ce-chip.failed{background:rgba(239,68,68,.13);color:#dc2626}.ce-chip.sent{background:rgba(28,111,176,.13);color:#1c6fb0}.ce-chip.delayed,.ce-chip.scheduled,.ce-chip.sending{background:rgba(247,148,29,.15);color:#c66c00}.ce-empty{font-size:12px;color:var(--text-3);padding:9px 0}.ce-result{min-height:20px;margin-top:10px;color:var(--text-2);font-size:12px}.ce-result.ok{color:var(--success)}.ce-result.err{color:var(--danger)}
      @media(max-width:1050px){.ce-kpis.delivery{grid-template-columns:repeat(3,1fr)}}@media(max-width:900px){.ce-kpis{grid-template-columns:repeat(2,1fr)}.ce-flow,.ce-bulk,.ce-lists{grid-template-columns:1fr}}@media(max-width:520px){.ce-hero{padding:24px 20px}.ce-status{align-items:flex-start;flex-direction:column}.ce-send{grid-template-columns:1fr}.ce-kpis.delivery{grid-template-columns:repeat(2,1fr)}.ce-page .btn{width:100%;justify-content:center}}
    </style>
    <section class="ce-hero"><small>✉ Marketing · Conversión</small><h1>Correos</h1><p>Tres mensajes breves y atractivos para cuentas que aún no son VIP: beneficios a las 12 h, $50 MXN menos 12 h después y un último beneficio de $100 MXN 24 h más tarde.</p></section>
    <section class="ce-status" id="ce-status"><div class="ce-status__copy"><small>Estado de la automatización</small><strong id="ce-status-title">Consultando…</strong><span id="ce-status-sub">La campaña se mantiene apagada hasta que la actives aquí.</span></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-outline btn-sm" id="ce-run" type="button">Ejecutar ahora</button><button class="btn btn-primary btn-sm" id="ce-mode" type="button" disabled>Activar campaña</button></div></section>
    <div class="ce-kpis"><div class="ce-kpi"><span>En seguimiento</span><strong id="ce-kpi-receiving">—</strong></div><div class="ce-kpi"><span>Contactadas</span><strong id="ce-kpi-sent">—</strong></div><div class="ce-kpi"><span>Se volvieron VIP</span><strong id="ce-kpi-converted">—</strong></div><div class="ce-kpi"><span>Bajas</span><strong id="ce-kpi-unsubscribed">—</strong></div></div>
    <div class="ce-kpis delivery"><div class="ce-kpi"><span>Historial</span><strong id="ce-mail-total">—</strong></div><div class="ce-kpi"><span>Pendientes</span><strong id="ce-mail-pending">—</strong></div><div class="ce-kpi"><span>Aceptados</span><strong id="ce-mail-sent">—</strong></div><div class="ce-kpi"><span>Entregados</span><strong id="ce-mail-delivered">—</strong></div><div class="ce-kpi"><span>Fallidos</span><strong id="ce-mail-failed">—</strong></div></div>
    <div class="ce-flow"><article class="ce-mail"><span class="ce-mail__num">01</span><h3>🩺 Tu lugar te espera</h3><p>Beneficios VIP claros: cursos clínicos, herramientas, clases y certificados.</p><b>12 horas después del registro</b></article><article class="ce-mail"><span class="ce-mail__num">02</span><h3>🎁 $50 MXN menos</h3><p>Código personal de un uso para el primer plan mensual o anual.</p><b>12 horas después · vence en 24 h</b></article><article class="ce-mail"><span class="ce-mail__num">03</span><h3>⏳ $100 MXN menos</h3><p>Último llamado breve, urgente y sin mensajes posteriores.</p><b>24 horas después · vence en 24 h</b></article></div>
    <section class="ce-panel"><div style="margin-bottom:14px"><span style="font:700 9px 'JetBrains Mono',monospace;letter-spacing:1.3px;color:var(--primary)">ENVÍO REAL</span><h2 style="margin:5px 0 4px;font-size:20px">Enviar a varias cuentas</h2><p style="margin:0;color:var(--text-2);font-size:12px">Selecciona hasta 50 personas por lote. El correo conserva el mensaje profesional y no altera su horario automático.</p></div><div class="ce-bulk"><div><div class="ce-recipient-tools"><input class="ce-recipient-search" id="ce-search" type="search" placeholder="Buscar nombre o correo"><button class="btn btn-outline btn-sm" id="ce-select-visible" type="button">Seleccionar visibles</button><button class="btn btn-outline btn-sm" id="ce-clear" type="button">Limpiar</button></div><div class="ce-recipient-list" id="ce-recipients">${destinatarios || '<div class="ce-empty" style="padding:14px">No hay cuentas con correo.</div>'}</div><div class="ce-selected" id="ce-selected">0 seleccionadas · máximo 50 por envío</div></div><div><div class="ce-send"><button class="btn btn-outline btn-sm" data-ce-step="1">Enviar beneficios</button><button class="btn btn-outline btn-sm" data-ce-step="2">Enviar $50</button><button class="btn btn-primary btn-sm" data-ce-step="3">Enviar $100</button></div><div class="ce-result" id="ce-result" role="status"></div></div></div></section>
    <div class="ce-lists"><section class="ce-list"><h3>Próximos envíos</h3><p>Quién falta, qué mensaje recibirá y cuándo.</p><div id="ce-upcoming"><div class="ce-empty">Cargando…</div></div></section><section class="ce-list"><h3>Historial de entrega</h3><p>Resend confirma si fue aceptado, entregado o falló.</p><div id="ce-latest"><div class="ce-empty">Cargando…</div></div></section></div>
  </div>`;

  const result = p.querySelector('#ce-result');
  const setResult = (text, type) => { if (!result) return; result.textContent = text || ''; result.className = 'ce-result ' + (type || ''); };
  const selectedUids = () => [...p.querySelectorAll('#ce-recipients input[type="checkbox"]:checked')].map(input => input.value);
  const updateSelected = () => {
    const count = selectedUids().length;
    const label = p.querySelector('#ce-selected');
    if (label) label.textContent = `${count.toLocaleString('es-MX')} seleccionada${count === 1 ? '' : 's'} · máximo 50 por envío`;
    p.querySelectorAll('[data-ce-step]').forEach(button => { button.disabled = count === 0 || count > 50; });
  };
  p.querySelector('#ce-recipients')?.addEventListener('change', event => {
    if (event.target.matches('input[type="checkbox"]')) updateSelected();
  });
  p.querySelector('#ce-search')?.addEventListener('input', event => {
    const query = String(event.target.value || '').trim().toLowerCase();
    p.querySelectorAll('.ce-recipient').forEach(row => { row.hidden = Boolean(query) && !String(row.dataset.ceSearch || '').includes(query); });
  });
  p.querySelector('#ce-select-visible')?.addEventListener('click', () => {
    const visible = [...p.querySelectorAll('.ce-recipient:not([hidden]) input[type="checkbox"]')];
    const already = selectedUids().length;
    visible.slice(0, Math.max(0, 50 - already)).forEach(input => { input.checked = true; });
    updateSelected();
  });
  p.querySelector('#ce-clear')?.addEventListener('click', () => {
    p.querySelectorAll('#ce-recipients input[type="checkbox"]:checked').forEach(input => { input.checked = false; });
    updateSelected();
  });
  p.querySelectorAll('[data-ce-step]').forEach(button => button.addEventListener('click', async () => {
    const uids = selectedUids();
    if (!uids.length) { setResult('Selecciona al menos una cuenta.', 'err'); return; }
    if (uids.length > 50) { setResult('El máximo es de 50 cuentas por lote.', 'err'); return; }
    const step = Number(button.dataset.ceStep);
    const labels = { 1:'beneficios', 2:'$50 MXN', 3:'$100 MXN' };
    if (!confirm(`Se enviará el correo de ${labels[step]} a ${uids.length} cuenta${uids.length === 1 ? '' : 's'} seleccionada${uids.length === 1 ? '' : 's'}. ¿Continuar?`)) return;
    const original = button.textContent;
    p.querySelectorAll('[data-ce-step]').forEach(item => { item.disabled = true; });
    button.textContent = 'Enviando…'; setResult(`Enviando ${uids.length} correo${uids.length === 1 ? '' : 's'} real${uids.length === 1 ? '' : 'es'}…`);
    try {
      const data = await Pages._api('/admin/conversion-emails/send-bulk', { method:'POST', body:JSON.stringify({ uids, step }) });
      const detail = `${data.sent || 0} enviado${data.sent === 1 ? '' : 's'}${data.failed ? ` · ${data.failed} fallido${data.failed === 1 ? '' : 's'}` : ''}.`;
      setResult(detail, data.failed ? 'err' : 'ok');
      if (window.Toast) (data.failed ? Toast.info : Toast.success)('Envío terminado', detail);
      await Pages._cargarCorreos(p);
    } catch (error) {
      setResult(error.message || 'No se pudo enviar.', 'err');
      if (window.Toast) Toast.error('No se pudo enviar', error.message || 'Revisa el backend');
    } finally { button.textContent = original; updateSelected(); }
  }));
  updateSelected();
  p.querySelector('#ce-mode').addEventListener('click', async buttonEvent => {
    const button = buttonEvent.currentTarget;
    const next = button.dataset.mode === 'active' ? 'off' : 'active';
    if (!confirm(next === 'active' ? '¿Activar los envíos automáticos?' : '¿Pausar la campaña?')) return;
    button.disabled = true;
    try {
      await Pages._api('/admin/conversion-emails/mode', { method:'PATCH', body:JSON.stringify({ mode:next }) });
      if (window.Toast) Toast.success(next === 'active' ? 'Campaña activada' : 'Campaña pausada');
      await Pages._cargarCorreos(p);
    } catch (error) { if (window.Toast) Toast.error('No se pudo actualizar', error.message); }
  });
  p.querySelector('#ce-run').addEventListener('click', async buttonEvent => {
    const button = buttonEvent.currentTarget; button.disabled = true; button.textContent = 'Revisando…';
    try {
      const data = await Pages._api('/admin/conversion-emails/run', { method:'POST', body:'{}' });
      const detail = data.skipped === 'off' ? 'La campaña está apagada; no se envió nada.' : `${data.sent || 0} enviado(s), ${data.failed || 0} fallo(s).`;
      if (window.Toast) Toast.info('Ejecución terminada', detail);
      await Pages._cargarCorreos(p);
    } catch (error) { if (window.Toast) Toast.error('No se pudo ejecutar', error.message); }
    finally { button.disabled = false; button.textContent = 'Ejecutar ahora'; }
  });
  Pages._cargarCorreos(p);
};

Pages._cargarCorreos = async function(p){
  try {
    await Pages._esperarAdmin();
    const data = await Pages._api('/admin/conversion-emails');
    if (!document.body.contains(p) || (p.dataset.live && p.dataset.live !== 'correos')) return;
    const mode = data.mode === 'active' ? 'active' : 'off';
    const status = p.querySelector('#ce-status'); if (status) status.classList.toggle('on', mode === 'active');
    const title = p.querySelector('#ce-status-title'); if (title) title.textContent = mode === 'active' ? 'Campaña activa' : 'Campaña apagada';
    const sub = p.querySelector('#ce-status-sub'); if (sub) sub.textContent = mode === 'active' ? 'El servidor revisa nuevos envíos cada 15 minutos.' : 'Puedes enviar demostraciones; no se enviará nada automáticamente.';
    const modeButton = p.querySelector('#ce-mode'); if (modeButton) { modeButton.disabled = false; modeButton.dataset.mode = mode; modeButton.textContent = mode === 'active' ? 'Pausar campaña' : 'Activar campaña'; }
    const counts = data.counts || {};
    ['receiving','sent','converted','unsubscribed'].forEach(key => { const el = p.querySelector('#ce-kpi-' + key); if (el) el.textContent = Number(counts[key] || 0).toLocaleString('es-MX'); });
    const emailCounts = data.emailCounts || {};
    ['total','pending','sent','delivered','failed'].forEach(key => { const el = p.querySelector('#ce-mail-' + key); if (el) el.textContent = Number(emailCounts[key] || 0).toLocaleString('es-MX'); });
    const when = ms => Number(ms) ? new Date(Number(ms)).toLocaleString('es-MX', { dateStyle:'medium', timeStyle:'short', timeZone:'America/Mexico_City' }) : '—';
    const row = (item, date, label) => `<div class="ce-row"><span><strong>${AdminEsc(item.name || item.email || 'Cuenta')}</strong><small>${AdminEsc(item.email || '')}</small></span><span style="text-align:right"><strong>${AdminEsc(label)}</strong><small>${AdminEsc(date)}</small></span></div>`;
    const upcoming = p.querySelector('#ce-upcoming'); if (upcoming) upcoming.innerHTML = (data.upcoming || []).length ? data.upcoming.map(item => row(item, when(item.dueMs), `Mensaje ${item.step}`)).join('') : '<div class="ce-empty">No hay envíos pendientes.</div>';
    const deliveryLabels = { delivered:'Entregado', failed:'Falló', sent:'Aceptado', delayed:'Demorado', scheduled:'Programado', sending:'Preparando' };
    const deliveries = (data.emailHistory || []).length ? data.emailHistory : (data.latest || []).map(item => ({
      ...item, status:'sent', acceptedAtMs:item.sentMs, legacy:true
    }));
    const latest = p.querySelector('#ce-latest'); if (latest) latest.innerHTML = deliveries.length ? deliveries.map(item => {
      const status = item.status || 'sent';
      const atMs = item.deliveredAtMs || item.failedAtMs || item.acceptedAtMs || item.createdAtMs;
      return `<div class="ce-row"><span><strong>${AdminEsc(item.name || item.email || 'Cuenta')}</strong><small>${AdminEsc(item.email || '')} · Mensaje ${Number(item.step || 0)}${item.manual ? ' · manual' : ''}${item.legacy ? ' · registro anterior' : ''}</small></span><span style="text-align:right"><span class="ce-chip ${AdminEsc(status)}">${AdminEsc(deliveryLabels[status] || status)}</span><small>${AdminEsc(when(atMs))}</small></span></div>`;
    }).join('') : '<div class="ce-empty">Todavía no hay correos en el historial.</div>';
  } catch (error) {
    const title = p.querySelector('#ce-status-title'); if (title) title.textContent = 'No se pudo cargar';
    const sub = p.querySelector('#ce-status-sub'); if (sub) sub.textContent = error.message || 'Revisa que el backend más reciente esté desplegado.';
    const modeButton = p.querySelector('#ce-mode'); if (modeButton) modeButton.disabled = true;
  }
};

// ─────────── CANJES DE CUPONES · Stripe + historial propio ───────────
Pages.cupones = function(p){
  p.innerHTML = `<div class="fade-up cr-page">
    <style>
      .cr-page{--cr-blue:#1c6fb0;--cr-cyan:#2fd1c6}.cr-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:28px 30px;border-radius:22px;background:linear-gradient(135deg,#071827,#0d3150 58%,#1c6fb0);color:#fff;box-shadow:0 18px 45px rgba(13,46,73,.2)}.cr-hero small{font:700 10px 'JetBrains Mono',monospace;letter-spacing:1.4px;text-transform:uppercase;color:#83ebe4}.cr-hero h1{margin:9px 0 6px;font:800 clamp(29px,5vw,43px)/1 'Plus Jakarta Sans',sans-serif}.cr-hero p{max-width:680px;margin:0;color:#cee2f0;font-size:13px;line-height:1.6}.cr-search{display:flex;gap:8px;min-width:310px}.cr-search input{min-width:185px;height:42px;padding:0 12px;border:1px solid rgba(255,255,255,.22);border-radius:11px;background:rgba(255,255,255,.09);color:#fff;text-transform:uppercase;font:700 12px 'JetBrains Mono',monospace}.cr-search input::placeholder{color:#aac0d0}.cr-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:15px}.cr-kpi,.cr-panel{background:var(--surface);border:1px solid var(--border);border-radius:17px}.cr-kpi{padding:17px;position:relative;overflow:hidden}.cr-kpi:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--cc,var(--cr-cyan))}.cr-kpi span{display:block;color:var(--text-3);font-size:9.5px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}.cr-kpi strong{display:block;margin:8px 0 3px;color:var(--text);font:800 27px/1 'Plus Jakarta Sans',sans-serif}.cr-kpi small{color:var(--text-3);font-size:10.5px}.cr-note{margin-top:14px;padding:13px 16px;border:1px solid color-mix(in srgb,var(--cr-blue) 25%,var(--border));border-radius:13px;background:color-mix(in srgb,var(--cr-blue) 6%,var(--surface));color:var(--text-2);font-size:11.5px;line-height:1.55}.cr-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:14px;margin-top:14px}.cr-panel{min-width:0;padding:18px}.cr-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.cr-head h2{margin:0;font-size:16px}.cr-head small{display:block;margin-top:4px;color:var(--text-3)}.cr-table-wrap{overflow:auto}.cr-table{width:100%;border-collapse:collapse;font-size:11.5px}.cr-table th{padding:9px 10px;text-align:left;color:var(--text-3);font-size:9px;letter-spacing:.7px;text-transform:uppercase;border-bottom:1px solid var(--border)}.cr-table td{padding:11px 10px;border-bottom:1px solid var(--border);color:var(--text-2);vertical-align:middle}.cr-table tr:last-child td{border-bottom:0}.cr-table strong{display:block;color:var(--text);font-size:11.5px}.cr-table small{display:block;margin-top:3px;color:var(--text-3)}.cr-code{display:inline-block;padding:4px 7px;border-radius:7px;background:color-mix(in srgb,var(--cr-cyan) 13%,var(--surface-2));color:var(--primary);font:700 10px 'JetBrains Mono',monospace}.cr-status{display:inline-block;padding:4px 7px;border-radius:999px;font-size:9px;font-weight:800;text-transform:uppercase}.cr-status.redeemed{background:rgba(34,197,94,.13);color:#16803c}.cr-status.pending{background:rgba(247,148,29,.15);color:#bd6900}.cr-status.payment_failed{background:rgba(239,68,68,.13);color:#dc2626}.cr-empty,.cr-loading{padding:34px;text-align:center;color:var(--text-3);font-size:12px}.cr-loading:before{content:'';display:block;width:22px;height:22px;margin:0 auto 10px;border:2px solid var(--border);border-top-color:var(--cr-cyan);border-radius:50%;animation:cr-spin .8s linear infinite}@keyframes cr-spin{to{transform:rotate(360deg)}}
      @media(max-width:1100px){.cr-kpis{grid-template-columns:repeat(3,1fr)}.cr-layout{grid-template-columns:1fr}}@media(max-width:720px){.cr-hero{align-items:stretch;flex-direction:column}.cr-search{min-width:0}.cr-search input{min-width:0;flex:1}.cr-kpis{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.cr-hero{padding:23px 19px}.cr-search{display:grid}.cr-kpis{grid-template-columns:1fr 1fr}.cr-kpi{padding:14px}.cr-kpi strong{font-size:23px}}
    </style>
    <section class="cr-hero"><div><small>Stripe · auditoría de promociones</small><h1>Canjes de cupones</h1><p>Controla los usos oficiales del código y revisa quién obtuvo el descuento, cuánto pagó y si una misma persona hizo más de una compra.</p></div><form class="cr-search" id="cr-form"><input id="cr-code" maxlength="80" autocomplete="off" placeholder="Código configurado"><button class="btn btn-primary btn-sm" type="submit">Consultar</button></form></section>
    <div id="cr-body" class="cr-loading">Consultando Stripe y el historial…</div>
  </div>`;
  const form = p.querySelector('#cr-form');
  form.addEventListener('submit', event => { event.preventDefault(); Pages._cargarCupones(p, p.querySelector('#cr-code').value); });
  Pages._cargarCupones(p, '');
};

Pages._cargarCupones = async function(p, code){
  const body = p.querySelector('#cr-body');
  if (!body) return;
  body.className = 'cr-loading'; body.textContent = 'Consultando Stripe y el historial…';
  const money = (cents, currency = 'mxn') => new Intl.NumberFormat('es-MX', { style:'currency', currency:String(currency || 'mxn').toUpperCase() }).format((Number(cents) || 0) / 100);
  const when = ms => Number(ms) ? new Date(Number(ms)).toLocaleString('es-MX', { dateStyle:'medium', timeStyle:'short', timeZone:'America/Mexico_City' }) : '—';
  const csvCell = value => `"${String(value == null ? '' : value).replace(/"/g, '""')}"`;
  try {
    await Pages._esperarAdmin();
    const query = code ? `?code=${encodeURIComponent(String(code).trim().toUpperCase())}` : '';
    const data = await Pages._api('/admin/coupon-redemptions' + query);
    if (!document.body.contains(p) || (p.dataset.live && p.dataset.live !== 'cupones')) return;
    const input = p.querySelector('#cr-code'); if (input) input.value = data.trackedCode || code || '';
    const counts = data.counts || {}, promotion = data.promotion || {}, history = data.history || [], people = data.people || [];
    const currency = promotion.currency || history[0]?.currency || 'mxn';
    const official = promotion.found ? Number(promotion.timesRedeemed || 0) : Number(counts.recorded || 0);
    const limit = promotion.found && promotion.maxRedemptions != null ? Number(promotion.maxRedemptions) : null;
    const discrepancy = promotion.found && official !== Number(counts.recorded || 0)
      ? `Stripe reporta ${official} uso(s), pero el historial detallado contiene ${Number(counts.recorded || 0)}. Los usos anteriores al despliegue no pueden reconstruirse con el webhook.` : '';
    const statusText = { redeemed:'Canjeado', pending:'Pendiente', payment_failed:'Pago fallido' };
    const peopleRows = people.length ? people.map(person => `<tr><td><strong>${AdminEsc(person.name || person.email || 'Cuenta')}</strong><small>${AdminEsc(person.email || '')}</small></td><td><strong>${Number(person.uses || 0).toLocaleString('es-MX')}</strong><small>compra(s)</small></td><td>${AdminEsc(money(person.discountCents, currency))}</td><td>${AdminEsc(money(person.revenueCents, currency))}</td><td>${AdminEsc(when(person.lastRedeemedAtMs))}</td></tr>`).join('') : '<tr><td colspan="5" class="cr-empty">Aún no hay personas registradas con este código.</td></tr>';
    const historyRows = history.length ? history.map(item => `<tr><td>${AdminEsc(when(item.redeemedAtMs))}</td><td><strong>${AdminEsc(item.name || item.email || 'Cuenta')}</strong><small>${AdminEsc(item.email || '')}</small></td><td><span class="cr-code">${AdminEsc(item.code || data.trackedCode || '—')}</span><small>${AdminEsc(item.plan || 'plan no indicado')}</small></td><td>${AdminEsc(money(item.amountSubtotal, item.currency || currency))}</td><td>${AdminEsc(money(item.amountDiscount, item.currency || currency))}</td><td>${AdminEsc(money(item.amountTotal, item.currency || currency))}</td><td><span class="cr-status ${AdminEsc(item.status)}">${AdminEsc(statusText[item.status] || item.status)}</span></td></tr>`).join('') : '<tr><td colspan="7" class="cr-empty">Aún no hay canjes detallados para este código.</td></tr>';
    body.className = '';
    body.innerHTML = `<div class="cr-kpis"><article class="cr-kpi" style="--cc:#1c6fb0"><span>Usos en Stripe</span><strong>${official.toLocaleString('es-MX')}${limit == null ? '' : ' / ' + limit.toLocaleString('es-MX')}</strong><small>contador oficial del código</small></article><article class="cr-kpi" style="--cc:#2fd1c6"><span>Personas distintas</span><strong>${Number(counts.people || 0).toLocaleString('es-MX')}</strong><small>identificadas en el historial</small></article><article class="cr-kpi" style="--cc:#8b5cf6"><span>Usos restantes</span><strong>${counts.remaining == null ? 'Sin límite' : Number(counts.remaining).toLocaleString('es-MX')}</strong><small>${promotion.active === false ? 'promoción inactiva' : 'disponibles en Stripe'}</small></article><article class="cr-kpi" style="--cc:#f7941d"><span>Descuento otorgado</span><strong>${AdminEsc(money(counts.discountCents, currency))}</strong><small>en canjes registrados</small></article><article class="cr-kpi" style="--cc:#22c55e"><span>Ventas generadas</span><strong>${AdminEsc(money(counts.revenueCents, currency))}</strong><small>total cobrado tras descuento</small></article></div>
      <div class="cr-note"><strong>Código: ${AdminEsc(data.trackedCode || '—')}</strong>${promotion.found ? ` · ${promotion.active ? 'Activo' : 'Inactivo'}${promotion.expiresAtMs ? ' · vence ' + AdminEsc(when(promotion.expiresAtMs)) : ''}` : ' · Stripe no encontró este código o no pudo consultarlo.'}${discrepancy ? `<br>${AdminEsc(discrepancy)}` : ''}</div>
      <div class="cr-layout"><section class="cr-panel"><div class="cr-head"><div><h2>Personas y número de compras</h2><small>Una misma persona puede aparecer con varios usos.</small></div></div><div class="cr-table-wrap"><table class="cr-table"><thead><tr><th>Persona</th><th>Usos</th><th>Descuento</th><th>Pagó</th><th>Último canje</th></tr></thead><tbody>${peopleRows}</tbody></table></div></section><section class="cr-panel"><div class="cr-head"><div><h2>Historial de canjes</h2><small>Un renglón por sesión de Checkout.</small></div><button class="btn btn-outline btn-sm" type="button" id="cr-csv" ${history.length ? '' : 'disabled'}>Descargar CSV</button></div><div class="cr-table-wrap"><table class="cr-table"><thead><tr><th>Fecha</th><th>Persona</th><th>Código / plan</th><th>Subtotal</th><th>Descuento</th><th>Pagó</th><th>Estado</th></tr></thead><tbody>${historyRows}</tbody></table></div></section></div>`;
    p.querySelector('#cr-csv')?.addEventListener('click', () => {
      const headers = ['fecha','nombre','correo','codigo','plan','subtotal','descuento','pagado','moneda','estado'];
      const lines = history.map(item => [when(item.redeemedAtMs),item.name,item.email,item.code,item.plan,(Number(item.amountSubtotal)||0)/100,(Number(item.amountDiscount)||0)/100,(Number(item.amountTotal)||0)/100,item.currency,item.status].map(csvCell).join(','));
      const blob = new Blob(['\ufeff' + [headers.join(','), ...lines].join('\r\n')], { type:'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob), anchor = document.createElement('a');
      anchor.href = url; anchor.download = `canjes-${String(data.trackedCode || 'cupon').toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
    });
  } catch(error) {
    body.className = 'cr-empty';
    body.innerHTML = `<strong>No pudimos cargar los canjes</strong><br>${AdminEsc(error.message || 'Revisa el backend.')}<br><button class="btn btn-primary btn-sm" type="button" id="cr-retry" style="margin-top:12px">Reintentar</button>`;
    p.querySelector('#cr-retry')?.addEventListener('click', () => Pages._cargarCupones(p, code));
  }
};

// ─────────── NOTIFICACIONES PUSH · 9 eventos + campañas manuales ───────────
Pages.push = function(p){
  const members = () => (window.Store?.miembros || []).slice().sort((a,b) => String(a.email || '').localeCompare(String(b.email || '')));
  const num = value => Number(value || 0).toLocaleString('es-MX');
  const when = value => {
    const date = new Date(Number(value) || value || 0);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-MX', { dateStyle:'medium', timeStyle:'short', timeZone:'America/Mexico_City' });
  };
  if (!document.getElementById('push-admin-styles')) {
    const style = document.createElement('style');
    style.id = 'push-admin-styles';
    style.textContent = `
.pa{max-width:1240px}.pa *{box-sizing:border-box}.pa-status,.pa-panel,.pa-card{border:1px solid var(--border);border-radius:20px;background:var(--surface);padding:20px}.pa-status{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:18px 0}.pa-status.is-ready{border-color:color-mix(in srgb,#22c55e 45%,var(--border));background:linear-gradient(135deg,color-mix(in srgb,#22c55e 7%,var(--surface)),var(--surface))}.pa-kicker{display:block;font:700 10px 'JetBrains Mono',monospace;letter-spacing:1.2px;text-transform:uppercase;color:var(--text-3)}.pa-status h2,.pa-panel h3{margin:6px 0;font:800 19px 'Plus Jakarta Sans',sans-serif;color:var(--text)}.pa-muted{margin:0;color:var(--text-3);font-size:12px;line-height:1.55}.pa-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.pa-card{position:relative;overflow:hidden;padding:17px}.pa-card:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--pc,#2FD1C6)}.pa-card small{display:block;font:700 9px 'JetBrains Mono',monospace;letter-spacing:1px;text-transform:uppercase;color:var(--text-3)}.pa-card strong{display:block;margin:8px 0 4px;font:800 29px/1 'Plus Jakarta Sans',sans-serif;color:var(--text)}.pa-card span{font-size:10.5px;color:var(--text-3)}.pa-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:16px;margin-top:16px}.pa-panel{min-width:0}.pa-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.pa-templates{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.pa-template{padding:13px;border:1px solid var(--border);border-radius:14px;background:var(--surface-2);cursor:pointer;text-align:left;color:var(--text)}.pa-template:hover,.pa-template.is-active{border-color:#2FD1C6;box-shadow:inset 0 0 0 1px #2FD1C6}.pa-template small{display:block;color:var(--text-3);font:700 8px 'JetBrains Mono',monospace;text-transform:uppercase}.pa-template strong{display:block;margin:7px 0 4px;font-size:12px}.pa-template span{display:block;color:var(--text-3);font-size:10px;line-height:1.4}.pa-preview{position:sticky;top:20px}.pa-phone{padding:14px;border-radius:18px;background:#eceff3;border:7px solid #1d1d1f;box-shadow:0 14px 36px rgba(0,0,0,.18)}.pa-phone__top{height:13px;text-align:center;color:#111;font-size:8px}.pa-notification{margin-top:8px;padding:12px;border-radius:14px;background:rgba(255,255,255,.94);color:#111;box-shadow:0 4px 12px rgba(0,0,0,.11)}.pa-notification small{display:flex;justify-content:space-between;font-size:8px;color:#555}.pa-notification strong{display:block;margin:7px 0 4px;font-size:12px}.pa-notification p{margin:0;font-size:10.5px;line-height:1.4;color:#333}.pa-form{display:grid;gap:10px}.pa-form label{display:grid;gap:6px;color:var(--text-2);font-size:10.5px;font-weight:700}.pa-form input,.pa-form textarea,.pa-form select{width:100%;min-height:42px;border:1px solid var(--border);border-radius:11px;background:var(--surface-2);color:var(--text);padding:9px 11px;font:500 12px Inter,sans-serif}.pa-form textarea{min-height:78px;resize:vertical}.pa-form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pa-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}.pa-history{list-style:none;margin:0;padding:0}.pa-history li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}.pa-history li:last-child{border:0}.pa-history strong{display:block;color:var(--text);font-size:11.5px}.pa-history small{display:block;margin-top:3px;color:var(--text-3);font-size:10px}.pa-history time{font:600 9px 'JetBrains Mono',monospace;color:var(--text-3)}.pa-empty,.pa-loading{padding:34px;text-align:center;color:var(--text-3);font-size:12px}.pa-loading:before{content:'';display:block;width:22px;height:22px;margin:0 auto 10px;border:2px solid var(--border);border-top-color:#2FD1C6;border-radius:50%;animation:pa-spin .8s linear infinite}@keyframes pa-spin{to{transform:rotate(360deg)}}
@media(max-width:1050px){.pa-kpis{grid-template-columns:repeat(3,1fr)}.pa-templates{grid-template-columns:repeat(2,1fr)}}@media(max-width:780px){.pa-layout{grid-template-columns:1fr}.pa-preview{position:static}.pa-kpis{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.pa-status{align-items:stretch;flex-direction:column}.pa-status .btn{width:100%;justify-content:center}.pa-kpis{grid-template-columns:1fr 1fr;gap:8px}.pa-card,.pa-panel,.pa-status{padding:15px;border-radius:16px}.pa-card strong{font-size:24px}.pa-templates{grid-template-columns:1fr}.pa-form-row{grid-template-columns:1fr}.pa-actions .btn{width:100%;justify-content:center}}
`;
    document.head.appendChild(style);
  }
  p.innerHTML = `<div class="pa fade-up"><div class="sec-hero"><span class="sec-hero__eyebrow">Comunicación · web push</span><h1 class="sec-hero__title">Notificaciones push</h1><p class="sec-hero__sub">Nueve mensajes útiles que pueden aparecer en el teléfono o la computadora aunque el panel esté cerrado. Cada persona conserva el control de sus categorías.</p></div><div id="pa-body" class="pa-loading">Cargando centro de notificaciones…</div></div>`;
  const body = p.querySelector('#pa-body');
  let selectedId = 'welcome';
  let cached = null;
  const memberOptions = () => '<option value="">Mi dispositivo de administrador</option>' + members().map(member => {
    const id = member.id || member.uid || '';
    const label = member.nombre || member.displayName || member.email || id;
    return `<option value="${AdminEsc(id)}">${AdminEsc(label)}${member.email ? ' · ' + AdminEsc(member.email) : ''}</option>`;
  }).join('');
  const templateOptions = rows => rows.map(row => `<option value="${AdminEsc(row.id)}">${AdminEsc(row.title.replace(/[🎁⭐⏳📚🔴🏆🎓📢👋]/g,''))}</option>`).join('');
  const preview = row => {
    const selected = row || cached?.templates?.[0] || {};
    const title = document.querySelector('[data-pa-edit-title]')?.value || selected.title || 'SYNOVA';
    const message = document.querySelector('[data-pa-edit-body]')?.value || selected.body || '';
    const phoneTitle = document.querySelector('[data-pa-preview-title]');
    const phoneBody = document.querySelector('[data-pa-preview-body]');
    if (phoneTitle) phoneTitle.textContent = title;
    if (phoneBody) phoneBody.textContent = message.replace(/\{\{creditos\}\}/g,'25').replace(/\{\{saldo\}\}/g,'350');
  };
  const selectTemplate = id => {
    selectedId = id;
    const row = cached.templates.find(item => item.id === id) || cached.templates[0];
    body.querySelectorAll('[data-pa-template]').forEach(button => button.classList.toggle('is-active', button.dataset.paTemplate === id));
    const fields = { title:'title', body:'body', action:'action', url:'url' };
    Object.keys(fields).forEach(key => { const input = body.querySelector(`[data-pa-edit-${key}]`); if (input) input.value = row[fields[key]] || ''; });
    const category = body.querySelector('[data-pa-edit-category]'); if (category) category.textContent = (cached.categories || {})[row.category] || row.category;
    preview(row);
  };
  const render = data => {
    cached = data;
    const counts = data.counts || {};
    body.className = '';
    body.innerHTML = `
      <section class="pa-status ${data.configured ? 'is-ready' : ''}"><div><span class="pa-kicker">Estado del canal</span><h2>${data.configured ? 'Push configurado y listo' : 'Faltan las claves del servidor'}</h2><p class="pa-muted">${data.configured ? 'Los dispositivos pueden registrarse y los envíos quedan auditados e idempotentes.' : 'Configura WEB_PUSH_VAPID_PUBLIC_KEY y WEB_PUSH_VAPID_PRIVATE_KEY en Railway antes de activar envíos.'}</p></div><button type="button" class="btn btn-outline btn-sm" data-pa-run ${data.configured ? '' : 'disabled'}>Revisar automatizaciones</button></section>
      <div class="pa-kpis"><article class="pa-card" style="--pc:#2FD1C6"><small>Personas</small><strong>${num(counts.users)}</strong><span>con push activo</span></article><article class="pa-card" style="--pc:#3a3a3a"><small>Dispositivos</small><strong>${num(counts.devices)}</strong><span>registrados</span></article><article class="pa-card" style="--pc:#22c55e"><small>Entregas</small><strong>${num(counts.sent)}</strong><span>en el historial</span></article><article class="pa-card" style="--pc:#ef4444"><small>Fallidos</small><strong>${num(counts.failed)}</strong><span>intentos no entregados</span></article><article class="pa-card" style="--pc:#8b5cf6"><small>Programados</small><strong>${num(counts.scheduled)}</strong><span>avisos pendientes</span></article></div>
      <div class="pa-layout"><section class="pa-panel"><div class="pa-head"><div><span class="pa-kicker">Biblioteca aprobada</span><h3>Las 9 notificaciones</h3><p class="pa-muted">Los disparadores no cambian al editar el texto.</p></div></div><div class="pa-templates">${data.templates.map(row => `<button type="button" class="pa-template ${row.id===selectedId?'is-active':''}" data-pa-template="${AdminEsc(row.id)}"><small>${AdminEsc((data.categories||{})[row.category]||row.category)}</small><strong>${AdminEsc(row.title)}</strong><span>${AdminEsc(row.body)}</span></button>`).join('')}</div></section>
      <aside class="pa-panel pa-preview"><span class="pa-kicker">Vista previa móvil</span><h3>Así se verá</h3><div class="pa-phone"><div class="pa-phone__top">9:41</div><div class="pa-notification"><small><b>SYNOVA</b><span>ahora</span></small><strong data-pa-preview-title></strong><p data-pa-preview-body></p></div></div><p class="pa-muted" style="margin-top:12px">iPhone y Android deciden la tipografía final; el título y mensaje se mantienen.</p></aside></div>
      <div class="pa-layout"><section class="pa-panel"><div class="pa-head"><div><span class="pa-kicker">Editor</span><h3>Texto de la plantilla</h3><p class="pa-muted" data-pa-edit-category></p></div></div><div class="pa-form"><label>Título<input maxlength="90" data-pa-edit-title></label><label>Mensaje<textarea maxlength="180" data-pa-edit-body></textarea></label><div class="pa-form-row"><label>Acción<input maxlength="32" data-pa-edit-action></label><label>Destino interno<input maxlength="1000" data-pa-edit-url></label></div><div class="pa-actions"><button type="button" class="btn btn-primary btn-sm" data-pa-save>Guardar plantilla</button></div></div></section>
      <section class="pa-panel"><span class="pa-kicker">Envío real</span><h3>Enviar ahora</h3><p class="pa-muted">Respeta la categoría elegida por el destinatario y el horario tranquilo.</p><div class="pa-form" style="margin-top:13px"><label>Notificación<select data-pa-send-template>${templateOptions(data.templates)}</select></label><label>Destinatario<select data-pa-send-member>${memberOptions()}</select></label><label><span><input type="checkbox" data-pa-send-all style="width:auto;min-height:0"> Enviar a todos los dispositivos suscritos</span></label><div class="pa-actions"><button type="button" class="btn btn-primary btn-sm" data-pa-send ${data.configured?'':'disabled'}>Enviar notificación</button></div></div></section></div>
      <div class="pa-layout"><section class="pa-panel"><span class="pa-kicker">Aviso administrativo</span><h3>Programar un mensaje</h3><div class="pa-form"><label>Título<input maxlength="90" data-pa-schedule-title value="¡Novedades en SYNOVA! 📢"></label><label>Mensaje<textarea maxlength="180" data-pa-schedule-body>Hay información importante para ti. Consulta las últimas novedades.</textarea></label><div class="pa-form-row"><label>Fecha y hora<input type="datetime-local" data-pa-schedule-at></label><label>Destino<input data-pa-schedule-url value="/vip-panel.html#inicio"></label></div><label>Destinatario<select data-pa-schedule-member><option value="all">Todos los suscritos</option>${memberOptions().replace('<option value="">Mi dispositivo de administrador</option>','')}</select></label><div class="pa-actions"><button type="button" class="btn btn-primary btn-sm" data-pa-schedule ${data.configured?'':'disabled'}>Programar aviso</button></div></div></section>
      <section class="pa-panel"><div class="pa-head"><div><span class="pa-kicker">Auditoría</span><h3>Últimas entregas</h3></div></div>${(data.latest||[]).length ? `<ul class="pa-history">${data.latest.slice(0,12).map(row => `<li><div><strong>${AdminEsc(row.title || row.templateId || 'Notificación')}</strong><small>${AdminEsc(row.status || '')} · ${num(row.sent)} entregada(s)${row.failed ? ' · '+num(row.failed)+' fallida(s)' : ''}</small></div><time>${when(row.sentAtMs)}</time></li>`).join('')}</ul>` : '<div class="pa-empty">Todavía no hay entregas.</div>'}</section></div>`;
    selectTemplate(selectedId);
    body.querySelectorAll('[data-pa-template]').forEach(button => button.addEventListener('click', () => selectTemplate(button.dataset.paTemplate)));
    ['title','body'].forEach(key => body.querySelector(`[data-pa-edit-${key}]`)?.addEventListener('input', () => preview()));
    body.querySelector('[data-pa-save]')?.addEventListener('click', async event => {
      const button = event.currentTarget; button.disabled = true;
      try {
        await Pages._api('/admin/push/templates/' + encodeURIComponent(selectedId), { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ title:body.querySelector('[data-pa-edit-title]').value, body:body.querySelector('[data-pa-edit-body]').value, action:body.querySelector('[data-pa-edit-action]').value, url:body.querySelector('[data-pa-edit-url]').value }) });
        Toast.success('Plantilla guardada', 'Los próximos envíos usarán este texto.'); await load();
      } catch(error){ Toast.error('No se pudo guardar', error.message); button.disabled=false; }
    });
    body.querySelector('[data-pa-send]')?.addEventListener('click', async event => {
      const button=event.currentTarget, all=body.querySelector('[data-pa-send-all]').checked, uid=body.querySelector('[data-pa-send-member]').value, templateId=body.querySelector('[data-pa-send-template]').value;
      if (all && !confirm('La notificación se enviará a todos los dispositivos suscritos. ¿Continuar?')) return;
      button.disabled=true; button.textContent='Enviando…';
      try { const result=await Pages._api('/admin/push/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({templateId,uid,audience:all?'all':'user'})}); Toast.success('Notificación procesada', `${num(result.sent)} entregada(s) · ${num(result.queued)} en horario tranquilo`); await load(); }
      catch(error){ Toast.error('No se pudo enviar',error.message); button.disabled=false; button.textContent='Enviar notificación'; }
    });
    body.querySelector('[data-pa-schedule]')?.addEventListener('click', async event => {
      const at=body.querySelector('[data-pa-schedule-at]').value, target=body.querySelector('[data-pa-schedule-member]').value;
      if(!at){Toast.info('Falta la fecha','Elige cuándo debe enviarse.');return;}
      const button=event.currentTarget; button.disabled=true;
      try { await Pages._api('/admin/push/schedule',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:body.querySelector('[data-pa-schedule-title]').value,body:body.querySelector('[data-pa-schedule-body]').value,url:body.querySelector('[data-pa-schedule-url]').value,sendAtMs:new Date(at).getTime(),audience:target==='all'?'all':'user',uid:target==='all'?'':target})}); Toast.success('Aviso programado',when(new Date(at).getTime())); await load(); }
      catch(error){Toast.error('No se pudo programar',error.message);button.disabled=false;}
    });
    body.querySelector('[data-pa-run]')?.addEventListener('click', async event => { const button=event.currentTarget;button.disabled=true;try{await Pages._api('/admin/push/run',{method:'POST'});Toast.success('Revisión terminada');await load();}catch(error){Toast.error('No se pudo revisar',error.message);button.disabled=false;} });
  };
  const load = async () => {
    body.className='pa-loading';body.textContent='Cargando centro de notificaciones…';
    try { render(await Pages._api('/admin/push')); }
    catch(error){ body.className='pa-empty';body.innerHTML=`<strong>No pudimos cargar las notificaciones</strong><br>${AdminEsc(error.message)}<br><button class="btn btn-primary btn-sm" data-pa-retry style="margin-top:12px">Reintentar</button>`;body.querySelector('[data-pa-retry]')?.addEventListener('click',load); }
  };
  load();
};

Pages._esperarAdmin = function(){
  if (window.AdminUser) return Promise.resolve();
  return new Promise(resolver => { window.addEventListener('adminready', () => resolver(), { once: true }); setTimeout(resolver, 10000); });
};

const montar = nombre => function(){
  const page = document.getElementById('page');
  if (!page) return;
  Pages[nombre](page);
};
function registrar(){
  if (typeof PAGES === 'undefined') return setTimeout(registrar, 50);
  PAGES.encuestas = montar('encuestas');
  PAGES.metricas = montar('metricas');
  PAGES.pruebas = montar('pruebas');
  PAGES.correos = montar('correos');
  PAGES.cupones = montar('cupones');
  PAGES.push = montar('push');
  // Si el router ya intentó abrir una de estas secciones antes de que cargara este archivo, se vuelve a abrir
  const page = document.getElementById('page');
  const viva = page && page.dataset.live;
  if (['encuestas', 'metricas', 'pruebas', 'correos', 'cupones', 'push'].includes(viva) && window.AdminUser && window.navigateTo) window.navigateTo(viva);
}
registrar();
window.SynovaMarketingAdmin = Pages;
})();
