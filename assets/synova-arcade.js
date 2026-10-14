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
function updateWonCount(){var el=document.querySelector('[data-arcade-won]');if(el)el.textContent=wins().length+'/'+CATALOG.length+' ganados hoy';}
function root(){return document.getElementById('content');}
function hash(s){return String(s).split('').reduce(function(n,c){return((n<<5)-n+c.charCodeAt(0))|0;},0)>>>0;}

var CATALOG=[
  {type:'crossword',title:'Crucigrama clínico',description:'Resuelve conceptos médicos a partir de sus pistas',label:'Vocabulario',color:'#1783b4',boards:[
    {topic:'Valoración inicial',config:{image:'assets/images/course-covers/1538108149393-fbbd81895907.jpg',entries:[['TRIAGE','Clasificación de pacientes según la urgencia'],['PULSO','Latido arterial palpable que orienta sobre la frecuencia cardiaca'],['GLASGOW','Escala para valorar el nivel de conciencia'],['DISNEA','Sensación o dificultad para respirar'],['ASEPSIA','Medidas destinadas a evitar la contaminación'],['EDEMA','Acumulación de líquido en los tejidos'],['SEPSIS','Respuesta grave del organismo frente a una infección']] }},
    {topic:'Seguridad del paciente',config:{image:'assets/images/course-covers/1551601651-2a8555f1a136.jpg',entries:[['ALERGIA','Reacción adversa que debe verificarse antes de medicar'],['BARRERA','Medida que intercepta un error antes de alcanzar al paciente'],['SBAR','Estructura breve para comunicar una situación clínica'],['EVENTO','Incidente que produjo o pudo producir daño'],['HIGIENE','Acción esencial de manos antes y después del contacto'],['DOBLECHEQUEO','Verificación independiente para procesos de alto riesgo']] }}]},
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
    {topic:'Prevención de infecciones',config:{question:'Ubica cada acción en el momento correcto.',categories:['Antes del contacto','Durante el procedimiento','Al finalizar'],items:[['Higiene de manos',0],['Verificar material estéril',0],['Mantener campo aséptico',1],['Evitar tocar superficies no preparadas',1],['Desechar punzocortantes de inmediato',2],['Registrar y reevaluar el sitio',2]]}}]},
  {type:'hazard',title:'Encuentra el riesgo',description:'Detecta las condiciones inseguras en una escena clínica real',label:'Seguridad',color:'#c4532d',boards:[
    {topic:'Paciente encamado',config:{image:'assets/images/juegos/riesgo-cuarto.webp',scene:'Cuarto de hospitalización',items:[
      {x:48,y:42,w:25,h:22,label:'Barandal abajo',tip:'Con el paciente en cama, los barandales van arriba para prevenir caídas, sobre todo en adultos mayores.'},
      {x:7,y:68,w:26,h:24,label:'Piso mojado sin señalizar',tip:'Un derrame se seca y se señaliza de inmediato: es causa frecuente de caídas de pacientes y personal.'},
      {x:91,y:2,w:9,h:31,label:'Timbre fuera del alcance',tip:'El timbre debe quedar al alcance de la mano del paciente para que pida ayuda sin levantarse.'},
      {x:78,y:34,w:22,h:16,label:'Medicamentos sin etiqueta',tip:'Todo medicamento junto al paciente debe estar identificado; sin etiqueta no se administra.'}]}},
    {topic:'Área de curación',config:{image:'assets/images/juegos/riesgo-curacion.webp',scene:'Carro y área de curación',items:[
      {x:51,y:80,w:17,h:19,label:'Gasas usadas en el piso',tip:'El material usado va directo a su contenedor de residuos, nunca al piso.'},
      {x:34,y:21,w:8,h:20,label:'Frasco de solución destapado',tip:'Las soluciones se mantienen tapadas y rotuladas con fecha y hora de apertura para evitar contaminación.'},
      {x:18,y:33,w:16,h:12,label:'Guantes usados sobre material limpio',tip:'Los guantes usados contaminan el área limpia: se desechan y se realiza higiene de manos.'},
      {x:18,y:12,w:16,h:21,label:'Contenedor de punzocortantes sobrellenado',tip:'El contenedor rígido se cierra al llegar a 80% de su capacidad; sobrellenado provoca punciones accidentales.'}]}},
    {topic:'Terapia intravenosa',config:{image:'assets/images/juegos/riesgo-venoclisis.webp',scene:'Paciente con venoclisis',items:[
      {x:52,y:0,w:9,h:19,label:'Solución sin etiqueta',tip:'Cada solución se rotula con paciente, contenido, aditivos, hora de inicio y responsable.'},
      {x:85,y:52,w:12,h:10,label:'Aguja suelta en la mesa',tip:'Las agujas se desechan de inmediato en el contenedor rígido, sin reencapuchar.'},
      {x:66,y:79,w:30,h:20,label:'Línea de infusión en el piso',tip:'La línea arrastrando se contamina y puede provocar tropiezos o el retiro accidental del catéter.'},
      {x:19,y:53,w:11,h:11,label:'Apósito despegado',tip:'Con el apósito despegado el sitio de inserción queda expuesto: se cambia y se fija para prevenir infección.'}]}},
    {topic:'Central de esterilización',config:{image:'assets/images/juegos/riesgo-ceye.webp',scene:'CEyE',items:[
      {x:10,y:52,w:31,h:22,label:'Paquete sin cinta testigo',tip:'Sin cinta testigo no se puede verificar que el paquete pasó por el ciclo de esterilización.'},
      {x:41,y:54,w:28,h:29,label:'Paquete roto y húmedo',tip:'Un empaque roto o mojado pierde su condición estéril: se reprocesa, no se usa.'},
      {x:69,y:57,w:31,h:41,label:'Instrumental sucio junto al estéril',tip:'El material sucio nunca comparte superficie con el estéril; las áreas sucia y limpia se separan.'},
      {x:63,y:3,w:35,h:43,label:'Autoclave abierta sin carga',tip:'Fuera de la carga y descarga la autoclave se mantiene cerrada: evita quemaduras y contaminación de la cámara.'}]}}]},
  {type:'spot',title:'Señala en la escena',description:'Ubica cada área clave en la planta de un servicio hospitalario',label:'Ubicación',color:'#0b7a8f',boards:[
    {topic:'Servicio de urgencias',config:{image:'assets/images/juegos/escena-urgencias.webp',zones:[
      {id:'ambulancia',label:'Acceso de ambulancias',x:7,y:6,w:14,h:40},{id:'triage',label:'Triage',x:22,y:28,w:18,h:24},{id:'espera',label:'Sala de espera',x:9,y:66,w:20,h:26},
      {id:'choque',label:'Sala de choque',x:72,y:2,w:26,h:28},{id:'central',label:'Central de enfermería',x:46,y:36,w:24,h:24},{id:'cubiculos',label:'Cubículos',x:31,y:2,w:40,h:24}],
      rounds:[{q:'Llega un paciente en ambulancia. ¿Por dónde ingresa al servicio?',zone:'ambulancia',tip:'El acceso de ambulancias es independiente de la entrada peatonal para no cruzar flujos.'},
        {q:'¿Dónde se clasifica al paciente según la gravedad de su condición?',zone:'triage',tip:'En triage se valora en minutos y se asigna prioridad; de ahí se decide a qué área pasa.'},
        {q:'Un paciente entra en paro cardiorrespiratorio. ¿A qué área lo llevas?',zone:'choque',tip:'La sala de choque concentra monitor, desfibrilador y carro rojo para la reanimación inmediata.'},
        {q:'¿Desde dónde se vigilan los monitores y se coordina al equipo?',zone:'central',tip:'La central de enfermería tiene vista a los cubículos para vigilar y responder rápido.'}]}},
    {topic:'Piso de hospitalización',config:{image:'assets/images/juegos/escena-hospitalizacion.webp',zones:[
      {id:'aislamiento',label:'Aislamiento',x:76,y:2,w:22,h:32},{id:'septico',label:'Cuarto séptico',x:1,y:38,w:20,h:24},{id:'carro',label:'Carro rojo',x:68,y:27,w:10,h:11},
      {id:'limpio',label:'Cuarto limpio',x:82,y:41,w:16,h:27},{id:'central',label:'Central de enfermería',x:33,y:38,w:30,h:22},{id:'cuartos',label:'Cuartos de pacientes',x:19,y:67,w:60,h:25}],
      rounds:[{q:'Ingresa un paciente con sospecha de tuberculosis. ¿Dónde lo ubicas?',zone:'aislamiento',tip:'El aislamiento con antesala permite colocar y retirar el equipo de protección sin contaminar el pasillo.'},
        {q:'¿A dónde llevas la ropa sucia y los residuos después de un baño de esponja?',zone:'septico',tip:'El cuarto séptico concentra lo contaminado y separa los flujos sucio y limpio del piso.'},
        {q:'Hay un paro en el pasillo. ¿Dónde está el carro rojo?',zone:'carro',tip:'El carro rojo debe estar visible, accesible y revisado en cada turno.'},
        {q:'¿Dónde preparas medicamentos y material limpio?',zone:'limpio',tip:'El cuarto limpio está separado del séptico para evitar la contaminación cruzada.'}]}},
    {topic:'Área quirúrgica',config:{image:'assets/images/juegos/escena-quirofano.webp',zones:[
      {id:'quirofano',label:'Quirófano',x:2,y:2,w:37,h:37},{id:'lavado',label:'Lavado quirúrgico',x:40,y:3,w:23,h:36},{id:'ceye',label:'Equipos estériles',x:64,y:2,w:34,h:37},
      {id:'pasillo',label:'Pasillo de circulación',x:2,y:44,w:96,h:15},{id:'recuperacion',label:'Recuperación',x:2,y:62,w:46,h:30},{id:'vestidores',label:'Vestidores',x:50,y:62,w:25,h:30},{id:'regaderas',label:'Sanitarios',x:76,y:62,w:22,h:30}],
      rounds:[{q:'¿Dónde se realiza el lavado quirúrgico de manos antes de entrar a cirugía?',zone:'lavado',tip:'El lavado quirúrgico se hace junto al quirófano para entrar directamente con manos y antebrazos limpios.'},
        {q:'¿Dónde se resguardan los equipos estériles listos para la cirugía?',zone:'ceye',tip:'El material estéril se guarda en un área cerrada, limpia y con control de caducidad de cada paquete.'},
        {q:'Termina la cirugía. ¿A qué área pasa el paciente para vigilar su recuperación anestésica?',zone:'recuperacion',tip:'En recuperación se monitorizan signos vitales y estado de conciencia hasta el alta del área.'},
        {q:'¿Dónde se cambia el personal a ropa quirúrgica?',zone:'vestidores',tip:'Los vestidores son la transición entre la zona negra y la gris del área quirúrgica.'}]}},
    {topic:'Tococirugía',config:{image:'assets/images/juegos/escena-tococirugia.webp',zones:[
      {id:'labor',label:'Sala de labor',x:2,y:1,w:31,h:37},{id:'expulsion',label:'Sala de expulsión',x:34,y:1,w:28,h:37},{id:'quirofano',label:'Quirófano obstétrico',x:64,y:1,w:33,h:37},
      {id:'recuperacion',label:'Recuperación',x:2,y:61,w:37,h:32},{id:'cuna',label:'Cuna de calor radiante',x:69,y:55,w:8,h:27},{id:'carro',label:'Carro rojo',x:77,y:62,w:7,h:16},{id:'estacion',label:'Estación de enfermería',x:40,y:66,w:17,h:26}],
      rounds:[{q:'Una paciente en trabajo de parto con 5 cm de dilatación. ¿Dónde la vigilas?',zone:'labor',tip:'En la sala de labor se vigila la dinámica uterina y la frecuencia cardiaca fetal hasta la dilatación completa.'},
        {q:'El parto es inminente. ¿A qué sala la trasladas?',zone:'expulsion',tip:'La sala de expulsión cuenta con mesa obstétrica y equipo para la atención del parto.'},
        {q:'Nace el bebé. ¿Dónde recibe la atención inmediata?',zone:'cuna',tip:'La cuna de calor radiante evita la hipotermia mientras se valora y atiende al recién nacido.'},
        {q:'Hemorragia obstétrica: ¿dónde está el carro rojo?',zone:'carro',tip:'En Código Mater cada segundo cuenta: el carro rojo debe estar a la vista y completo.'}]}}]}

];

