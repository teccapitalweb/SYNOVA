(function(){
'use strict';

var active=null;
var LETTERS='ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});};
var norm=function(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-zÑñ]/g,'').toUpperCase();};
var shuffle=function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;};
var today=function(){return new Date().toLocaleDateString('en-CA');};
var dayNumber=function(){return Math.floor(Date.now()/86400000);};
var clock=function(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
var uid=function(){return(window.UserState&&window.UserState.uid)||'guest';};
var winKey=function(){return'synova:arcade-wins:'+uid()+':'+today();};
function wins(){try{return JSON.parse(localStorage.getItem(winKey())||'[]');}catch(_){return[];}}
function saveWin(type){var list=wins();if(!list.includes(type))list.push(type);try{localStorage.setItem(winKey(),JSON.stringify(list));}catch(_){}if(window.SynovaLearningSync)window.SynovaLearningSync.schedule();updateWonCount();}
function updateWonCount(){var el=document.querySelector('[data-arcade-won]');if(el)el.textContent=wins().length+'/6 ganados hoy';}
function root(){return document.getElementById('content');}
function hash(s){return String(s).split('').reduce(function(n,c){return((n<<5)-n+c.charCodeAt(0))|0;},0)>>>0;}

var CATALOG=[
  {type:'crossword',title:'Crucigrama clínico',description:'Resuelve conceptos médicos a partir de sus pistas',label:'Vocabulario',color:'#1783b4',boards:[
    {topic:'Valoración inicial',config:{entries:[['TRIAGE','Clasificación de pacientes según la urgencia'],['PULSO','Latido arterial palpable que orienta sobre la frecuencia cardiaca'],['GLASGOW','Escala para valorar el nivel de conciencia'],['DISNEA','Sensación o dificultad para respirar'],['ASEPSIA','Medidas destinadas a evitar la contaminación'],['EDEMA','Acumulación de líquido en los tejidos'],['SEPSIS','Respuesta grave del organismo frente a una infección']] }},
    {topic:'Seguridad del paciente',config:{entries:[['ALERGIA','Reacción adversa que debe verificarse antes de medicar'],['BARRERA','Medida que intercepta un error antes de alcanzar al paciente'],['SBAR','Estructura breve para comunicar una situación clínica'],['EVENTO','Incidente que produjo o pudo producir daño'],['HIGIENE','Acción esencial de manos antes y después del contacto'],['DOBLECHEQUEO','Verificación independiente para procesos de alto riesgo']] }}]},
  {type:'memory',title:'Memorama clínico',description:'Une cada término con su aplicación clínica',label:'Memoria',color:'#765bd7',boards:[
    {topic:'Lenguaje de urgencias',config:{pairs:[['ABCDE','Valoración primaria ordenada'],['SBAR','Entrega estructurada de información'],['Triage','Priorización por gravedad'],['Asepsia','Prevención de contaminación'],['Glasgow','Valoración del nivel de conciencia'],['Reevaluación','Comprobación de la respuesta clínica']]}},
    {topic:'Signos y decisiones',config:{pairs:[['Taquicardia','Frecuencia cardiaca por encima de lo esperado'],['Hipoxemia','Oxígeno arterial insuficiente'],['Hipotensión','Presión arterial anormalmente baja'],['Disnea','Dificultad o esfuerzo respiratorio'],['Analgesia','Control terapéutico del dolor'],['Escalamiento','Solicitud oportuna de apoyo de mayor nivel']]}}]},
  {type:'wordsearch',title:'Sopa de términos',description:'Encuentra palabras ocultas en todas las direcciones',label:'Observación',color:'#159e92',boards:[
    {topic:'Signos vitales',config:{words:['PULSO','OXIGENO','PRESION','RITMO','DOLOR','GLUCOSA','ALERTA','FIEBRE']}},
    {topic:'Atención segura',config:{words:['ASEPSIA','PACIENTE','BARRERA','REGISTRO','ALERGIA','DOSIS','EQUIPO','RIESGO']}}]},
  {type:'puzzle',title:'Rompecabezas clínico',description:'Reconstruye una escena médica pieza por pieza',label:'Percepción',color:'#3479d7',boards:[
    {topic:'Preparación de urgencias',config:{image:'assets/images/arcade-puzzle-clinical-v2.png',side:3}},
    {topic:'Seguridad del entorno clínico',config:{image:'assets/images/arcade-puzzle-clinical-v2.png',side:4}}]},
  {type:'guess',title:'Adivina el concepto',description:'Descubre el término antes de agotar seis intentos',label:'Deducción',color:'#d0526b',boards:[
    {topic:'Evaluación clínica',config:{words:[['ANAMNESIS','Recopilación ordenada de antecedentes y síntomas'],['PRONOSTICO','Estimación de la evolución probable'],['DIAGNOSTICO','Identificación razonada de una enfermedad o condición']]}},
    {topic:'Seguridad asistencial',config:{words:[['TRAZABILIDAD','Capacidad de seguir el historial de una acción o producto'],['FARMACOVIGILANCIA','Detección y prevención de efectos adversos de medicamentos'],['BIOSEGURIDAD','Medidas para reducir riesgos biológicos']]}}]},
  {type:'classify',title:'Clasifica hallazgos',description:'Lleva cada dato a la categoría clínica correcta',label:'Criterio',color:'#b87818',boards:[
    {topic:'Prioridad clínica',config:{question:'Clasifica cada hallazgo según la prioridad de respuesta.',categories:['Atención inmediata','Valoración pronta','Seguimiento'],items:[['Estridor y dificultad respiratoria',0],['Hemorragia activa abundante',0],['Dolor torácico opresivo',0],['Fiebre persistente sin datos de choque',1],['Dolor moderado de inicio reciente',1],['Cambio reciente en el estado funcional',1],['Consejo preventivo sin síntomas',2],['Control estable programado',2]]}},
    {topic:'Prevención de infecciones',config:{question:'Ubica cada acción en el momento correcto.',categories:['Antes del contacto','Durante el procedimiento','Al finalizar'],items:[['Higiene de manos',0],['Verificar material estéril',0],['Mantener campo aséptico',1],['Evitar tocar superficies no preparadas',1],['Desechar punzocortantes de inmediato',2],['Registrar y reevaluar el sitio',2]]}}]}
];

var RULES={
  crossword:['Toca una pista o casilla y escribe la palabra.','Cada palabra correcta suma 100 puntos.','Tienes tres ayudas; cada una revela una letra.'],
  memory:['Voltea dos cartas y une término con definición.','Los aciertos consecutivos aumentan tu racha.','Completa todas las parejas con el menor número de movimientos.'],
  wordsearch:['Arrastra desde la primera hasta la última letra.','Las palabras pueden ir en horizontal, vertical o diagonal.','Cada palabra encontrada suma 100 puntos.'],
  puzzle:['Toca una pieza y luego otra para intercambiarlas.','También puedes arrastrar una pieza sobre su destino.','Las piezas correctas se iluminan; arma la imagen completa.'],
  guess:['Usa el teclado para descubrir tres conceptos.','Cada error consume uno de los seis intentos.','La pista clínica permanece visible durante la ronda.'],
  classify:['Toca una categoría para colocar la tarjeta activa.','Un acierto aumenta la racha; un error no descarta la tarjeta.','Clasifica todos los hallazgos para completar el tablero.']
};
var PAR={crossword:[300,1,4],memory:[120,4,9],wordsearch:[180,2,6],puzzle:[90,0,2],guess:[180,3,7],classify:[90,0,2]};

function art(type){
  if(type==='crossword')return'<span class="sa-art sa-art--cross"><i>L</i><i>O</i><i>B</i><i>S</i><i>A</i></span>';
  if(type==='memory')return'<span class="sa-art sa-art--memo"><i>Rx</i><i>ABCDE</i><i>?</i></span>';
  if(type==='wordsearch')return'<span class="sa-art sa-art--soup"><b>P U L S O</b><b>A S E P S</b><b>R I E S G</b><b>D O L O R</b></span>';
  if(type==='puzzle')return'<span class="sa-art sa-art--puzzle">'+Array.from({length:9},function(_,i){return'<i class="p'+i+'"></i>';}).join('')+'</span>';
  if(type==='guess')return'<span class="sa-art sa-art--guess"><b>S</b><i>?</i><b>P</b><b>S</b><b>I</b><b>S</b></span>';
  return'<span class="sa-art sa-art--sort"><i>Crítico</i><b>SpO₂ 82%</b><i>Seguimiento</i></span>';
}

window.abrirArcadeSynova=function(){
  var list=wins();
  root().innerHTML='<div class="sa-page"><button class="btn btn--ghost btn--sm syn-back" onclick="pintarHubRetos()">← Volver a Retos</button><header class="sa-page__head"><div><span class="syn-eyebrow">Juegos clínicos</span><h1>Juega y gana créditos</h1><p>Un tablero nuevo cada día. Resuélvelo, fortalece tu criterio y suma <strong>+30 créditos</strong> por juego.</p></div><span class="sa-page__daily" data-arcade-won>'+list.length+'/6 ganados hoy</span></header><div class="sa-catalog">'+CATALOG.map(function(g){var b=g.boards[dayNumber()%g.boards.length],done=list.includes(g.type);return'<button class="sa-card '+(done?'is-won':'')+'" style="--game:'+g.color+'" onclick="iniciarArcadeSynova(\''+g.type+'\')"><span class="sa-card__visual">'+art(g.type)+'</span><span class="sa-card__body"><span class="sa-card__label">'+esc(g.label)+(done?' · COMPLETADO':'')+'</span><strong>'+esc(g.title)+'</strong><span class="sa-card__desc">'+esc(g.description)+'</span><small>HOY · '+esc(b.topic.toUpperCase())+'</small><span class="sa-card__foot"><b>+30 créditos</b><em>'+(done?'Practicar':'Jugar')+' →</em></span></span></button>';}).join('')+'</div><div class="syn-source-note"><svg class="ic"><use href="#i-info"/></svg><span>Entrenamiento educativo. La conducta real siempre depende de la valoración del paciente y de los protocolos vigentes de tu institución.</span></div></div>';
};

window.iniciarArcadeSynova=async function(type){
  var game=CATALOG.find(function(g){return g.type===type;});if(!game)return;
  if(!window.__synovaCanStartChallenge){window.Toast&&Toast.info('Preparando el juego','Intenta de nuevo en un momento.');return;}
  var activity=type+':'+today(),access=await window.__synovaCanStartChallenge({source:'arcade',activityId:activity});if(!access)return;
  openEngine({game:game,board:game.boards[dayNumber()%game.boards.length],mode:'arcade',credits:30,onWin:async function(){var r=await window.__synovaAwardChallenge?.({source:'arcade',activityId:activity,correct:3});saveWin(type);return r&&r.awarded?Number(r.credits||30):0;},onClose:function(){}});
};

function openEngine(options){
  if(active)active.remove();
  var game=options.game,board=options.board,overlay=document.createElement('div'),closed=false,timer=0,cleanup=function(){},seconds=0,points=0,mistakes=0,done=false;
  overlay.className='sa-overlay';overlay.style.setProperty('--game',game.color);active=overlay;
  overlay.innerHTML='<section class="sa-modal" role="dialog" aria-modal="true" aria-labelledby="sa-title"><header class="sa-modal__head"><span class="sa-modal__mark">'+mark(game.type)+'</span><div><small>'+(options.mode==='lesson'?'Juego para avanzar':'Tablero del día')+' · '+esc(board.topic)+'</small><h2 id="sa-title">'+esc(options.mode==='lesson'?(options.lessonTitle||game.title):game.title)+'</h2></div><div class="sa-hud" hidden><span>◷ <b data-time>0:00</b></span><span>★ <b data-score>0</b></span><span data-stat hidden><small data-stat-label></small><b data-stat-value></b></span></div><button class="sa-close" type="button" aria-label="Cerrar">×</button></header><div class="sa-progress"><i data-progress></i></div><main class="sa-modal__body" data-body></main></section>';
  document.body.appendChild(overlay);var previous=document.body.style.overflow;document.body.style.overflow='hidden';
  var body=overlay.querySelector('[data-body]');
  body.innerHTML='<div class="sa-intro"><span class="sa-intro__mark">'+mark(game.type)+'</span><span class="sa-intro__kicker">'+esc(options.mode==='lesson'?'Mini juego de la clase':'Tablero del día')+'</span><h3>'+esc(game.title)+'</h3><p>'+esc(game.description)+'</p><ol>'+RULES[game.type].map(function(x,i){return'<li><b>'+String(i+1).padStart(2,'0')+'</b><span>'+esc(x)+'</span></li>';}).join('')+'</ol><div class="sa-intro__reward"><span class="sa-coin">C</span><span>'+(options.mode==='lesson'?'Gánalo para completar la clase y desbloquear la siguiente.':'Gánalo y suma <b>+30 créditos SYNOVA</b>.')+'</span></div><button class="sa-primary" type="button" data-start>Empezar juego <span>→</span></button></div>';
  function close(result){if(closed)return;closed=true;clearInterval(timer);cleanup();document.removeEventListener('keydown',keyDown,true);overlay.classList.remove('is-open');document.body.style.overflow=previous;setTimeout(function(){overlay.remove();if(active===overlay)active=null;},220);if(options.resolve)options.resolve(!!result);if(options.onClose)options.onClose(!!result);}
  function keyDown(e){if(e.key==='Escape'){e.preventDefault();close(false);}}
  document.addEventListener('keydown',keyDown,true);overlay.querySelector('.sa-close').onclick=function(){close(false);};
  requestAnimationFrame(function(){overlay.classList.add('is-open');});
  body.querySelector('[data-start]').onclick=start;

  function start(){
    overlay.querySelector('.sa-hud').hidden=false;body.innerHTML='<div class="sa-stage sa-stage--'+game.type+'" data-stage></div><div class="sa-feedback" data-feedback aria-live="polite"></div>';
    var stage=body.querySelector('[data-stage]'),timeEl=overlay.querySelector('[data-time]'),scoreEl=overlay.querySelector('[data-score]');
    timer=setInterval(function(){seconds++;timeEl.textContent=clock(seconds);},1000);
    var ctx={stage:stage,
      points:function(n,at,label){points=Math.max(0,points+n);scoreEl.textContent=points;scoreEl.parentElement.classList.remove('is-pop');void scoreEl.parentElement.offsetWidth;scoreEl.parentElement.classList.add('is-pop');floatText(label||('+'+n),at||stage,n<0?'bad':'good');},
      mistake:function(at,penalty){mistakes++;if(penalty){points=Math.max(0,points-penalty);scoreEl.textContent=points;}floatText(penalty?('−'+penalty):'×',at||stage,'bad');overlay.querySelector('.sa-modal').classList.remove('is-hurt');void overlay.querySelector('.sa-modal').offsetWidth;overlay.querySelector('.sa-modal').classList.add('is-hurt');},
      progress:function(n,total){overlay.querySelector('[data-progress]').style.width=(total?Math.round(n/total*100):0)+'%';},
      stat:function(label,value){var s=overlay.querySelector('[data-stat]');s.hidden=false;s.querySelector('[data-stat-label]').textContent=label;s.querySelector('[data-stat-value]').textContent=value;},
      feedback:function(text,tone){var f=body.querySelector('[data-feedback]');if(f){f.className='sa-feedback '+(tone?'is-'+tone:'');f.textContent=text;}},
      win:win,isOver:function(){return done;}
    };
    cleanup=RUNNERS[game.type](stage,board.config,ctx)||function(){};
  }
  function floatText(text,at,tone){var r=at.getBoundingClientRect(),el=document.createElement('span');el.className='sa-float is-'+tone;el.textContent=text;el.style.left=(r.left+r.width/2)+'px';el.style.top=(r.top+Math.min(r.height/2,65))+'px';overlay.appendChild(el);setTimeout(function(){el.remove();},1000);}
  function win(message){if(done)return;done=true;clearInterval(timer);var p=PAR[game.type],stars=mistakes<=p[1]&&seconds<=p[0]?3:mistakes<=p[2]&&seconds<=p[0]*2?2:1,bonus=Math.max(0,p[0]-seconds)*2;points+=bonus;setTimeout(function(){results(stars,bonus,message);},window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?120:750);}
  function results(stars,bonus,message){
    cleanup();cleanup=function(){};body.innerHTML='<div class="sa-result"><div class="sa-stars" aria-label="'+stars+' de 3 estrellas">'+[1,2,3].map(function(n){return'<span class="'+(n<=stars?'is-on':'')+'">★</span>';}).join('')+'</div><span class="sa-result__eyebrow">Tablero completado</span><h3>'+esc(message||'Excelente criterio clínico')+'</h3><p>'+esc(game.title)+' · '+esc(board.topic)+'</p><div class="sa-result__stats"><div><span>Tiempo</span><b>'+clock(seconds)+'</b></div><div><span>Puntos</span><b>'+points+'</b>'+(bonus?'<small>+'+bonus+' rapidez</small>':'')+'</div><div><span>Errores</span><b>'+mistakes+'</b></div></div><div class="sa-result__reward" data-reward>'+(options.mode==='lesson'?'Clase lista para completar':'Sumando tus créditos…')+'</div><div class="sa-result__actions">'+(options.mode==='arcade'?'<button type="button" class="sa-secondary" data-another>Elegir otro juego</button>':'')+'<button type="button" class="sa-primary" data-finish>'+(options.mode==='lesson'?'Completar clase y continuar':'Volver a Juegos clínicos')+' <span>→</span></button></div></div>';
    if(window.celebrarSynova)window.celebrarSynova(stars===3?'grande':'normal');
    if(options.mode==='arcade'){
      Promise.resolve(options.onWin&&options.onWin({seconds:seconds,points:points,mistakes:mistakes,stars:stars})).then(function(credits){var el=body.querySelector('[data-reward]');if(el)el.innerHTML=credits?'<span class="sa-coin">C</span><b>+'+credits+' créditos sumados a tu cartera</b>':'Tablero superado · recompensa diaria ya registrada';});
      body.querySelector('[data-another]').onclick=function(){close(false);setTimeout(window.abrirArcadeSynova,240);};
      body.querySelector('[data-finish]').onclick=function(){close(false);setTimeout(window.abrirArcadeSynova,240);};
    }else body.querySelector('[data-finish]').onclick=function(){close(true);};
  }
  return{close:close};
}

function mark(type){var map={crossword:'#',memory:'◫',wordsearch:'⌕',puzzle:'☷',guess:'A?',classify:'≡'};return'<b>'+map[type]+'</b>';}

function layoutCrossword(entries){
  var items=entries.map(function(e){return{word:norm(e[0]),clue:e[1]};}).filter(function(e){return e.word.length>1;}).sort(function(a,b){return b.word.length-a.word.length;}),best=null;
  for(var a=0;a<45;a++){var order=a?[items[0]].concat(shuffle(items.slice(1))):items,result=tryCrossword(order),rows=Math.max.apply(null,result.placed.map(function(w){return w.r+(w.dir==='v'?w.word.length:1);})),cols=Math.max.apply(null,result.placed.map(function(w){return w.c+(w.dir==='h'?w.word.length:1);})),score=result.isolated*10000+rows*cols+Math.abs(rows-cols)*4;if(!best||score<best.score)best={placed:result.placed,score:score};}return best.placed;
}
function tryCrossword(items){
  var cells=new Map(),placed=[],isolated=0,key=function(r,c){return r+','+c;};
  function fits(word,r,c,dir){var dr=dir==='v'?1:0,dc=dir==='h'?1:0;if(cells.has(key(r-dr,c-dc))||cells.has(key(r+dr*word.length,c+dc*word.length)))return-1;var crossings=0;for(var k=0;k<word.length;k++){var rr=r+dr*k,cc=c+dc*k,existing=cells.get(key(rr,cc));if(existing){if(existing!==word[k])return-1;crossings++;continue;}if(cells.has(key(rr+dc,cc+dr))||cells.has(key(rr-dc,cc-dr)))return-1;}return crossings;}
  function put(item,r,c,dir){for(var k=0;k<item.word.length;k++)cells.set(key(r+(dir==='v'?k:0),c+(dir==='h'?k:0)),item.word[k]);placed.push({word:item.word,clue:item.clue,r:r,c:c,dir:dir,num:0});}
  items.forEach(function(item,index){if(index===0){put(item,0,0,'h');return;}var best=null;placed.forEach(function(p){for(var i=0;i<item.word.length;i++)for(var j=0;j<p.word.length;j++){if(item.word[i]!==p.word[j])continue;var dir=p.dir==='h'?'v':'h',r=p.dir==='h'?p.r-i:p.r+j,c=p.dir==='h'?p.c+j:p.c-i,score=fits(item.word,r,c,dir);if(score>0&&(!best||score>best.score))best={r:r,c:c,dir:dir,score:score};}});if(best){put(item,best.r,best.c,best.dir);return;}isolated++;var maxR=Math.max.apply(null,Array.from(cells.keys()).map(function(k){return Number(k.split(',')[0]);})),minC=Math.min.apply(null,Array.from(cells.keys()).map(function(k){return Number(k.split(',')[1]);}));put(item,maxR+2,minC,'h');});
  var minR=Math.min.apply(null,placed.map(function(p){return p.r;})),minC=Math.min.apply(null,placed.map(function(p){return p.c;}));placed.forEach(function(p){p.r-=minR;p.c-=minC;});var starts=Array.from(new Set(placed.map(function(p){return p.r+','+p.c;}))).sort(function(a,b){var x=a.split(',').map(Number),y=b.split(',').map(Number);return x[0]-y[0]||x[1]-y[1];});placed.forEach(function(p){p.num=starts.indexOf(p.r+','+p.c)+1;});return{placed:placed,isolated:isolated};
}

function runCrossword(stage,cfg,ctx){
  var words=layoutCrossword(cfg.entries),rows=Math.max.apply(null,words.map(function(w){return w.r+(w.dir==='v'?w.word.length:1);})),cols=Math.max.apply(null,words.map(function(w){return w.c+(w.dir==='h'?w.word.length:1);})),solution=new Map(),numbers=new Map(),solved=new Set(),activeWord=0,reveals=3;
  function cellsOf(w){return Array.from({length:w.word.length},function(_,k){return(w.r+(w.dir==='v'?k:0))+','+(w.c+(w.dir==='h'?k:0));});}
  words.forEach(function(w){cellsOf(w).forEach(function(k,i){solution.set(k,w.word[i]);});numbers.set(w.r+','+w.c,w.num);});var html='';for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var k=r+','+c;html+=solution.has(k)?'<label class="sa-cw__cell">'+(numbers.has(k)?'<small>'+numbers.get(k)+'</small>':'')+'<input data-k="'+k+'" maxlength="1" autocomplete="off" aria-label="Casilla"></label>':'<span class="sa-cw__void"></span>';}
  function clues(dir){return words.map(function(w,i){return{w:w,i:i};}).filter(function(x){return x.w.dir===dir;}).sort(function(a,b){return a.w.num-b.w.num;}).map(function(x){return'<li data-clue="'+x.i+'"><b>'+x.w.num+'</b><span>'+esc(x.w.clue)+'</span><em>'+x.w.word.length+'</em></li>';}).join('');}
  stage.innerHTML='<div class="sa-cw"><div class="sa-cw__board"><div class="sa-cw__grid" style="--cols:'+cols+'">'+html+'</div></div><aside class="sa-cw__clues"><span>Horizontales</span><ol>'+clues('h')+'</ol><span>Verticales</span><ol>'+clues('v')+'</ol><button type="button" data-reveal>Revelar una letra · <b data-left>3</b></button></aside></div>';
  function input(k){return stage.querySelector('input[data-k="'+k+'"]');}function highlight(){stage.querySelectorAll('.is-active').forEach(function(e){e.classList.remove('is-active');});cellsOf(words[activeWord]).forEach(function(k){var el=input(k);if(el)el.parentElement.classList.add('is-active');});var clue=stage.querySelector('[data-clue="'+activeWord+'"]');if(clue)clue.classList.add('is-active');}
  function check(){words.forEach(function(w,i){if(solved.has(i))return;if(cellsOf(w).every(function(k){var el=input(k);return el&&el.value===solution.get(k);})){
      solved.add(i);cellsOf(w).forEach(function(k){input(k).parentElement.classList.add('is-solved');});var clue=stage.querySelector('[data-clue="'+i+'"]');if(clue)clue.classList.add('is-solved');ctx.points(100,clue);
    }});ctx.progress(solved.size,words.length);ctx.stat('Palabras',solved.size+'/'+words.length);if(solved.size===words.length)ctx.win('¡Crucigrama resuelto!');}
  function wordsAt(k){return words.map(function(w,i){return{w:w,i:i};}).filter(function(x){return cellsOf(x.w).includes(k);});}
  stage.querySelectorAll('input').forEach(function(el){el.onfocus=function(){var opts=wordsAt(el.dataset.k);if(!opts.some(function(o){return o.i===activeWord;}))activeWord=opts[0].i;highlight();};el.onclick=function(){var opts=wordsAt(el.dataset.k);if(opts.length>1){var other=opts.find(function(o){return o.i!==activeWord;});if(other)activeWord=other.i;highlight();}};el.oninput=function(){el.value=norm(el.value).slice(-1);check();if(!el.value)return;var list=cellsOf(words[activeWord]),next=list[list.indexOf(el.dataset.k)+1];if(next)input(next).focus();};el.onkeydown=function(e){if(e.key==='Backspace'&&!el.value){var list=cellsOf(words[activeWord]),prev=list[list.indexOf(el.dataset.k)-1];if(prev){e.preventDefault();input(prev).value='';input(prev).focus();}}};});
  stage.querySelectorAll('[data-clue]').forEach(function(li){li.onclick=function(){activeWord=Number(li.dataset.clue);var k=cellsOf(words[activeWord]).find(function(x){return input(x).value!==solution.get(x);})||cellsOf(words[activeWord])[0];input(k).focus();highlight();};});
  stage.querySelector('[data-reveal]').onclick=function(){if(!reveals)return;var target=words[activeWord]&&!solved.has(activeWord)?words[activeWord]:words.find(function(_,i){return!solved.has(i);});if(!target)return;var k=cellsOf(target).find(function(x){return input(x).value!==solution.get(x);});if(!k)return;input(k).value=solution.get(k);input(k).parentElement.classList.add('is-revealed');reveals--;stage.querySelector('[data-left]').textContent=reveals;ctx.mistake(stage.querySelector('[data-reveal]'),25);check();};ctx.progress(0,words.length);ctx.stat('Palabras','0/'+words.length);highlight();return function(){};
}

