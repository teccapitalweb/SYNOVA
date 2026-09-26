(function(){
  'use strict';

  var API = function(){ return window.__WEBHOOK_URL || 'https://synova-webhook-production.up.railway.app'; };
  var books = [
    { id:'genetica-clinica', title:'Genética clínica', area:'Medicina genómica', cover:'assets/img/books/genetica-clinica.jpg', cost:120, available:true, desc:'Principios y aplicaciones clínicas para comprender la herencia, la variación genética y su impacto en el diagnóstico.' },
    { id:'metabolismo', title:'Metabolismo', area:'Fisiología clínica', cover:'assets/img/books/metabolismo.jpg', cost:140, available:true, desc:'Una referencia visual para repasar rutas metabólicas y su relación con el equilibrio energético y la práctica clínica.' },
    { id:'guia-sanford', title:'Guía Sanford', area:'Terapéutica antimicrobiana', cover:'assets/img/books/guia-sanford.jpg', cost:180, available:true, desc:'Consulta clínica de terapéutica antimicrobiana para apoyar decisiones informadas y el uso responsable de antibióticos.' },
    { id:'vacunas-inmunizacion', title:'Vacunas e inmunización', area:'Medicina preventiva', cover:'assets/img/books/vacunas-inmunizacion.jpg', cost:180, available:true, desc:'Panorama de inmunización y vacunación para fortalecer la prevención y la actualización profesional.' },
    { id:'enfermedades-infecciosas', title:'Enfermedades infecciosas · Mandell', area:'Infectología', cover:'assets/img/books/enfermedades-infecciosas.jpg', cost:260, available:true, desc:'Tratado de referencia para el estudio integral de las enfermedades infecciosas y sus fundamentos clínicos.' },
    { id:'alas-parasitologia', title:'Alas de parasitología', area:'Parasitología', cover:'assets/img/books/alas-parasitologia.jpg', cost:0, available:false, desc:'Una nueva referencia de parasitología que se incorporará próximamente al catálogo de SYNOVA.' }
  ];
  var state = { balance:0, lifetimeEarned:0, unlocked:[], loaded:false };
  var currentBook = null, pdfDoc = null, pageNumber = 1, renderTask = null;

  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function icon(id){ return '<svg class="ic"><use href="#'+id+'"/></svg>'; }
  function owned(id){ return state.unlocked.indexOf(id) !== -1; }
  async function token(){
    var user = window.__auth && window.__auth.currentUser;
    if (!user) throw new Error('Inicia sesión para continuar.');
    return user.getIdToken();
  }
  async function api(path, options){
    options = options || {};
    var headers = Object.assign({}, options.headers || {}, { Authorization:'Bearer '+await token() });
    if (options.body && !headers['Content-Type']) headers['Content-Type']='application/json';
    var response = await fetch(API()+path, Object.assign({}, options, { headers:headers }));
    var type = response.headers.get('content-type') || '';
    if (!response.ok) {
      var payload = type.indexOf('json') >= 0 ? await response.json().catch(function(){return {};}) : {};
      var error = new Error(payload.error || 'No pudimos completar la operación.');
      error.payload = payload; throw error;
    }
    return type.indexOf('json') >= 0 ? response.json() : response;
  }
  async function loadCredits(){
    try {
      var data = await api('/credits/me');
      state.balance=Number(data.balance||0); state.lifetimeEarned=Number(data.lifetimeEarned||0); state.unlocked=Array.isArray(data.unlocked)?data.unlocked:[]; state.loaded=true;
      if(data.welcomeJustGranted){ window.Toast&&Toast.success('Te regalamos '+Number(data.welcomeCredits||120)+' créditos','Alcanzan para tu primera herramienta o libro.'); }
    } catch(e){ state.loaded=true; console.warn('[Créditos SYNOVA]',e.message); }
    window.dispatchEvent(new CustomEvent('synova:credits-changed',{detail:state}));
    return state;
  }
  // Canje genérico (libros y herramientas). Actualiza saldo y desbloqueos locales.
  async function redeemReward(rewardId){
    var result=await api('/credits/redeem',{method:'POST',body:JSON.stringify({rewardId:rewardId})});
    state.balance=Number(result.balance||0); if(!owned(rewardId))state.unlocked.push(rewardId);
    window.dispatchEvent(new CustomEvent('synova:credits-changed',{detail:state}));
    return result;
  }
  window.SynovaCredits={ state:state, load:loadCredits, owned:owned, balance:function(){return state.balance;}, redeem:redeemReward };
  function wallet(){
    return '<div class="credit-wallet"><div class="credit-wallet__label">Tu saldo disponible</div><div class="credit-wallet__value"><span class="credit-coin">C</span><span id="syn-credit-balance">'+state.balance+'</span></div><p class="credit-wallet__sub">Créditos SYNOVA · no transferibles</p></div>';
  }
  function renderLibrary(){
    var c=document.getElementById('content'); if(!c)return;
    c.innerHTML='<div class="books-page fade-up"><section class="books-hero"><div class="books-hero__copy"><div class="books-kicker">'+icon('i-book')+'Biblioteca SYNOVA</div><h1>Conocimiento clínico<br>para conservar.</h1><p>Tus primeros 120 créditos son de regalo. Gana más en Retos y compartiendo SYNOVA, y canjéalos por libros y herramientas que permanecerán en tu cuenta.</p></div>'+wallet()+'</section><div class="books-head"><div><span>Catálogo canjeable</span><h2>Elige tu próxima referencia</h2></div><small>'+books.filter(function(b){return b.available;}).length+' disponibles · 1 próximamente</small></div><div class="book-shelf">'+books.map(card).join('')+'</div></div>';
    c.querySelectorAll('[data-book]').forEach(function(el){ el.addEventListener('click',function(){ renderDetail(el.dataset.book); }); });
    if(!state.loaded) loadCredits().then(function(){ if(document.querySelector('.books-page'))renderLibrary(); });
  }
  function card(book){
    var isOwned=owned(book.id), status=!book.available?'Próximamente':isOwned?'En tu biblioteca':'Canjeable';
    return '<button class="book-card '+(isOwned?'is-owned ':'')+(!book.available?'is-coming':'')+'" data-book="'+book.id+'"><span class="book-badge">'+status+'</span><span class="book-card__cover"><img src="'+book.cover+'" alt="Portada de '+esc(book.title)+'" loading="lazy"></span><span class="book-card__body"><span class="book-card__tag">'+esc(book.area)+'</span><h3>'+esc(book.title)+'</h3><p>'+esc(book.desc)+'</p><span class="book-card__foot">'+(!book.available?'<span>En preparación</span>':isOwned?'<span class="book-cost">'+icon('i-check-circle')+'Canjeado</span>':'<span class="book-cost"><span class="credit-coin">C</span>'+book.cost+' créditos</span>')+'<span class="book-open">'+icon(isOwned?'i-book':'i-arrow-right')+'</span></span></span></button>';
  }
  function renderDetail(id){
    var book=books.find(function(b){return b.id===id;}); if(!book)return renderLibrary();
    currentBook=book; var isOwned=owned(book.id), c=document.getElementById('content');
    var action=!book.available?'<button class="btn btn--ghost" disabled>Próximamente</button>':isOwned?'<button class="btn btn--accent" id="book-read">'+icon('i-book')+'Abrir lector</button>':'<button class="btn btn--accent" id="book-redeem">Canjear por '+book.cost+' créditos</button>';
    c.innerHTML='<div class="books-page fade-up"><button class="book-back" id="book-back">← Volver a Libros</button><section class="book-detail"><div class="book-detail__cover"><img src="'+book.cover+'" alt="Portada de '+esc(book.title)+'"></div><div class="book-detail__copy"><div class="books-kicker" style="color:var(--primary)">'+esc(book.area)+' · Biblioteca protegida</div><h1>'+esc(book.title)+'</h1><p>'+esc(book.desc)+'</p><div class="book-detail__facts"><span class="book-fact"><strong>Formato</strong> · lector digital</span><span class="book-fact"><strong>Acceso</strong> · '+(!book.available?'próximamente':isOwned?'permanente en tu cuenta':book.cost+' créditos')+'</span><span class="book-fact"><strong>Protección</strong> · sin descarga directa</span></div><div class="book-detail__actions">'+action+'<span class="book-cost"><span class="credit-coin">C</span>Saldo: '+state.balance+'</span></div></div></section></div>';
    document.getElementById('book-back').onclick=renderLibrary;
    var read=document.getElementById('book-read'); if(read)read.onclick=function(){openReader(book);};
    var redeem=document.getElementById('book-redeem'); if(redeem)redeem.onclick=function(){confirmRedeem(book);};
  }
  function confirmRedeem(book){
    var alcanza=state.balance>=book.cost;
    var run=function(){ redeem(book); };
    if(window.Modal&&Modal.open){
      var body='<div class="credit-confirm"><img src="'+book.cover+'" alt="" style="width:72px;aspect-ratio:2/3;object-fit:cover;border-radius:7px;box-shadow:4px 7px 16px rgba(0,0,0,.2);margin-bottom:10px"><strong>'+esc(book.title)+'</strong>'+(alcanza
        ?'<p>Se descontarán <b>'+book.cost+'</b> de tus <b>'+state.balance+'</b> créditos. El libro queda en tu cuenta para siempre.</p>'
        :'<p>No tienes créditos suficientes. Tienes <b>'+state.balance+'</b> y necesitas <b>'+book.cost+'</b>. Gánalos en <b>Retos</b> o invita a un colega.</p>')+'</div>';
      var footer='<button class="btn btn--ghost" onclick="Modal.close(\'book-redeem-confirm\')">Cancelar</button>'+(alcanza?'<button class="btn btn--accent" id="confirm-book-redeem">Canjear y leer</button>':'<button class="btn btn--accent" id="confirm-book-earn">Ir a Retos</button>');
      Modal.open({ id:'book-redeem-confirm', title:alcanza?'¿Canjear '+book.cost+' créditos?':'Créditos insuficientes', subtitle:'Créditos SYNOVA', icon:'i-book', size:'sm', body:body, footer:footer });
      setTimeout(function(){ var b=document.getElementById('confirm-book-redeem'); if(b)b.onclick=function(){Modal.close('book-redeem-confirm');run();}; var g=document.getElementById('confirm-book-earn'); if(g)g.onclick=function(){Modal.close('book-redeem-confirm'); if(window.navigateTo)navigateTo('retos');}; },0);
    } else if(!alcanza){ window.Toast&&Toast.info('Créditos insuficientes','Tienes '+state.balance+' y necesitas '+book.cost+'. Gánalos en Retos.'); }
    else if(confirm('¿Canjear '+book.title+' por '+book.cost+' créditos?')) run();
  }
  async function redeem(book){
    try{
      await redeemReward(book.id);
      window.Toast&&Toast.success('Libro añadido','Abriendo tu lector…'); renderDetail(book.id); openReader(book);
    }catch(e){ window.Toast&&Toast.error('No se pudo canjear',e.message); }
  }
  async function openReader(book){
    if(!window.pdfjsLib){ window.Toast&&Toast.error('Lector no disponible','Actualiza la página e inténtalo otra vez.'); return; }
    currentBook=book; pageNumber=1; pdfDoc=null;
    var shell=document.createElement('div'); shell.className='reader'; shell.id='syn-reader'; shell.innerHTML='<header class="reader__bar"><button class="reader__close" id="reader-close" aria-label="Cerrar lector">'+icon('i-close')+'</button><div class="reader__title"><strong>'+esc(book.title)+'</strong><span>Lector protegido · SYNOVA</span></div><button class="reader__control" id="reader-prev" aria-label="Página anterior">←</button><span class="reader__page" id="reader-page">— / —</span><button class="reader__control" id="reader-next" aria-label="Página siguiente">→</button></header><main class="reader__body" id="reader-body"><canvas class="reader__canvas" id="reader-canvas"></canvas><div class="reader__loading" id="reader-loading"><div><div class="reader__spinner"></div>Preparando tu libro…</div></div></main>';
    document.body.appendChild(shell); document.body.style.overflow='hidden';
    document.getElementById('reader-close').onclick=closeReader; document.getElementById('reader-prev').onclick=function(){if(pageNumber>1){pageNumber--;renderPage();}}; document.getElementById('reader-next').onclick=function(){if(pdfDoc&&pageNumber<pdfDoc.numPages){pageNumber++;renderPage();}};
    shell.addEventListener('contextmenu',function(e){e.preventDefault();});
    try{
      var idToken=await token();
      window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      pdfDoc=await window.pdfjsLib.getDocument({url:API()+'/api/books/'+encodeURIComponent(book.id)+'/file',httpHeaders:{Authorization:'Bearer '+idToken},withCredentials:false,isEvalSupported:false}).promise;
      await renderPage();
    }catch(e){ closeReader(); window.Toast&&Toast.error('No se pudo abrir el libro',e.message); }
  }
  async function renderPage(){
    if(!pdfDoc)return; var page=await pdfDoc.getPage(pageNumber), body=document.getElementById('reader-body'), canvas=document.getElementById('reader-canvas'); if(!body||!canvas)return;
    if(renderTask){try{renderTask.cancel();}catch(_){}}
    var base=page.getViewport({scale:1}), target=Math.min(1080,Math.max(320,body.clientWidth-44)), scale=target/base.width, viewport=page.getViewport({scale:scale});
    var ratio=Math.min(window.devicePixelRatio||1,2), ctx=canvas.getContext('2d'); canvas.width=Math.floor(viewport.width*ratio);canvas.height=Math.floor(viewport.height*ratio);canvas.style.width=Math.floor(viewport.width)+'px';canvas.style.height=Math.floor(viewport.height)+'px';ctx.setTransform(ratio,0,0,ratio,0,0);
    renderTask=page.render({canvasContext:ctx,viewport:viewport}); await renderTask.promise; renderTask=null;
    var loading=document.getElementById('reader-loading');if(loading)loading.remove(); document.getElementById('reader-page').textContent=pageNumber+' / '+pdfDoc.numPages; document.getElementById('reader-prev').disabled=pageNumber<=1;document.getElementById('reader-next').disabled=pageNumber>=pdfDoc.numPages; body.scrollTop=0;
  }
  function closeReader(){ var r=document.getElementById('syn-reader');if(r)r.remove();document.body.style.overflow='';if(renderTask){try{renderTask.cancel();}catch(_){}}renderTask=null;pdfDoc=null; }
  document.addEventListener('keydown',function(e){ if(!document.getElementById('syn-reader'))return; if(e.key==='Escape'){e.preventDefault();closeReader();} if((e.ctrlKey||e.metaKey)&&['s','p'].includes(e.key.toLowerCase())){e.preventDefault();window.Toast&&Toast.info('Lectura protegida','Este libro se consulta dentro de SYNOVA.');} if(e.key==='ArrowLeft')document.getElementById('reader-prev')?.click();if(e.key==='ArrowRight')document.getElementById('reader-next')?.click(); });

  async function registerReferral(){
    var code=localStorage.getItem('synova_referral_code'); if(!code||sessionStorage.getItem('synova:credit-referral-checked')==='1')return;
    sessionStorage.setItem('synova:credit-referral-checked','1');
    try{var data=await api('/credits/register-referral',{method:'POST',body:JSON.stringify({referralCode:code})});if(data.applied&&!data.alreadyApplied&&data.balance){state.balance=Number(data.balance);window.Toast&&Toast.success('Créditos de bienvenida','Recibiste créditos por entrar con una invitación.');}}catch(e){console.warn('[Referral credits]',e.message);}
  }
  window.__synovaAwardChallenge=async function(payload){
    try{var result=await api('/credits/earn',{method:'POST',body:JSON.stringify(payload)});if(result.awarded){state.balance=Number(result.balance||state.balance);window.Toast&&Toast.success('+'+result.credits+' Créditos SYNOVA','Se sumaron a tu saldo por completar el reto.');}return result;}catch(e){console.warn('[Challenge credits]',e.message);return null;}
  };
  function install(){
    if(!window.Sections)return setTimeout(install,50);
    window.Sections.libros=renderLibrary;
    loadCredits().then(registerReferral);
  }
  install();
  window.addEventListener('synova:ready',function(){loadCredits().then(registerReferral);},{once:true});
})();