var RULES={
  crossword:['Toca una pista o casilla y escribe la palabra.','Cada letra correcta se marca en verde de inmediato.','Ayúdame revela letras sin límite ni penalización.'],
  memory:['Voltea dos cartas y une término con definición.','Los aciertos consecutivos aumentan tu racha.','Ayúdame encuentra una pareja por ti.'],
  wordsearch:['Arrastra desde la primera hasta la última letra.','Las palabras pueden ir en horizontal, vertical o diagonal.','Ayúdame marca una palabra completa.'],
  puzzle:['Toca una pieza y luego otra para intercambiarlas.','También puedes arrastrar una pieza sobre su destino.','Ayúdame coloca una pieza correctamente.'],
  guess:['Usa el teclado para descubrir tres conceptos.','Los errores enseñan y nunca bloquean el avance.','Ayúdame revela todas las letras que necesites.'],
  classify:['Toca una categoría para colocar la tarjeta activa.','Si fallas, se señala la categoría correcta.','Ayúdame coloca el hallazgo por ti.'],
  hazard:['Observa la escena clínica con calma.','Toca cada condición insegura que encuentres: hay 4 escondidas.','Ayúdame te señala un riesgo y te explica por qué.'],
  spot:['Lee la situación clínica.','Toca en la planta el área correcta del servicio.','Si fallas dos veces, el área correcta se ilumina.']
};
var PAR={crossword:[300,1,4],memory:[120,4,9],wordsearch:[180,2,6],puzzle:[90,0,2],guess:[180,3,7],classify:[90,0,2],hazard:[120,2,5],spot:[90,1,3]};

