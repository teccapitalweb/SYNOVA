(function(){
  'use strict';

  /* Materiales canjeables · los ids y costos coinciden con MATERIALS del backend (synova-webhook). */
  var API = function(){ return window.__WEBHOOK_URL || 'https://synova-webhook-production.up.railway.app'; };
  var materials = [
    { id:'mat-signos-vitales', title:'Signos vitales y evolución', area:'Monitoreo', cost:120, desc:'Registro de signos vitales con gráfica de evolución para seguimiento por turno.' },
    { id:'mat-expediente-soap', title:'Expediente SOAP', area:'Documentación', cost:140, desc:'Plantilla de nota clínica en formato Subjetivo, Objetivo, Análisis y Plan.' },
    { id:'mat-control-medicamentos', title:'Control de medicamentos', area:'Farmacoterapia', cost:150, desc:'Control de administración, horarios, dosis y responsables por paciente.' },
    { id:'mat-panel-laboratorios', title:'Panel de laboratorios', area:'Diagnóstico', cost:160, desc:'Concentrado de resultados de laboratorio con rangos de referencia.' },
    { id:'mat-valoracion-integral', title:'Matriz de valoración integral', area:'Valoración', cost:170, desc:'Valoración por dominios para priorizar necesidades y cuidados.' },
    { id:'mat-pacientes-cronicos', title:'Seguimiento de pacientes crónicos', area:'Seguimiento', cost:180, desc:'Control de pacientes con enfermedades crónicas, metas y citas.' },
    { id:'mat-educacion-seguimiento', title:'Plan de educación y seguimiento', area:'Educación', cost:190, desc:'Plan de educación al paciente y familia con registro de avances.' },
    { id:'mat-referencia', title:'Referencia y contrarreferencia', area:'Gestión clínica', cost:200, desc:'Formato para referir y recibir pacientes entre niveles de atención.' },
    { id:'mat-continuidad-atencion', title:'Gestor de continuidad de la atención', area:'Gestión clínica', cost:210, desc:'Seguimiento de entregas de turno, pendientes y continuidad del cuidado.' },
    { id:'mat-auditoria-expediente', title:'Auditoría de expediente clínico', area:'Calidad', cost:220, desc:'Lista de verificación para auditar la calidad del expediente clínico.' }
  ];

  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function icon(id){ return '<svg class="ic"><use href="#'+id+'"/></svg>'; }
  function SC(){ return window.SynovaCredits; }
  function owned(id){ return !!(SC() && SC().owned(id)); }
  function balance(){ return SC() ? SC().balance() : 0; }

  function render(){
    var c = document.getElementById('content'); if (!c) return;
    var mine = materials.filter(function(m){ return owned(m.id); }).length;
    c.innerHTML = '<div class="books-page fade-up">' +
      '<section class="books-hero"><div class="books-hero__copy"><div class="books-kicker">'+icon('i-file-text')+'Materiales SYNOVA</div><h1>Formatos clínicos<br>listos para usar.</h1><p>Plantillas en Excel para tu práctica diaria. Tus primeros 120 créditos son de regalo y alcanzan para tu primer material.</p></div>' +
      '<div class="credit-wallet"><div class="credit-wallet__label">Tu saldo disponible</div><div class="credit-wallet__value"><span class="credit-coin">C</span><span>'+balance()+'</span></div><p class="credit-wallet__sub">Créditos SYNOVA · no transferibles</p></div></section>' +
      '<div class="books-head"><div><span>Catálogo canjeable</span><h2>Elige tu material</h2></div><small>'+materials.length+' materiales · '+mine+' tuyos</small></div>' +
      '<div class="mat-shelf">'+materials.map(card).join('')+'</div></div>';
    c.querySelectorAll('[data-material]').forEach(function(el){ el.addEventListener('click', function(){ open(el.dataset.material); }); });
  }

  function card(m){
    var mine = owned(m.id);
    return '<button class="mat-item '+(mine?'is-owned':'')+'" data-material="'+m.id+'">' +
      '<span class="mat-item__icon">'+icon('i-file-text')+'<em>XLSX</em></span>' +
      '<span class="mat-item__body"><span class="book-card__tag">'+esc(m.area)+'</span><strong>'+esc(m.title)+'</strong><span class="mat-item__desc">'+esc(m.desc)+'</span>' +
      '<span class="mat-item__foot">'+(mine?'<span class="book-cost">'+icon('i-check-circle')+'Tuyo · descargar</span>':'<span class="book-cost"><span class="credit-coin">C</span>'+m.cost+' créditos</span>')+'<span class="book-open">'+icon(mine?'i-download':'i-arrow-right')+'</span></span></span></button>';
  }

  function open(id){
    var m = materials.find(function(x){ return x.id === id; }); if (!m) return;
    if (owned(m.id)) return download(m);
    var saldo = balance(), alcanza = saldo >= m.cost;
    var body = '<div class="credit-confirm"><strong>'+esc(m.title)+'</strong>'+(alcanza
      ? '<p>Se descontarán <b>'+m.cost+'</b> de tus <b>'+saldo+'</b> créditos. El material queda en tu cuenta para siempre.</p>'
      : '<p>No tienes créditos suficientes. Tienes <b>'+saldo+'</b> y necesitas <b>'+m.cost+'</b>. Gánalos en <b>Retos</b> o invita a un colega.</p>')+'</div>';
    var footer = '<button class="btn btn--ghost" onclick="Modal.close(\'mat-redeem\')">Cancelar</button>' + (alcanza ? '<button class="btn btn--accent" id="mat-redeem-ok">Canjear y descargar</button>' : '<button class="btn btn--accent" id="mat-redeem-earn">Ir a Retos</button>');
    Modal.open({ id:'mat-redeem', title: alcanza ? '¿Canjear '+m.cost+' créditos?' : 'Créditos insuficientes', subtitle:'Créditos SYNOVA', icon:'i-file-text', size:'sm', body:body, footer:footer });
    setTimeout(function(){
      var earn = document.getElementById('mat-redeem-earn'); if (earn) earn.onclick = function(){ Modal.close('mat-redeem'); if (window.navigateTo) navigateTo('retos'); };
      var ok = document.getElementById('mat-redeem-ok'); if (ok) ok.onclick = async function(){
        ok.disabled = true; ok.textContent = 'Canjeando…';
        try {
          await SC().redeem(m.id);
          Modal.close('mat-redeem');
          window.Toast && Toast.success('Material desbloqueado', m.title + ' ya es tuyo.');
          render(); download(m);
        } catch(e){ ok.disabled = false; ok.textContent = 'Canjear y descargar'; window.Toast && Toast.error('No pudimos completar el canje', e.message || 'Intenta de nuevo.'); }
      };
    }, 0);
  }

  async function download(m){
    try {
      var user = window.__auth && window.__auth.currentUser; if (!user) throw new Error('Inicia sesión para continuar.');
      window.Toast && Toast.info('Preparando descarga', m.title);
      var res = await fetch(API() + '/api/materials/' + encodeURIComponent(m.id) + '/file', { headers:{ Authorization:'Bearer ' + await user.getIdToken() } });
      if (!res.ok) { var err = await res.json().catch(function(){ return {}; }); throw new Error(err.error || 'No pudimos descargar el archivo.'); }
      var blob = await res.blob();
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Synova_' + m.title.replace(/[^\wÁÉÍÓÚáéíóúÑñ]+/g, '_') + '.xlsx';
      document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    } catch(e){ window.Toast && Toast.error('No se pudo descargar', e.message); }
  }

  function install(){
    if (!window.Sections || !window.SynovaCredits) return setTimeout(install, 60);
    window.Sections.materiales = function(){
      render();
      /* Al cargar el saldo se emite synova:credits-changed y la vista se repinta sola. */
      if (!SC().state.loaded) SC().load();
    };
    window.addEventListener('synova:credits-changed', function(){ if (document.querySelector('.mat-shelf')) render(); });
  }
  install();
})();