function runMemory(stage,cfg,ctx){var cards=shuffle(cfg.pairs.flatMap(function(p,i){return[{pair:i,text:p[0],kind:'term'},{pair:i,text:p[1],kind:'def'}];})),open=[],matched=new Set(),busy=false,moves=0,streak=0;stage.innerHTML='<div class="sa-memo">'+cards.map(function(c,i){return'<button type="button" data-card="'+i+'"><span class="sa-memo__inner"><span class="sa-memo__back"><b>S</b><small>SYNOVA</small></span><span class="sa-memo__front"><small>'+(c.kind==='term'?'Término':'Definición')+'</small><b>'+esc(c.text)+'</b></span></span></button>';}).join('')+'</div>';ctx.progress(0,cfg.pairs.length);ctx.stat('Movimientos',0);stage.onclick=function(e){var btn=e.target.closest('[data-card]');if(!btn||busy)return;var i=Number(btn.dataset.card);if(open.includes(i)||matched.has(cards[i].pair))return;btn.classList.add('is-open');open.push(i);if(open.length<2)return;moves++;ctx.stat('Movimientos',moves);var a=open[0],b=open[1];if(cards[a].pair===cards[b].pair&&cards[a].kind!==cards[b].kind){matched.add(cards[a].pair);streak++;open.forEach(function(n){stage.querySelector('[data-card="'+n+'"]').classList.add('is-matched');});ctx.points(100+Math.max(0,streak-1)*20,btn,streak>1?'×'+streak+' racha':null);open=[];ctx.progress(matched.size,cfg.pairs.length);if(matched.size===cfg.pairs.length)ctx.win('¡Memoria clínica completada!');}else{busy=true;streak=0;ctx.mistake(btn,0);open.forEach(function(n){stage.querySelector('[data-card="'+n+'"]').classList.add('is-wrong');});setTimeout(function(){open.forEach(function(n){stage.querySelector('[data-card="'+n+'"]').classList.remove('is-open','is-wrong');});open=[];busy=false;},900);}};return function(){stage.onclick=null;};}