function art(type){
  if(type==='crossword')return'<span class="sa-art sa-art--cross"><i>L</i><i>O</i><i>B</i><i>S</i><i>A</i></span>';
  if(type==='memory')return'<span class="sa-art sa-art--memo"><i>Rx</i><i>ABCDE</i><i>?</i></span>';
  if(type==='wordsearch')return'<span class="sa-art sa-art--soup"><b>P U L S O</b><b>A S E P S</b><b>R I E S G</b><b>D O L O R</b></span>';
  if(type==='puzzle')return'<span class="sa-art sa-art--puzzle">'+Array.from({length:9},function(_,i){return'<i class="p'+i+'"></i>';}).join('')+'</span>';
  if(type==='guess')return'<span class="sa-art sa-art--guess"><b>S</b><i>?</i><b>P</b><b>S</b><b>I</b><b>S</b></span>';
  if(type==='hazard')return'<span class="sa-art sa-art--photo" style="background-image:url(\'assets/images/juegos/riesgo-cuarto.webp\')"><i style="left:56%;top:52%"></i><i style="left:18%;top:78%"></i></span>';
  if(type==='spot')return'<span class="sa-art sa-art--photo" style="background-image:url(\'assets/images/juegos/escena-urgencias.webp\')"><i class="is-pin" style="left:31%;top:40%"></i></span>';
  return'<span class="sa-art sa-art--sort"><i>Crítico</i><b>SpO₂ 82%</b><i>Seguimiento</i></span>';
}

