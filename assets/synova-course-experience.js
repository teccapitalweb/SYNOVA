(function(){
  'use strict';
  var activeGame=null, activeChest=null;
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function key(courseId,classNumber){var u=(window.UserState&&window.UserState.uid)||'guest';return 'synova:class-game:'+u+':'+courseId+':'+classNumber;}
  function hasWon(courseId,classNumber){try{return localStorage.getItem(key(courseId,classNumber))==='1';}catch(_){return false;}}
  function shuffle(items){var out=items.slice();for(var i=out.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=out[i];out[i]=out[j];out[j]=t;}return out;}
  var BANK=[
    {q:'Ante un dato clínico inesperado, ¿cuál es la conducta más segura?',o:['Actuar sin confirmar para ahorrar tiempo','Verificar el dato, valorar al paciente y documentar','Ignorar el dato si no coincide con la expectativa'],a:1,e:'La verificación y la valoración clínica reducen errores y permiten una decisión trazable.'},
    {q:'¿Qué debe hacerse antes de ejecutar una intervención clínica?',o:['Confirmar identidad, indicación y condiciones de seguridad','Asumir que la indicación anterior sigue vigente','Omitir la explicación para agilizar el proceso'],a:0,e:'La identificación, la indicación correcta y una revisión de seguridad son barreras esenciales.'},
    {q:'Si el estado del paciente cambia durante un procedimiento, lo primero es…',o:['Continuar hasta terminar','Priorizar la seguridad, reevaluar y escalar según protocolo','Esperar a que el cambio desaparezca solo'],a:1,e:'Un cambio clínico exige pausar, reevaluar y comunicar oportunamente.'},
    {q:'¿Cuál es el mejor registro al terminar una atención?',o:['Uno breve sin hora ni respuesta clínica','Uno objetivo, oportuno y con la respuesta del paciente','Solo una nota personal fuera del expediente'],a:1,e:'El registro debe ser objetivo, oportuno y reflejar tanto la intervención como su resultado.'},
    {q:'Cuando existe una duda sobre dosis, equipo o técnica, corresponde…',o:['Improvisar con base en la memoria','Consultar la fuente vigente y pedir apoyo antes de actuar','Usar la misma decisión para todos los pacientes'],a:1,e:'Consultar el protocolo vigente y pedir apoyo previene eventos evitables.'},
    {q:'¿Qué criterio tiene prioridad al elegir entre dos acciones posibles?',o:['La opción más rápida en todos los casos','La alternativa con mejor balance entre beneficio, riesgo y contexto','La opción que requiera menos documentación'],a:1,e:'La decisión clínica debe integrar beneficio, riesgo, contexto y preferencias del paciente.'},
    {q:'Una comunicación clínica efectiva debe incluir…',o:['Datos relevantes, acción solicitada y confirmación de comprensión','Solo el diagnóstico probable','Información incompleta para evitar preguntas'],a:0,e:'La comunicación estructurada y la confirmación de comprensión disminuyen fallas de continuidad.'},
    {q:'¿Cuál es una señal de aprendizaje aplicado?',o:['Repetir una definición sin relacionarla con el caso','Explicar por qué una acción es segura y cuándo cambiarla','Memorizar sin revisar resultados'],a:1,e:'Aplicar implica justificar decisiones y reconocer cuándo el contexto exige ajustarlas.'}
  ];
  function questions(options){
    var custom=options.session&&(options.session.ejercicio||options.session.exercise);
    var list=[];
    if(custom){
      var source=Array.isArray(custom)?custom:[custom];
      source.forEach(function(x){if(x&&x.pregunta&&Array.isArray(x.opciones)&&x.opciones.length>=2)list.push({q:x.pregunta,o:x.opciones,a:Number(x.correcta||0),e:x.explicacion||'Respuesta correcta.'});});
    }
    var seed=String(options.courseId)+':'+String(options.classNumber||options.lessonIndex||0);
    var n=seed.split('').reduce(function(s,c){return s+c.charCodeAt(0);},0);
    for(var i=0;list.length<3&&i<BANK.length;i++)list.push(BANK[(n+i*3)%BANK.length]);
    return list.slice(0,3);
  }
  function play(options){
    options=options||{};
    if(window.SynovaGameSuite&&typeof window.SynovaGameSuite.playLesson==='function'){
      return window.SynovaGameSuite.playLesson(options).then(function(won){
        if(won){try{localStorage.setItem(key(options.courseId,options.classNumber),'1');}catch(_){}}
        return !!won;
      });
    }
    if(activeGame)activeGame.remove();
    return new Promise(function(resolve){
      var qs=questions(options),index=0,finished=false;
      var layer=document.createElement('div');layer.className='cg-overlay';activeGame=layer;
      layer.innerHTML='<section class="cg-card" role="dialog" aria-modal="true" aria-labelledby="cg-title"><header class="cg-head"><span class="cg-head__icon"><svg class="ic"><use href="#i-trophy"/></svg></span><div><small>Ejercicio para avanzar · '+esc(options.courseTitle||'Curso SYNOVA')+'</small><h2 id="cg-title">'+esc(options.lessonTitle||'Comprueba lo aprendido')+'</h2></div><button class="cg-close" type="button" aria-label="Cerrar">×</button></header><main class="cg-body"><div class="cg-progress"><span></span></div><div class="cg-counter"><span data-count></span><span>'+(options.practica?'Modo práctica':'+'+(options.credits||10)+' créditos al completar')+'</span></div><div data-stage></div></main></section>';
      document.body.appendChild(layer);document.body.style.overflow='hidden';requestAnimationFrame(function(){layer.classList.add('is-open');});
      function close(result){if(finished)return;finished=true;layer.classList.remove('is-open');document.body.style.overflow='';setTimeout(function(){layer.remove();if(activeGame===layer)activeGame=null;resolve(!!result);},220);}
      layer.querySelector('.cg-close').onclick=function(){close(false);};
      layer.addEventListener('click',function(e){if(e.target===layer)close(false);});
      function render(){
        var q=qs[index],stage=layer.querySelector('[data-stage]');
        stage.dataset.answered='0';
        layer.querySelector('.cg-progress span').style.width=((index/qs.length)*100)+'%';
        layer.querySelector('[data-count]').textContent='Pregunta '+(index+1)+' de '+qs.length;
        stage.innerHTML='<h3 class="cg-question">'+esc(q.q)+'</h3><div class="cg-options">'+q.o.map(function(o,i){return '<button type="button" class="cg-option" data-answer="'+i+'"><b>'+String.fromCharCode(65+i)+'</b><span>'+esc(o)+'</span></button>';}).join('')+'</div><div class="cg-feedback">Elige la mejor respuesta para continuar.</div>';
        stage.querySelectorAll('[data-answer]').forEach(function(btn){btn.onclick=function(){
          if(stage.dataset.answered==='1')return;
          var picked=Number(btn.dataset.answer),correct=picked===Number(q.a),feedback=stage.querySelector('.cg-feedback');
          if(!correct){btn.classList.add('is-wrong');feedback.innerHTML='<strong>Revisa tu decisión.</strong> Piensa primero en la seguridad, la valoración y el protocolo aplicable.';setTimeout(function(){btn.classList.remove('is-wrong');},500);return;}
          stage.dataset.answered='1';btn.classList.add('is-correct');stage.querySelectorAll('.cg-option').forEach(function(b){b.disabled=true;});
          feedback.innerHTML='<strong>Correcto.</strong> '+esc(q.e)+'<button type="button" class="cg-next">'+(index===qs.length-1?'Completar clase':'Siguiente pregunta')+' →</button>';
          feedback.querySelector('.cg-next').onclick=function(){
            if(index<qs.length-1){index++;render();return;}
            try{localStorage.setItem(key(options.courseId,options.classNumber),'1');}catch(_){}
            layer.querySelector('.cg-progress span').style.width='100%';close(true);
          };
        };});
      }
      render();
    });
  }
  var COIN='<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#e8930c"/><circle cx="20" cy="20" r="15.5" fill="url(#syn-cc-coin)"/><circle cx="20" cy="20" r="12" fill="none" stroke="#c9780a" stroke-width="1.6" stroke-dasharray="2 2.2"/><path d="M24.6 15.4a6.4 6.4 0 1 0 0 9.2" fill="none" stroke="#8a4f05" stroke-width="3" stroke-linecap="round"/><ellipse cx="14" cy="12" rx="4" ry="2" fill="#fff" opacity=".55" transform="rotate(-30 14 12)"/></svg>';
  var CHEST='<svg class="cc-chest-svg" viewBox="0 0 200 170" aria-hidden="true"><defs><linearGradient id="syn-cc-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#99602d"/><stop offset="1" stop-color="#573214"/></linearGradient><linearGradient id="syn-cc-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b57436"/><stop offset="1" stop-color="#714318"/></linearGradient><linearGradient id="syn-cc-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a6"/><stop offset=".55" stop-color="#f5bd3f"/><stop offset="1" stop-color="#c9820e"/></linearGradient><radialGradient id="syn-cc-coin" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff2b8"/><stop offset=".45" stop-color="#ffc83d"/><stop offset="1" stop-color="#f09a12"/></radialGradient><radialGradient id="syn-cc-inner" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#ffe27b"/><stop offset=".5" stop-color="#d99018"/><stop offset="1" stop-color="#573214"/></radialGradient></defs><ellipse cx="100" cy="160" rx="78" ry="8" fill="rgba(0,0,0,.22)"/><path d="M30 70h140v18H30z" fill="url(#syn-cc-inner)"/><g class="cc-pile"><ellipse cx="70" cy="80" rx="13" ry="5" fill="#f5b52a" stroke="#b9770b" stroke-width="1.5"/><ellipse cx="96" cy="76" rx="13" ry="5" fill="#ffd36a" stroke="#b9770b" stroke-width="1.5"/><ellipse cx="122" cy="80" rx="13" ry="5" fill="#f5b52a" stroke="#b9770b" stroke-width="1.5"/><ellipse cx="108" cy="70" rx="12" ry="4.5" fill="#ffe08a" stroke="#b9770b" stroke-width="1.5"/><ellipse cx="82" cy="71" rx="12" ry="4.5" fill="#ffd36a" stroke="#b9770b" stroke-width="1.5"/><ellipse cx="96" cy="64" rx="11" ry="4" fill="#fff0b0" stroke="#b9770b" stroke-width="1.5"/></g><rect x="26" y="82" width="148" height="74" rx="10" fill="url(#syn-cc-wood)"/><path d="M26 104h148M26 130h148" stroke="#442509" stroke-width="2" opacity=".55"/><rect x="26" y="82" width="16" height="74" rx="4" fill="url(#syn-cc-gold)"/><rect x="158" y="82" width="16" height="74" rx="4" fill="url(#syn-cc-gold)"/><rect x="84" y="94" width="32" height="34" rx="7" fill="url(#syn-cc-gold)" stroke="#80520d" stroke-width="2"/><circle cx="100" cy="108" r="5" fill="#503006"/><path d="M100 110v9" stroke="#503006" stroke-width="4" stroke-linecap="round"/><g class="cc-lid"><path d="M26 84V62c0-26 32-40 74-40s74 14 74 40v22z" fill="url(#syn-cc-lid)"/><path d="M26 84V62c0-26 32-40 74-40s74 14 74 40v22" fill="none" stroke="#442509" stroke-width="2" opacity=".5"/><path d="M42 84V52c0-14 2-20 6-24M158 84V52c0-14-2-20-6-24" stroke="url(#syn-cc-gold)" stroke-width="14" fill="none"/><rect x="22" y="78" width="156" height="10" rx="4" fill="url(#syn-cc-gold)"/></g></svg>';
  function showChest(options){
    options=options||{};var amount=Math.max(0,Math.round(Number(options.amount)||0));if(!amount)return;
    if(activeChest)activeChest.remove();
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var coins=Math.min(8,Math.max(3,Math.ceil(amount/2))),total=Number.isFinite(Number(options.total))?Math.max(0,Number(options.total)):null;
    var layer=document.createElement('div');layer.className='cc-overlay';layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');activeChest=layer;
    layer.innerHTML='<div class="cc-card"><div class="cc-stage"><div class="cc-rays" aria-hidden="true"></div>'+Array.from({length:coins},function(_,i){var x=(i%2?1:-1)*(8+(i*7)%26);return '<span class="cc-coin" style="--i:'+i+';--x:'+x+'px">'+COIN+'</span>';}).join('')+CHEST+Array.from({length:6},function(_,i){return '<i class="cc-spark" style="--a:'+(i*60)+'deg"></i>';}).join('')+'</div><span class="cc-kicker">'+esc(options.title||'¡Créditos ganados!')+'</span><strong class="cc-amount">+<b data-cc-count>'+(reduce?amount:0)+'</b> créditos</strong><span class="cc-total">Se sumaron a tu saldo'+(total!==null?' · Total <b>'+total.toLocaleString('es-MX')+'</b>':'')+'</span><small class="cc-hint">Toca para continuar</small></div>';
    document.body.appendChild(layer);requestAnimationFrame(function(){layer.classList.add('is-open');});
    if(!reduce){var counter=layer.querySelector('[data-cc-count]'),start=performance.now()+650,length=260*coins;var tick=function(now){var t=Math.min(1,Math.max(0,(now-start)/length));counter.textContent=String(Math.round(amount*t));if(t<1&&layer.isConnected)requestAnimationFrame(tick);};requestAnimationFrame(tick);}
    function close(){if(!layer.isConnected||layer.classList.contains('is-closing'))return;layer.classList.add('is-closing');setTimeout(function(){layer.remove();if(activeChest===layer)activeChest=null;},380);}layer.onclick=close;setTimeout(close,options.duration||3800);
  }
  window.SynovaClassGames={play:play,hasWon:hasWon};
  window.SynovaCoinChest={show:showChest};
})();