function buildWordsearch(words,size){var grid=Array.from({length:size},function(){return Array(size).fill('');}),placements=[],dirs=[[0,1],[1,0],[1,1],[-1,1],[0,-1],[1,-1]];words.forEach(function(raw){var word=norm(raw),placed=false;for(var t=0;t<250&&!placed;t++){var d=dirs[Math.floor(Math.random()*dirs.length)],r=Math.floor(Math.random()*size),c=Math.floor(Math.random()*size),er=r+d[0]*(word.length-1),ec=c+d[1]*(word.length-1);if(er<0||er>=size||ec<0||ec>=size)continue;var ok=true;for(var i=0;i<word.length;i++){var x=grid[r+d[0]*i][c+d[1]*i];if(x&&x!==word[i]){ok=false;break;}}if(!ok)continue;var cells=[];for(var j=0;j<word.length;j++){var rr=r+d[0]*j,cc=c+d[1]*j;grid[rr][cc]=word[j];cells.push(rr+','+cc);}placements.push({word:word,cells:cells});placed=true;}});for(var r=0;r<size;r++)for(var c=0;c<size;c++)if(!grid[r][c])grid[r][c]=LETTERS[Math.floor(Math.random()*LETTERS.length)];return{grid:grid,placements:placements};}
function runWordsearch(stage,cfg,ctx){
  var built=buildWordsearch(cfg.words,12),found=new Set(),start=null,tap=null,dragging=false,suppressClick=false;
  var cellsHtml=built.grid.map(function(row,r){
    return row.map(function(ch,c){return'<button type="button" data-pos="'+r+','+c+'">'+ch+'</button>';}).join('');
  }).join('');
  var wordsHtml=built.placements.map(function(p,i){return'<li data-word="'+i+'"><i></i>'+p.word+'</li>';}).join('');
  stage.innerHTML='<div class="sa-soup"><div class="sa-soup__grid">'+cellsHtml+'</div><aside><span>Palabras</span><ul>'+wordsHtml+'</ul><p>Arrastra en línea recta o toca la primera y la última letra.</p></aside></div>';
  ctx.progress(0,built.placements.length);ctx.stat('Encontradas','0/'+built.placements.length);
  var grid=stage.querySelector('.sa-soup__grid');
  function pos(el){return el.dataset.pos.split(',').map(Number);}
  function line(a,b){
    var dr=Math.sign(b[0]-a[0]),dc=Math.sign(b[1]-a[1]);
    var len=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));
    var straight=dr===0||dc===0||Math.abs(b[0]-a[0])===Math.abs(b[1]-a[1]);
    if(!len||!straight)return[];
    return Array.from({length:len+1},function(_,i){return(a[0]+dr*i)+','+(a[1]+dc*i);});
  }
  function clear(){grid.querySelectorAll('.is-select').forEach(function(e){e.classList.remove('is-select');});}
  function show(cells){clear();cells.forEach(function(k){var el=grid.querySelector('[data-pos="'+k+'"]');if(el)el.classList.add('is-select');});}
  function evaluate(cells){
    clear();if(!cells.length)return;
    var direct=cells.join('|'),reverse=cells.slice().reverse().join('|');
    var idx=built.placements.findIndex(function(p,i){return !found.has(i)&&(p.cells.join('|')===direct||p.cells.join('|')===reverse);});
    if(idx<0){ctx.mistake(grid,0);return;}
    found.add(idx);
    built.placements[idx].cells.forEach(function(k){var el=grid.querySelector('[data-pos="'+k+'"]');if(el)el.classList.add('is-found','found-'+(idx%6));});
    var wordEl=stage.querySelector('[data-word="'+idx+'"]');wordEl.classList.add('is-found');ctx.points(100,wordEl);
    ctx.progress(found.size,built.placements.length);ctx.stat('Encontradas',found.size+'/'+built.placements.length);
    if(found.size===built.placements.length)ctx.win('¡Sopa de términos resuelta!');
  }
  grid.onpointerdown=function(e){var cell=e.target.closest('[data-pos]');if(!cell)return;dragging=true;start=pos(cell);if(grid.setPointerCapture)grid.setPointerCapture(e.pointerId);show([cell.dataset.pos]);};
  grid.onpointermove=function(e){if(!dragging||!start)return;var el=document.elementFromPoint(e.clientX,e.clientY),cell=el&&el.closest&&el.closest('[data-pos]');if(cell&&grid.contains(cell))show(line(start,pos(cell)));};
  grid.onpointerup=function(e){if(!dragging)return;dragging=false;var el=document.elementFromPoint(e.clientX,e.clientY),cell=el&&el.closest&&el.closest('[data-pos]');if(cell&&grid.contains(cell)){var cells=line(start,pos(cell));if(cells.length>1){suppressClick=true;evaluate(cells);setTimeout(function(){suppressClick=false;},0);}}start=null;};
  grid.onclick=function(e){if(dragging||suppressClick)return;var cell=e.target.closest('[data-pos]');if(!cell)return;if(!tap){tap=pos(cell);clear();cell.classList.add('is-select');return;}var first=tap;tap=null;evaluate(line(first,pos(cell)));};
  return function(){grid.onpointerdown=grid.onpointermove=grid.onpointerup=grid.onclick=null;};
}