window.abrirArcadeSynova=function(){
  var list=wins();
  root().innerHTML='<div class="sa-page"><button class="btn btn--ghost btn--sm syn-back" onclick="pintarHubRetos()">← Volver a Retos</button><header class="sa-page__head"><div><span class="syn-eyebrow">Juegos clínicos</span><h1>Juega y gana créditos</h1><p>Un tablero nuevo cada día. Resuélvelo, fortalece tu criterio y suma <strong>+30 créditos</strong> por juego.</p></div><span class="sa-page__daily" data-arcade-won>'+list.length+'/'+CATALOG.length+' ganados hoy</span></header><div class="sa-catalog">'+CATALOG.map(function(g){var b=g.boards[dayNumber()%g.boards.length],done=list.includes(g.type);return'<button class="sa-card '+(done?'is-won':'')+'" style="--game:'+g.color+'" onclick="iniciarArcadeSynova(\''+g.type+'\')"><span class="sa-card__visual">'+art(g.type)+'</span><span class="sa-card__body"><span class="sa-card__label">'+esc(g.label)+(done?' · COMPLETADO':'')+'</span><strong>'+esc(g.title)+'</strong><span class="sa-card__desc">'+esc(g.description)+'</span><small>HOY · '+esc(b.topic.toUpperCase())+'</small><span class="sa-card__foot"><b>+30 créditos</b><em>'+(done?'Practicar':'Jugar')+' →</em></span></span></button>';}).join('')+'</div><div class="syn-source-note"><svg class="ic"><use href="#i-info"/></svg><span>Entrenamiento educativo. La conducta real siempre depende de la valoración del paciente y de los protocolos vigentes de tu institución.</span></div></div>';
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
    overlay.querySelector('.sa-hud').hidden=false;body.innerHTML='<div class="sa-stage sa-stage--'+game.type+'" data-stage></div><div class="sa-assist"><span>¿Te atoraste? La ayuda completa un paso y no te quita avance.</span><button type="button" data-help hidden>✦ Ayúdame</button></div><div class="sa-feedback" data-feedback aria-live="polite"></div>';
    var stage=body.querySelector('[data-stage]'),timeEl=overlay.querySelector('[data-time]'),scoreEl=overlay.querySelector('[data-score]'),helpBtn=body.querySelector('[data-help]'),helpAction=null;
    timer=setInterval(function(){seconds++;timeEl.textContent=clock(seconds);},1000);
    var ctx={stage:stage,
      points:function(n,at,label){points=Math.max(0,points+n);scoreEl.textContent=points;scoreEl.parentElement.classList.remove('is-pop');void scoreEl.parentElement.offsetWidth;scoreEl.parentElement.classList.add('is-pop');floatText(label||('+'+n),at||stage,n<0?'bad':'good');},
      mistake:function(at,penalty){mistakes++;if(penalty){points=Math.max(0,points-penalty);scoreEl.textContent=points;}floatText(penalty?('−'+penalty):'×',at||stage,'bad');overlay.querySelector('.sa-modal').classList.remove('is-hurt');void overlay.querySelector('.sa-modal').offsetWidth;overlay.querySelector('.sa-modal').classList.add('is-hurt');},
      progress:function(n,total){overlay.querySelector('[data-progress]').style.width=(total?Math.round(n/total*100):0)+'%';},
      stat:function(label,value){var s=overlay.querySelector('[data-stat]');s.hidden=false;s.querySelector('[data-stat-label]').textContent=label;s.querySelector('[data-stat-value]').textContent=value;},
      feedback:function(text,tone){var f=body.querySelector('[data-feedback]');if(f){f.className='sa-feedback '+(tone?'is-'+tone:'');f.textContent=text;}},
      help:function(label,action){helpAction=action;helpBtn.hidden=false;helpBtn.textContent='✦ '+label;helpBtn.onclick=function(){if(!done&&helpAction)helpAction();};},
      win:win,isOver:function(){return done;}
    };
    cleanup=RUNNERS[game.type](stage,board.config,ctx)||function(){};
  }
  function floatText(text,at,tone){var r=at.getBoundingClientRect(),el=document.createElement('span');el.className='sa-float is-'+tone;el.textContent=text;el.style.left=(r.left+r.width/2)+'px';el.style.top=(r.top+Math.min(r.height/2,65))+'px';overlay.appendChild(el);setTimeout(function(){el.remove();},1000);}
  function win(message){if(done)return;done=true;clearInterval(timer);var help=body.querySelector('[data-help]');if(help)help.disabled=true;var p=PAR[game.type],stars=mistakes<=p[1]&&seconds<=p[0]?3:mistakes<=p[2]&&seconds<=p[0]*2?2:1,bonus=Math.max(0,p[0]-seconds)*2;points+=bonus;setTimeout(function(){results(stars,bonus,message);},window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?120:750);}
  function results(stars,bonus,message){
    cleanup();cleanup=function(){};body.innerHTML='<div class="sa-result"><div class="sa-stars" aria-label="'+stars+' de 3 estrellas">'+[1,2,3].map(function(n){return'<span class="'+(n<=stars?'is-on':'')+'">★</span>';}).join('')+'</div><span class="sa-result__eyebrow">Tablero completado</span><h3>'+esc(message||'Excelente criterio clínico')+'</h3><p>'+esc(game.title)+' · '+esc(board.topic)+'</p><div class="sa-result__stats"><div><span>Tiempo</span><b>'+clock(seconds)+'</b></div><div><span>Puntos</span><b>'+points+'</b>'+(bonus?'<small>+'+bonus+' rapidez</small>':'')+'</div><div><span>Errores</span><b>'+mistakes+'</b></div></div><div class="sa-result__reward" data-reward>'+(options.mode==='lesson'?'Clase lista para completar':'Sumando tus créditos…')+'</div><div class="sa-result__actions">'+(options.mode==='arcade'?'<button type="button" class="sa-secondary" data-another>Elegir otro juego</button>':'')+'<button type="button" class="sa-primary" data-finish>'+(options.mode==='lesson'?'Completar clase y continuar':'Volver a Juegos clínicos')+' <span>→</span></button></div></div>';
    if(window.celebrarSynova)window.celebrarSynova(stars===3?'grande':'normal');
    if(options.mode==='arcade'){
      Promise.resolve(options.onWin&&options.onWin({seconds:seconds,points:points,mistakes:mistakes,stars:stars})).then(function(credits){var el=body.querySelector('[data-reward]');if(el)el.innerHTML=credits?'<span class="sa-coin">C</span><b>+'+credits+' créditos sumados a tu cartera</b>':'Tablero superado · recompensa diaria ya registrada';});
      body.querySelector('[data-another]').onclick=function(){close(false);setTimeout(window.abrirArcadeSynova,240);};
      body.querySelector('[data-finish]').onclick=function(){close(false);setTimeout(window.abrirArcadeSynova,240);};
    }else{
      body.querySelector('[data-finish]').onclick=function(){close(true);};
      var earned=Number(options.credits)||0,rw=body.querySelector('[data-reward]');
      if(earned>0){if(rw)rw.innerHTML='<span class="sa-coin">C</span><b>+'+earned+' créditos por superar la clase</b>';setTimeout(function(){if(window.SynovaCoinChest)window.SynovaCoinChest.show({amount:earned,title:'¡Mini juego superado!'});},500);}
    }
  }
  return{close:close};
}

