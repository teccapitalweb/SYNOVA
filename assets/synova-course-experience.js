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
  function showChest(options){
    options=options||{};var amount=Math.max(0,Math.round(Number(options.amount)||0));if(!amount)return;
    if(activeChest)activeChest.remove();
    var layer=document.createElement('div');layer.className='cc-overlay';activeChest=layer;
    layer.innerHTML='<div class="cc-card" role="status"><div class="cc-chest">'+Array.from({length:5},function(_,i){return '<i class="cc-coin" style="--i:'+i+'"></i>';}).join('')+'<span class="cc-chest__lid"></span><span class="cc-chest__box"></span><span class="cc-chest__lock"></span></div><span class="cc-kicker">'+esc(options.title||'¡Créditos ganados!')+'</span><strong class="cc-amount">+'+amount+' créditos</strong><span class="cc-total">Se sumaron a tu saldo'+(Number.isFinite(Number(options.total))?' · Total <b>'+Number(options.total).toLocaleString('es-MX')+'</b>':'')+'</span></div>';
    document.body.appendChild(layer);requestAnimationFrame(function(){layer.classList.add('is-open');});
    function close(){layer.classList.remove('is-open');setTimeout(function(){layer.remove();if(activeChest===layer)activeChest=null;},300);}layer.onclick=close;setTimeout(close,options.duration||3400);
  }
  window.SynovaClassGames={play:play,hasWon:hasWon};
  window.SynovaCoinChest={show:showChest};
})();
