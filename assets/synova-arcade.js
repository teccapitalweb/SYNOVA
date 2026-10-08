(function(){
'use strict';
var state=null;
var today=function(){return new Date().toLocaleDateString('en-CA');};
var shuffle=function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;};
var esc=function(v){return String(v).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});};
function root(){return document.getElementById('content');}
function back(){return '<button class="btn btn--ghost btn--sm syn-back" onclick="abrirArcadeSynova()">← Volver a Juegos clínicos</button>';}
window.abrirArcadeSynova=function(){
  root().innerHTML='<div class="syn-arcade"><button class="btn btn--ghost btn--sm syn-back" onclick="pintarHubRetos()">← Volver a Retos</button><section class="syn-arcade-hero"><div class="syn-arcade-hero__copy"><span class="syn-kicker">Arcade clínico</span><h1>Entrena de otra forma.</h1><p>Cuatro experiencias cortas para ordenar procesos, reconocer conceptos y detectar señales clínicas importantes.</p></div><div class="syn-arcade-hero__tiles" aria-hidden="true"><i>+</i><i>Rx</i><i>03</i><i>AB</i><i>✓</i><i>ECG</i></div></section><div class="syn-section-head"><div><span class="syn-eyebrow">Elige una modalidad</span><h2>Juegos clínicos</h2></div><span>Supera el reto y gana créditos</span></div><div class="syn-arcade-grid">'+[
    ['puzzle','🧩','Secuencia','Rompecabezas clínico','Ordena correctamente un procedimiento seguro.'],
    ['memory','◫','Memoria','Memorama de conceptos','Relaciona cada término con su definición clínica.'],
    ['search','⌕','Observación','Caza del hallazgo','Encuentra las señales de alarma ocultas en un caso.'],
    ['crossword','#','Vocabulario','Crucigrama SYNOVA','Resuelve pistas esenciales de seguridad clínica.']
  ].map(function(g){return '<button class="syn-arcade-mode" onclick="iniciarArcadeSynova(\''+g[0]+'\')"><span class="syn-arcade-mode__icon">'+g[1]+'</span><span class="syn-arcade-mode__copy"><small>'+g[2]+'</small><strong>'+g[3]+'</strong><span>'+g[4]+'</span></span><i class="syn-arcade-mode__go">→</i></button>';}).join('')+'</div><div class="syn-source-note"><svg class="ic"><use href="#i-info"/></svg><span>Contenido educativo para reforzar criterios. Sigue siempre los protocolos de tu institución y la valoración del equipo responsable.</span></div></div>';
};
window.iniciarArcadeSynova=async function(type){
  if(!window.__synovaCanStartChallenge){window.Toast&&Toast.info('Preparando el juego','Intenta de nuevo en un momento.');return;}
  var access=await window.__synovaCanStartChallenge({source:'arcade',activityId:type+':'+today()});if(!access)return;
  if(type==='puzzle')startPuzzle();else if(type==='memory')startMemory();else if(type==='search')startSearch();else startCrossword();
};
function shell(kicker,title,copy,body){root().innerHTML='<div class="syn-arcade-play">'+back()+'<div class="syn-arcade-top"><span class="syn-arcade-progress"><i></i> Juego en curso</span><span class="syn-eyebrow">+ créditos al superar</span></div><section class="syn-arcade-board"><header class="syn-arcade-board__head"><span>'+kicker+'</span><h1>'+title+'</h1><p>'+copy+'</p></header>'+body+'<div id="arcade-feedback" aria-live="polite"></div></section></div>';}
function feedback(text,error){var el=document.getElementById('arcade-feedback');if(el)el.innerHTML='<div class="syn-arcade-feedback '+(error?'is-error':'')+'">'+esc(text)+'</div>';}
async function finish(type,title,copy){
  await window.__synovaAwardChallenge?.({source:'arcade',activityId:type+':'+today(),correct:5});
  root().innerHTML='<div class="syn-arcade-play"><section class="syn-arcade-board syn-arcade-win"><span class="syn-arcade-win__icon">✓</span><h2>'+esc(title)+'</h2><p>'+esc(copy)+'</p><div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center"><button class="btn btn--accent" onclick="abrirArcadeSynova()">Elegir otro juego</button><button class="btn btn--ghost" onclick="pintarHubRetos()">Volver a Retos</button></div></section></div>';
  window.celebrarSynova&&window.celebrarSynova('grande');
}
function startPuzzle(){
  var items=['Higiene de manos','Identificar al paciente','Explicar y confirmar','Preparar el material','Realizar el procedimiento','Registrar y reevaluar'];
  var order=shuffle(items);if(order.every(function(x,i){return x===items[i];}))order.reverse();state={type:'puzzle',items:items,order:order,selected:-1};renderPuzzle();
}
function renderPuzzle(){shell('Rompecabezas de secuencia','Ordena una atención segura','Toca dos piezas para intercambiarlas. Construye la secuencia clínica desde la preparación hasta el registro.','<div class="syn-sequence">'+state.order.map(function(x,i){return '<button class="'+(state.selected===i?'is-selected':'')+'" onclick="moverPiezaSynova('+i+')"><b>PIEZA '+String(i+1).padStart(2,'0')+'</b><span>'+esc(x)+'</span></button>';}).join('')+'</div><div class="syn-game-action"><button onclick="validarPuzzleSynova()">Comprobar secuencia →</button></div>');}
window.moverPiezaSynova=function(i){if(state.selected<0){state.selected=i;renderPuzzle();return;}var t=state.order[state.selected];state.order[state.selected]=state.order[i];state.order[i]=t;state.selected=-1;renderPuzzle();};
window.validarPuzzleSynova=function(){if(state.order.every(function(x,i){return x===state.items[i];}))finish('puzzle','Secuencia completada','Ordenaste todas las acciones en un flujo seguro.');else feedback('Aún hay piezas fuera de orden. Revisa preparación, ejecución y reevaluación.',true);};
function startMemory(){
  var pairs=[['ABCDE','Prioriza amenazas vitales'],['SBAR','Estructura la entrega clínica'],['Asepsia','Reduce contaminación del procedimiento'],['Reevaluar','Comprueba la respuesta del paciente']];
  var cards=shuffle(pairs.flatMap(function(p,i){return[{id:i,text:p[0]},{id:i,text:p[1]}];}));state={type:'memory',cards:cards,open:[],matched:new Set(),lock:false};renderMemory();
}
function renderMemory(){shell('Memorama clínico','Encuentra las parejas','Relaciona cada concepto con su aplicación. Las parejas correctas permanecen visibles.','<div class="syn-memory">'+state.cards.map(function(c,i){var open=state.open.includes(i),match=state.matched.has(c.id);return '<button class="'+(match?'is-match':open?'is-open':'')+'" '+(match?'disabled':'')+' onclick="voltearMemoriaSynova('+i+')">'+esc(c.text)+'</button>';}).join('')+'</div>');}
window.voltearMemoriaSynova=function(i){if(state.lock||state.open.includes(i)||state.matched.has(state.cards[i].id))return;state.open.push(i);renderMemory();if(state.open.length===2){state.lock=true;var a=state.cards[state.open[0]],b=state.cards[state.open[1]];setTimeout(function(){if(a.id===b.id)state.matched.add(a.id);state.open=[];state.lock=false;if(state.matched.size===4)finish('memory','Memoria clínica superada','Relacionaste cada concepto con su uso en la práctica.');else renderMemory();},a.id===b.id?550:900);}};
function startSearch(){
  var findings=[['Inicio súbito',true],['Debilidad de un brazo',true],['Habla arrastrada',true],['Desayunó temprano',false],['Usa lentes',false],['Dolor de 2/10',false],['Calzado cómodo',false],['Acudió acompañado',false],['Tiene 52 años',false]];state={type:'search',findings:shuffle(findings),hits:new Set(),misses:new Set()};renderSearch();
}
function renderSearch(){shell('Búsqueda de hallazgos','Detecta tres señales de alarma','Paciente de 52 años llega con cambio neurológico. Selecciona únicamente los datos que activan una respuesta prioritaria.','<div class="syn-find-case"><strong>Caso · Posible evento neurológico agudo</strong><p>Lee cada hallazgo y separa la información crítica de los datos que no modifican la prioridad inmediata.</p></div><div class="syn-find-grid">'+state.findings.map(function(x,i){return '<button class="'+(state.hits.has(i)?'is-hit':state.misses.has(i)?'is-miss':'')+'" onclick="hallazgoSynova('+i+')">'+esc(x[0])+'</button>';}).join('')+'</div>');feedback('Encontradas '+state.hits.size+' de 3 señales de alarma.',false);}
window.hallazgoSynova=function(i){if(state.hits.has(i)||state.misses.has(i))return;if(state.findings[i][1])state.hits.add(i);else state.misses.add(i);if(state.hits.size===3){finish('search','Hallazgos identificados','Reconociste las señales neurológicas que requieren activación inmediata.');return;}renderSearch();if(state.misses.has(i))feedback('Ese dato aporta contexto, pero no es una señal de alarma inmediata.',true);};
function startCrossword(){
  var clues=[['ABCDE','Secuencia de valoración primaria'],['SBAR','Formato de comunicación clínica'],['ASEPSIA','Técnica para evitar contaminación'],['TRIAGE','Clasificación por prioridad'],['PULSO','Signo vital que refleja frecuencia cardiaca']];state={type:'crossword',clues:clues};
  var pattern=['A','B','C','D','E','', '', 'S','', '', 'T','R','I','A','G','E','', 'B','', '', 'P','U','L','S','O'];
  shell('Crucigrama SYNOVA','Completa el vocabulario clínico','Resuelve las cinco pistas. Puedes escribir con o sin acentos.','<div class="syn-crossword"><div class="syn-cross-grid" aria-hidden="true">'+pattern.map(function(x){return '<i class="'+(!x?'blank':'')+'">'+x+'</i>';}).join('')+'</div><div class="syn-cross-clues">'+clues.map(function(x,i){return '<div class="syn-cross-clue"><b>'+(i+1)+'</b><label>'+esc(x[1])+'<input id="cross-'+i+'" autocomplete="off" aria-label="Respuesta '+(i+1)+'"></label></div>';}).join('')+'<div class="syn-game-action"><button onclick="validarCrucigramaSynova()">Validar respuestas →</button></div></div></div>');
}
window.validarCrucigramaSynova=function(){var ok=state.clues.every(function(x,i){var el=document.getElementById('cross-'+i),v=(el.value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase(),yes=v===x[0];el.style.borderColor=yes?'#45A58C':'#D87676';return yes;});if(ok)finish('crossword','Crucigrama resuelto','Dominaste cinco conceptos esenciales del entorno clínico.');else feedback('Algunas respuestas aún no coinciden con las pistas. Revisa las casillas marcadas.',true);};
})();