function mark(type){var map={crossword:'#',memory:'◫',wordsearch:'⌕',puzzle:'☷',guess:'A?',classify:'≡',hazard:'⚠',spot:'⌖'};return'<b>'+map[type]+'</b>';}

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
  var words=layoutCrossword(cfg.entries),rows=Math.max.apply(null,words.map(function(w){return w.r+(w.dir==='v'?w.word.length:1);})),cols=Math.max.apply(null,words.map(function(w){return w.c+(w.dir==='h'?w.word.length:1);})),solution=new Map(),numbers=new Map(),solved=new Set(),activeWord=0;
  function cellsOf(w){return Array.from({length:w.word.length},function(_,k){return(w.r+(w.dir==='v'?k:0))+','+(w.c+(w.dir==='h'?k:0));});}
  words.forEach(function(w){cellsOf(w).forEach(function(k,i){solution.set(k,w.word[i]);});numbers.set(w.r+','+w.c,w.num);});var html='';for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var k=r+','+c;html+=solution.has(k)?'<label class="sa-cw__cell">'+(numbers.has(k)?'<small>'+numbers.get(k)+'</small>':'')+'<input data-k="'+k+'" maxlength="1" autocomplete="off" aria-label="Casilla"></label>':'<span class="sa-cw__void"></span>';}
  function clues(dir){return words.map(function(w,i){return{w:w,i:i};}).filter(function(x){return x.w.dir===dir;}).sort(function(a,b){return a.w.num-b.w.num;}).map(function(x){return'<li data-clue="'+x.i+'"><b>'+x.w.num+'</b><span>'+esc(x.w.clue)+'</span><em>'+x.w.word.length+'</em></li>';}).join('');}
  stage.innerHTML='<div class="sa-cw'+(cfg.image?' has-photo':'')+'">'+(cfg.image?'<figure class="sa-cw__photo"><img src="'+esc(cfg.image)+'" alt="" decoding="async"></figure>':'')+'<div class="sa-cw__board"><div class="sa-cw__grid" style="--cols:'+cols+'">'+html+'</div></div><aside class="sa-cw__clues"><span>Horizontales</span><ol>'+clues('h')+'</ol><span>Verticales</span><ol>'+clues('v')+'</ol><button type="button" data-reveal>Revelar una letra · sin límite</button></aside></div>';
  function input(k){return stage.querySelector('input[data-k="'+k+'"]');}function highlight(){stage.querySelectorAll('.is-active').forEach(function(e){e.classList.remove('is-active');});cellsOf(words[activeWord]).forEach(function(k){var el=input(k);if(el)el.parentElement.classList.add('is-active');});var clue=stage.querySelector('[data-clue="'+activeWord+'"]');if(clue)clue.classList.add('is-active');}
  function paintLetter(el){el.parentElement.classList.toggle('is-letter-correct',!!el.value&&el.value===solution.get(el.dataset.k));}
  function check(){words.forEach(function(w,i){if(solved.has(i))return;if(cellsOf(w).every(function(k){var el=input(k);return el&&el.value===solution.get(k);})){
      solved.add(i);cellsOf(w).forEach(function(k){input(k).parentElement.classList.add('is-solved');});var clue=stage.querySelector('[data-clue="'+i+'"]');if(clue)clue.classList.add('is-solved');ctx.points(100,clue);
    }});ctx.progress(solved.size,words.length);ctx.stat('Palabras',solved.size+'/'+words.length);if(solved.size===words.length)ctx.win('¡Crucigrama resuelto!');}
  function wordsAt(k){return words.map(function(w,i){return{w:w,i:i};}).filter(function(x){return cellsOf(x.w).includes(k);});}
  stage.querySelectorAll('input').forEach(function(el){el.onfocus=function(){var opts=wordsAt(el.dataset.k);if(!opts.some(function(o){return o.i===activeWord;}))activeWord=opts[0].i;highlight();};el.onclick=function(){var opts=wordsAt(el.dataset.k);if(opts.length>1){var other=opts.find(function(o){return o.i!==activeWord;});if(other)activeWord=other.i;highlight();}};el.oninput=function(){el.value=norm(el.value).slice(-1);paintLetter(el);check();if(!el.value)return;var list=cellsOf(words[activeWord]),next=list[list.indexOf(el.dataset.k)+1];if(next)input(next).focus();};el.onkeydown=function(e){if(e.key==='Backspace'&&!el.value){var list=cellsOf(words[activeWord]),prev=list[list.indexOf(el.dataset.k)-1];if(prev){e.preventDefault();var previous=input(prev);previous.value='';paintLetter(previous);previous.focus();}}};});
  stage.querySelectorAll('[data-clue]').forEach(function(li){li.onclick=function(){activeWord=Number(li.dataset.clue);var k=cellsOf(words[activeWord]).find(function(x){return input(x).value!==solution.get(x);})||cellsOf(words[activeWord])[0];input(k).focus();highlight();};});
  function revealLetter(){var target=words[activeWord]&&!solved.has(activeWord)?words[activeWord]:words.find(function(_,i){return!solved.has(i);});if(!target)return;var k=cellsOf(target).find(function(x){return input(x).value!==solution.get(x);});if(!k)return;var el=input(k);el.value=solution.get(k);el.parentElement.classList.add('is-revealed');paintLetter(el);ctx.feedback('Letra correcta colocada. Puedes pedir todas las ayudas que necesites.','ok');check();}
  stage.querySelector('[data-reveal]').onclick=revealLetter;ctx.help('Revelar una letra',revealLetter);ctx.progress(0,words.length);ctx.stat('Palabras','0/'+words.length);highlight();return function(){};
}