function runPuzzle(stage,cfg,ctx){
  var side=Math.max(3,Math.min(4,Number(cfg.side)||3)),total=side*side,order=shuffle(Array.from({length:total},function(_,i){return i;})),selected=null,drag=null,moves=0;
  if(order.every(function(piece,slot){return piece===slot;}))order.reverse();
  stage.innerHTML='<div class="sa-jigsaw"><div class="sa-jigsaw__main"><div class="sa-jigsaw__board" data-board style="--side:'+side+'"></div></div><aside><span>Imagen de referencia</span><div class="sa-jigsaw__reference" style="background-image:url(\''+cfg.image+'\')"></div><strong data-moves>0 movimientos</strong><p>Toca dos piezas para intercambiarlas o arrastra una sobre otra. Las piezas en su posición se marcan en verde.</p></aside></div>';
  var board=stage.querySelector('[data-board]');
  function render(){
    board.innerHTML=order.map(function(piece,slot){var x=piece%side,y=Math.floor(piece/side),px=side===1?0:x/(side-1)*100,py=side===1?0:y/(side-1)*100;return'<button type="button" draggable="true" data-slot="'+slot+'" class="'+(piece===slot?'is-correct ':'')+(selected===slot?'is-selected':'')+'" style="background-image:url(\''+cfg.image+'\');background-size:'+(side*100)+'% '+(side*100)+'%;background-position:'+px+'% '+py+'%"><small>'+(slot+1)+'</small></button>';}).join('');
    var placed=order.filter(function(piece,slot){return piece===slot;}).length;ctx.progress(placed,total);ctx.stat('Piezas',placed+'/'+total);stage.querySelector('[data-moves]').textContent=moves+' movimiento'+(moves===1?'':'s');
  }
  function swap(a,b){if(a===b)return;var temp=order[a];order[a]=order[b];order[b]=temp;moves++;selected=null;render();if(order.every(function(piece,slot){return piece===slot;})){board.classList.add('is-complete');ctx.points(Math.max(250,900-moves*20),board);setTimeout(function(){ctx.win('¡Imagen clínica reconstruida!');},450);}}
  board.onclick=function(e){var piece=e.target.closest('[data-slot]');if(!piece)return;var slot=Number(piece.dataset.slot);if(selected===null){selected=slot;render();return;}swap(selected,slot);};
  board.ondragstart=function(e){var piece=e.target.closest('[data-slot]');if(piece){drag=Number(piece.dataset.slot);piece.classList.add('is-dragging');}};
  board.ondragover=function(e){e.preventDefault();};
  board.ondrop=function(e){e.preventDefault();var piece=e.target.closest('[data-slot]');if(piece&&drag!==null){swap(drag,Number(piece.dataset.slot));drag=null;}};
  render();return function(){board.onclick=board.ondragstart=board.ondragover=board.ondrop=null;};
}