function runMemory(stage,cfg,ctx){
  var cards=shuffle(cfg.pairs.flatMap(function(p,i){return[{pair:i,text:p[0],kind:'term'},{pair:i,text:p[1],kind:'def'}];})),open=[],matched=new Set(),busy=false,moves=0,streak=0;
  stage.innerHTML='<div class="sa-memo">'+cards.map(function(c,i){return'<button type="button" data-card="'+i+'"><span class="sa-memo__inner"><span class="sa-memo__back"><b>S</b><small>SYNOVA</small></span><span class="sa-memo__front"><small>'+(c.kind==='term'?'Término':'Definición')+'</small><b>'+esc(c.text)+'</b></span></span></button>';}).join('')+'</div>';
  function closeOpen(){open.forEach(function(n){var el=stage.querySelector('[data-card="'+n+'"]');if(el)el.classList.remove('is-open','is-wrong');});open=[];}
  function completePair(pair,assisted,at){if(matched.has(pair))return;closeOpen();matched.add(pair);cards.forEach(function(card,i){if(card.pair===pair){var el=stage.querySelector('[data-card="'+i+'"]');el.classList.add('is-open','is-matched');}});if(assisted){ctx.feedback('Pareja encontrada con ayuda. Puedes seguir practicando sin perder avance.','ok');}else{streak++;ctx.points(100+Math.max(0,streak-1)*20,at,streak>1?'×'+streak+' racha':null);}ctx.progress(matched.size,cfg.pairs.length);if(matched.size===cfg.pairs.length)ctx.win('¡Memoria clínica completada!');}
  ctx.help('Encontrar una pareja',function(){if(busy)return;var pair=cards.map(function(c){return c.pair;}).find(function(id){return!matched.has(id);});if(pair!==undefined)completePair(pair,true,stage);});
  ctx.progress(0,cfg.pairs.length);ctx.stat('Movimientos',0);
  stage.onclick=function(e){var btn=e.target.closest('[data-card]');if(!btn||busy)return;var i=Number(btn.dataset.card);if(open.includes(i)||matched.has(cards[i].pair))return;btn.classList.add('is-open');open.push(i);if(open.length<2)return;moves++;ctx.stat('Movimientos',moves);var a=open[0],b=open[1];if(cards[a].pair===cards[b].pair&&cards[a].kind!==cards[b].kind){completePair(cards[a].pair,false,btn);}else{busy=true;streak=0;ctx.mistake(btn,0);open.forEach(function(n){stage.querySelector('[data-card="'+n+'"]').classList.add('is-wrong');});setTimeout(function(){closeOpen();busy=false;},900);}};
  return function(){stage.onclick=null;};
}

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
  function completePlacement(idx,assisted){
    if(found.has(idx))return;
    found.add(idx);
    built.placements[idx].cells.forEach(function(k){var el=grid.querySelector('[data-pos="'+k+'"]');if(el)el.classList.add('is-found','found-'+(idx%6));});
    var wordEl=stage.querySelector('[data-word="'+idx+'"]');wordEl.classList.add('is-found');
    if(assisted)ctx.feedback('Palabra marcada con ayuda. Puedes pedir otra si la necesitas.','ok');else ctx.points(100,wordEl);
    ctx.progress(found.size,built.placements.length);ctx.stat('Encontradas',found.size+'/'+built.placements.length);
    if(found.size===built.placements.length)ctx.win('¡Sopa de términos resuelta!');
  }
  function evaluate(cells){
    clear();if(!cells.length)return;
    var direct=cells.join('|'),reverse=cells.slice().reverse().join('|');
    var idx=built.placements.findIndex(function(p,i){return !found.has(i)&&(p.cells.join('|')===direct||p.cells.join('|')===reverse);});
    if(idx<0){ctx.mistake(grid,0);return;}
    completePlacement(idx,false);
  }
  ctx.help('Encontrar una palabra',function(){var idx=built.placements.findIndex(function(_,i){return!found.has(i);});if(idx>=0)completePlacement(idx,true);});
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
  function swap(a,b,assisted){if(a===b)return;var temp=order[a];order[a]=order[b];order[b]=temp;moves++;selected=null;render();if(assisted)ctx.feedback('Pieza colocada con ayuda. Puedes pedir todas las que necesites.','ok');if(order.every(function(piece,slot){return piece===slot;})){board.classList.add('is-complete');if(!assisted)ctx.points(Math.max(250,900-moves*20),board);setTimeout(function(){ctx.win('¡Imagen clínica reconstruida!');},450);}}
  ctx.help('Colocar una pieza',function(){var slot=order.findIndex(function(piece,index){return piece!==index;});if(slot<0)return;var source=order.indexOf(slot);swap(slot,source,true);});
  board.onclick=function(e){var piece=e.target.closest('[data-slot]');if(!piece)return;var slot=Number(piece.dataset.slot);if(selected===null){selected=slot;render();return;}swap(selected,slot);};
  board.ondragstart=function(e){var piece=e.target.closest('[data-slot]');if(piece){drag=Number(piece.dataset.slot);piece.classList.add('is-dragging');}};
  board.ondragover=function(e){e.preventDefault();};
  board.ondrop=function(e){e.preventDefault();var piece=e.target.closest('[data-slot]');if(piece&&drag!==null){swap(drag,Number(piece.dataset.slot));drag=null;}};
  render();return function(){board.onclick=board.ondragstart=board.ondragover=board.ondrop=null;};
}

function runGuess(stage,cfg,ctx){
  var round=0,totalErrors=0,word='',clue='',used=new Set(),errors=0,locked=false;
  stage.innerHTML='<div class="sa-guess"><div class="sa-guess__visual"><span data-lives></span><div class="sa-guess__pulse"><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="sa-guess__play"><span>Concepto <b data-round>1</b> de '+cfg.words.length+'</span><p data-clue></p><div class="sa-guess__word" data-word></div><div class="sa-guess__keys" data-keys></div></div></div>';
  function paint(){stage.querySelector('[data-round]').textContent=round+1;stage.querySelector('[data-clue]').textContent=clue;stage.querySelector('[data-lives]').textContent=(6-errors)+' intentos';stage.querySelectorAll('.sa-guess__pulse i').forEach(function(e,i){e.classList.toggle('is-lost',i>=6-errors);});stage.querySelector('[data-word]').innerHTML=Array.from(word).map(function(ch){return'<i>'+(used.has(ch)?ch:'')+'</i>';}).join('');stage.querySelector('[data-keys]').innerHTML=Array.from(LETTERS).map(function(ch){return'<button type="button" data-letter="'+ch+'" '+(used.has(ch)||locked?'disabled':'')+'>'+ch+'</button>';}).join('');}
  function next(){if(round>=cfg.words.length){ctx.win('¡Conceptos descubiertos!');return;}word=norm(cfg.words[round][0]);clue=cfg.words[round][1];used=new Set();errors=0;locked=false;paint();ctx.progress(round,cfg.words.length);ctx.stat('Errores',totalErrors);}
  function finishRound(assisted){if(locked||!Array.from(word).every(function(ch){return used.has(ch);}))return false;locked=true;paint();if(!assisted)ctx.points(100,stage.querySelector('[data-word]'));setTimeout(function(){round++;ctx.progress(round,cfg.words.length);next();},450);return true;}
  function revealLetter(){if(locked)return;var ch=Array.from(word).find(function(letter){return!used.has(letter);});if(!ch)return;used.add(ch);paint();ctx.feedback('Letra revelada. Puedes pedir otra hasta completar el concepto.','ok');finishRound(true);}
  function choose(ch){if(locked||used.has(ch))return;used.add(ch);var key=stage.querySelector('[data-letter="'+ch+'"]');if(word.includes(ch)){ctx.points(20,key||stage);paint();finishRound(false);}else{errors++;totalErrors++;ctx.mistake(key||stage,0);if(errors>=6){errors=4;ctx.feedback('No te bloqueamos: te regalamos una letra para que continúes.','error');revealLetter();}paint();ctx.stat('Errores',totalErrors);}}
  ctx.help('Revelar una letra',revealLetter);
  stage.onclick=function(e){var b=e.target.closest('[data-letter]');if(b)choose(b.dataset.letter);};next();return function(){stage.onclick=null;};
}

function runClassify(stage,cfg,ctx){
  var queue=shuffle(cfg.items.map(function(x,i){return{text:x[0],cat:x[1],id:i};})),index=0,streak=0,current=null,locked=false;
  stage.innerHTML='<div class="sa-sort"><header><span>Clasificación clínica</span><h3>'+esc(cfg.question)+'</h3></header><div class="sa-sort__arena"><div class="sa-sort__card" data-card></div><div class="sa-sort__bins">'+cfg.categories.map(function(c,i){return'<button type="button" data-cat="'+i+'"><small>Categoría '+String(i+1).padStart(2,'0')+'</small><b>'+esc(c)+'</b><span data-count="'+i+'">0 elementos</span></button>';}).join('')+'</div></div></div>';
  var card=stage.querySelector('[data-card]');
  function show(){if(index>=queue.length){ctx.win('¡Clasificación completada!');return;}locked=false;current=queue[index];stage.querySelectorAll('.is-hint,.is-wrong').forEach(function(el){el.classList.remove('is-hint','is-wrong');});card.innerHTML='<small>Hallazgo '+(index+1)+' de '+queue.length+'</small><strong>'+esc(current.text)+'</strong><span>Selecciona su categoría ↓</span>';card.className='sa-sort__card';ctx.progress(index,queue.length);ctx.stat('Racha',streak);}
  function place(bin,assisted){if(locked||!current)return;locked=true;streak=assisted?0:streak+1;bin.classList.remove('is-hint');bin.classList.add('is-good');var count=Number(bin.dataset.placed||0)+1;bin.dataset.placed=count;bin.querySelector('[data-count]').textContent=count+(count===1?' elemento':' elementos');card.classList.add('is-fly');if(assisted)ctx.feedback('Hallazgo colocado con ayuda. Puedes continuar sin perder avance.','ok');else ctx.points(80+Math.max(0,streak-1)*20,bin,streak>1?'×'+streak+' racha':null);setTimeout(function(){index++;show();},450);}
  ctx.help('Colocar este hallazgo',function(){if(!current||locked)return;var bin=stage.querySelector('[data-cat="'+current.cat+'"]');if(bin)place(bin,true);});
  stage.onclick=function(e){var bin=e.target.closest('[data-cat]');if(!bin||!current||locked)return;var cat=Number(bin.dataset.cat);if(cat!==current.cat){streak=0;ctx.mistake(bin,0);bin.classList.remove('is-wrong');void bin.offsetWidth;bin.classList.add('is-wrong');stage.querySelector('[data-cat="'+current.cat+'"]').classList.add('is-hint');ctx.feedback('La categoría correcta quedó marcada en verde para que puedas continuar.','error');ctx.stat('Racha',0);return;}place(bin,false);};
  show();return function(){stage.onclick=null;};
}