function runGuess(stage,cfg,ctx){var round=0,totalErrors=0,word='',clue='',used=new Set(),errors=0,locked=false;stage.innerHTML='<div class="sa-guess"><div class="sa-guess__visual"><span data-lives></span><div class="sa-guess__pulse"><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="sa-guess__play"><span>Concepto <b data-round>1</b> de '+cfg.words.length+'</span><p data-clue></p><div class="sa-guess__word" data-word></div><div class="sa-guess__keys" data-keys></div></div></div>';function paint(){stage.querySelector('[data-round]').textContent=round+1;stage.querySelector('[data-clue]').textContent=clue;stage.querySelector('[data-lives]').textContent=(6-errors)+' intentos';stage.querySelectorAll('.sa-guess__pulse i').forEach(function(e,i){e.classList.toggle('is-lost',i>=6-errors);});stage.querySelector('[data-word]').innerHTML=Array.from(word).map(function(ch){return'<i>'+(used.has(ch)?ch:'')+'</i>';}).join('');stage.querySelector('[data-keys]').innerHTML=Array.from(LETTERS).map(function(ch){return'<button type="button" data-letter="'+ch+'" '+(used.has(ch)||locked?'disabled':'')+'>'+ch+'</button>';}).join('');}function next(){if(round>=cfg.words.length){ctx.win('¡Conceptos descubiertos!');return;}word=norm(cfg.words[round][0]);clue=cfg.words[round][1];used=new Set();errors=0;locked=false;paint();ctx.progress(round,cfg.words.length);ctx.stat('Errores',totalErrors);}function choose(ch){if(locked||used.has(ch))return;used.add(ch);if(word.includes(ch)){ctx.points(20,stage.querySelector('[data-letter="'+ch+'"]').parentElement);if(Array.from(word).every(function(x){return used.has(x);}))setTimeout(function(){ctx.points(100,stage.querySelector('[data-word]'));round++;ctx.progress(round,cfg.words.length);next();},450);}else{errors++;totalErrors++;ctx.mistake(stage.querySelector('[data-letter="'+ch+'"]').parentElement,0);if(errors>=6){locked=true;setTimeout(function(){Array.from(word).forEach(function(x){used.add(x);});paint();ctx.feedback('Revisa la respuesta y vuelve a intentar este concepto. Debes resolverlo para avanzar.','error');setTimeout(function(){used=new Set();errors=0;locked=false;paint();ctx.feedback('Nuevo intento: usa la pista clínica para descubrir el término.','');},1100);},300);}}paint();ctx.stat('Errores',totalErrors);}stage.onclick=function(e){var b=e.target.closest('[data-letter]');if(b)choose(b.dataset.letter);};next();return function(){stage.onclick=null;};}

function runClassify(stage,cfg,ctx){var queue=shuffle(cfg.items.map(function(x,i){return{text:x[0],cat:x[1],id:i};})),index=0,streak=0,current=null;stage.innerHTML='<div class="sa-sort"><header><span>Clasificación clínica</span><h3>'+esc(cfg.question)+'</h3></header><div class="sa-sort__arena"><div class="sa-sort__card" data-card></div><div class="sa-sort__bins">'+cfg.categories.map(function(c,i){return'<button type="button" data-cat="'+i+'"><small>Categoría '+String(i+1).padStart(2,'0')+'</small><b>'+esc(c)+'</b><span data-count="'+i+'">0 elementos</span></button>';}).join('')+'</div></div></div>';var card=stage.querySelector('[data-card]');function show(){if(index>=queue.length){ctx.win('¡Clasificación completada!');return;}current=queue[index];card.innerHTML='<small>Hallazgo '+(index+1)+' de '+queue.length+'</small><strong>'+esc(current.text)+'</strong><span>Selecciona su categoría ↓</span>';card.className='sa-sort__card';ctx.progress(index,queue.length);ctx.stat('Racha',streak);}stage.onclick=function(e){var bin=e.target.closest('[data-cat]');if(!bin||!current)return;var cat=Number(bin.dataset.cat);if(cat!==current.cat){streak=0;ctx.mistake(bin,0);bin.classList.remove('is-wrong');void bin.offsetWidth;bin.classList.add('is-wrong');ctx.feedback('Ese hallazgo pertenece a otra prioridad. Revisa el nivel de riesgo e inténtalo de nuevo.','error');ctx.stat('Racha',0);return;}streak++;bin.classList.add('is-good');var count=Number(bin.dataset.placed||0)+1;bin.dataset.placed=count;bin.querySelector('[data-count]').textContent=count+(count===1?' elemento':' elementos');card.classList.add('is-fly');ctx.points(80+Math.max(0,streak-1)*20,bin,streak>1?'×'+streak+' racha':null);setTimeout(function(){index++;show();},450);};show();return function(){stage.onclick=null;};}

var RUNNERS={crossword:runCrossword,memory:runMemory,wordsearch:runWordsearch,puzzle:runPuzzle,guess:runGuess,classify:runClassify};

function playLesson(options){return new Promise(function(resolve){var seed=hash(String(options.courseId)+':'+String(options.classNumber||1)),game=CATALOG[seed%CATALOG.length],board=game.boards[(seed+Number(options.classNumber||0))%game.boards.length];openEngine({game:game,board:board,mode:'lesson',lessonTitle:options.lessonTitle,credits:options.credits||10,resolve:resolve,onClose:function(){}});});}
window.SynovaGameSuite={catalog:CATALOG,playLesson:playLesson,open:openEngine};
})();