/* ── Encuentra el riesgo: escena real con condiciones inseguras ── */
function pctPoint(el,e){var r=el.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100};}
function runHazard(stage,cfg,ctx){
  var items=cfg.items,found=new Set(),pad=2.5;
  stage.innerHTML='<div class="sa-hz"><div class="sa-hz__scene" data-scene><img src="'+esc(cfg.image)+'" alt="'+esc(cfg.scene||'Escena clínica')+'" draggable="false" decoding="async"><div class="sa-hz__marks" data-marks></div></div><aside class="sa-hz__side"><span>Riesgos detectados · <b data-count>0/'+items.length+'</b></span><ol>'+items.map(function(_,i){return'<li data-item="'+i+'"><b>'+(i+1)+'</b><span>Riesgo por encontrar</span></li>';}).join('')+'</ol><p>Toca en la imagen cada condición insegura. Fíjate en el piso, el equipo, las superficies y el paciente.</p></aside></div>';
  var scene=stage.querySelector('[data-scene]'),marks=stage.querySelector('[data-marks]');
  function reveal(i,assisted){
    if(found.has(i))return;found.add(i);var it=items[i],n=found.size;
    var ring=document.createElement('span');ring.className='sa-hz__ring'+(assisted?' is-assisted':'');ring.style.cssText='left:'+it.x+'%;top:'+it.y+'%;width:'+it.w+'%;height:'+it.h+'%';ring.innerHTML='<b>'+n+'</b>';marks.appendChild(ring);
    var li=stage.querySelector('[data-item="'+(n-1)+'"]');if(li){li.classList.add('is-found');li.innerHTML='<b>'+n+'</b><span><strong>'+esc(it.label)+'</strong>'+esc(it.tip)+'</span>';}
    stage.querySelector('[data-count]').textContent=n+'/'+items.length;
    if(!assisted)ctx.points(100,ring);ctx.feedback((assisted?'Te ayudamos: ':'¡Bien visto! ')+it.label+'. '+it.tip,'ok');
    ctx.progress(n,items.length);ctx.stat('Riesgos',n+'/'+items.length);
    if(n===items.length)ctx.win('¡Detectaste todos los riesgos!');
  }
  scene.addEventListener('click',function(e){
    if(ctx.isOver())return;var p=pctPoint(scene,e),hit=-1;
    items.forEach(function(it,i){if(hit<0&&!found.has(i)&&p.x>=it.x-pad&&p.x<=it.x+it.w+pad&&p.y>=it.y-pad&&p.y<=it.y+it.h+pad)hit=i;});
    if(hit>=0){reveal(hit,false);return;}
    var already=items.some(function(it,i){return found.has(i)&&p.x>=it.x&&p.x<=it.x+it.w&&p.y>=it.y&&p.y<=it.y+it.h;});if(already)return;
    var miss=document.createElement('span');miss.className='sa-hz__miss';miss.style.left=p.x+'%';miss.style.top=p.y+'%';marks.appendChild(miss);setTimeout(function(){miss.remove();},900);
    ctx.mistake(miss,0);ctx.feedback('Ahí no hay un riesgo. Observa con calma: piso, equipo, superficies y al paciente.','error');
  });
  ctx.help('Señalar un riesgo',function(){var i=items.findIndex(function(_,k){return!found.has(k);});if(i>=0)reveal(i,true);});
  ctx.progress(0,items.length);ctx.stat('Riesgos','0/'+items.length);
  return function(){};
}

/* ── Señala en la escena: planta real de un servicio ── */
function runSpot(stage,cfg,ctx){
  var rounds=cfg.rounds,round=0,locked=false,misses=0;
  stage.innerHTML='<div class="sa-spot"><p class="sa-spot__q" data-q></p><div class="sa-spot__frame"><div class="sa-spot__map" data-map><img src="'+esc(cfg.image)+'" alt="Planta del servicio" draggable="false" decoding="async">'+cfg.zones.map(function(z,i){return'<button type="button" class="sa-spot__hit" data-zone="'+z.id+'" style="left:'+z.x+'%;top:'+z.y+'%;width:'+z.w+'%;height:'+z.h+'%" aria-label="Área '+(i+1)+'"></button><span class="sa-spot__label" data-label="'+z.id+'" style="left:'+(z.x+z.w/2)+'%;top:'+(z.y+z.h/2)+'%">'+esc(z.label)+'</span>';}).join('')+'</div></div></div>';
  var map=stage.querySelector('[data-map]'),q=stage.querySelector('[data-q]');
  function show(){misses=0;map.querySelectorAll('.is-hint').forEach(function(el){el.classList.remove('is-hint');});q.innerHTML='<span>Situación '+(round+1)+' de '+rounds.length+'</span>'+esc(rounds[round].q);ctx.progress(round,rounds.length);ctx.stat('Áreas',round+'/'+rounds.length);}
  function complete(btn,assisted){
    if(locked)return;locked=true;var r=rounds[round];btn.classList.remove('is-hint');btn.classList.add('is-correct');var lb=map.querySelector('[data-label="'+r.zone+'"]');if(lb)lb.classList.add('is-visible');
    if(!assisted)ctx.points(100,btn);ctx.feedback((assisted?'Resuelto con ayuda. ':'¡Correcto! ')+r.tip,'ok');round++;ctx.progress(round,rounds.length);ctx.stat('Áreas',round+'/'+rounds.length);
    if(round>=rounds.length){ctx.win('¡Ubicaste todas las áreas del servicio!');return;}
    setTimeout(function(){locked=false;show();},assisted?700:1150);
  }
  map.addEventListener('click',function(e){
    var btn=e.target.closest('[data-zone]');if(!btn||locked||ctx.isOver())return;var r=rounds[round];
    if(btn.dataset.zone===r.zone){complete(btn,false);return;}
    btn.classList.remove('is-wrong');void btn.offsetWidth;btn.classList.add('is-wrong');misses++;ctx.mistake(btn,0);
    if(misses>=2){var ok=map.querySelector('[data-zone="'+r.zone+'"]');if(ok)ok.classList.add('is-hint');ctx.feedback('El área correcta está brillando. Tócala para continuar.','error');}
    else ctx.feedback('Esa no es el área correcta. Lee de nuevo la situación e inténtalo otra vez.','error');
  });
  ctx.help('Resolver esta situación',function(){var ok=map.querySelector('[data-zone="'+rounds[round].zone+'"]');if(ok)complete(ok,true);});
  show();return function(){};
}

var RUNNERS={crossword:runCrossword,memory:runMemory,wordsearch:runWordsearch,puzzle:runPuzzle,guess:runGuess,classify:runClassify,hazard:runHazard,spot:runSpot};

function playLesson(options){return new Promise(function(resolve){var seed=hash(String(options.courseId)+':'+String(options.classNumber||1)),game=CATALOG[seed%CATALOG.length],board=game.boards[(seed+Number(options.classNumber||0))%game.boards.length];openEngine({game:game,board:board,mode:'lesson',lessonTitle:options.lessonTitle,credits:options.credits!=null?Number(options.credits)||0:10,resolve:resolve,onClose:function(){}});});}
window.SynovaGameSuite={catalog:CATALOG,playLesson:playLesson,open:openEngine};
})();
