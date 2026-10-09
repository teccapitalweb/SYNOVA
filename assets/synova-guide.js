(() => {
  'use strict';

  const config = window.SYNOVA_GUIDE_CONFIG;
  const knowledge = window.SYNOVA_GUIDE_KNOWLEDGE || {};
  if (!config || document.querySelector('[data-syg-root]')) return;

  const sessionKey = 'synova:guide:session:v1';
  const cookieKey = 'synova:privacy:consent:v1';
  const welcomeKey = 'synova:guide:welcome:v1';
  const emergency = /(?:no\s+respira|dificultad\s+(?:grave\s+)?para\s+respirar|dolor\s+(?:fuerte\s+)?(?:en\s+el\s+)?pecho|convulsi|inconsciente|desmayo|sangrado\s+(?:abundante|que\s+no\s+para)|debilidad\s+repentina|cara\s+caida|habla\s+arrastrada|intento\s+de\s+suicidio|sobredosis|paro\s+cardiaco)/i;
  const personalSymptoms = /(?:yo\s+tengo|me\s+duele|mi\s+hijo|mi\s+bebe|mi\s+paciente|que\s+medicamento\s+tomo|que\s+dosis|diagnostica|tengo\s+estos\s+sintomas)/i;
  const stopwords = new Set(['quiero','curso','cursos','sobre','para','como','algo','una','uno','unos','unas','del','las','los','que','con','por','me','interesa','busco','aprender','capacitacion','tema','pregunta','salud','clinica','clinico','medicina']);

  let messages = [];
  let quickActions = [];
  let waiting = false;
  let motionTimer = 0;
  let route = { step:-1, answers:[], result:[] };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }

  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function timeLabel() {
    try { return new Intl.DateTimeFormat('es-MX', { hour:'2-digit', minute:'2-digit' }).format(new Date()); }
    catch (_) { return ''; }
  }

  function loadSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(sessionKey) || '{}');
      if (Array.isArray(saved.messages)) messages = saved.messages.slice(-18);
    } catch (_) { messages = []; }
    if (!messages.length) messages = [{ role:'assistant', text:config.welcome, time:timeLabel() }];
  }

  function saveSession() {
    try { localStorage.setItem(sessionKey, JSON.stringify({ messages:messages.slice(-18) })); } catch (_) {}
  }

  function courseUrl(course) {
    const params = new URLSearchParams({ tab:'register', origen:'guia-synova', curso:course.id, programa:course.title });
    return `vip-auth.html?${params.toString()}`;
  }

  function tokens(value) {
    return normalize(value).split(' ').filter(token => token.length > 2 && !stopwords.has(token));
  }

  function rankCourses(terms, limit = 3) {
    const wanted = Array.isArray(terms) ? terms : [terms];
    const queryTokens = [...new Set(wanted.flatMap(tokens))];
    return config.courses.map((course, index) => {
      const title = normalize(course.title);
      const haystack = normalize(`${course.title} ${course.area} ${course.detail} ${(course.tags || []).join(' ')}`);
      const titleWords = new Set(title.split(' '));
      const haystackWords = new Set(haystack.split(' '));
      const hasPhrase = (text, phrase) => (` ${text} `).includes(` ${phrase} `);
      const phraseScore = wanted.reduce((score, term) => {
        const phrase = normalize(term);
        if (!phrase) return score;
        return score + (hasPhrase(title, phrase) ? 14 : hasPhrase(haystack, phrase) ? 7 : 0);
      }, 0);
      const tokenScore = queryTokens.reduce((score, token) => score + (titleWords.has(token) ? 5 : haystackWords.has(token) ? 2 : 0), 0);
      return { course, score:phraseScore + tokenScore, index };
    }).filter(item => item.score > 0).sort((a,b) => b.score - a.score || a.index - b.index).slice(0, limit).map(item => item.course);
  }

  function findNamedCourses(names, limit = 3) {
    const selected = [];
    (names || []).forEach(name => {
      const needle = normalize(name);
      const exact = config.courses.find(course => normalize(course.title) === needle);
      const partial = exact || config.courses.find(course => normalize(course.title).includes(needle) || needle.includes(normalize(course.title)));
      if (partial && !selected.some(course => course.id === partial.id)) selected.push(partial);
    });
    return selected.slice(0, limit);
  }

  const root = document.createElement('div');
  root.className = 'syg-root';
  root.dataset.sygRoot = '';
  root.dataset.motion = 'idle';
  root.dataset.paused = 'false';
  root.innerHTML = `
    <button class="syg-launcher" type="button" aria-label="Abrir asistente virtual de SYNOVA">
      <span class="syg-launcher__avatar"><img src="${escapeHtml(config.image)}" alt="Asistente clínica virtual de SYNOVA"></span>
      <span class="syg-launcher__copy">
        <span class="syg-launcher__bubble"><strong>¡Hola! Soy SYNOVA 👋</strong><span>Pregúntame sobre salud o encuentra tu siguiente curso.</span></span>
        <em class="syg-launcher__cta">Preparar mi ruta <b aria-hidden="true">→</b></em>
      </span>
    </button>
    <section class="syg-panel" aria-label="Conversación con SYNOVA, asistente virtual" hidden>
      <header class="syg-header">
        <button class="syg-avatar" type="button" aria-label="Saludar a la asistente"><img src="${escapeHtml(config.image)}" alt="Asistente clínica virtual de SYNOVA"></button>
        <span class="syg-header__title"><strong>${escapeHtml(config.assistantName)}</strong><small>${escapeHtml(config.assistantLabel)}</small></span>
        <span class="syg-header__actions">
          <button class="syg-icon-btn" type="button" data-action="reset" aria-label="Empezar de nuevo" title="Empezar de nuevo">↻</button>
          <button class="syg-icon-btn" type="button" data-action="pause" aria-label="Pausar movimiento" title="Pausar movimiento">Ⅱ</button>
          <button class="syg-icon-btn" type="button" data-action="close" aria-label="Minimizar asistente" title="Minimizar">−</button>
        </span>
      </header>
      <div class="syg-disclosure">Orientación educativa con cursos reales de SYNOVA y respaldo de MedlinePlus. No sustituye atención médica. No escribas nombres ni datos identificables.</div>
      <div class="syg-messages" aria-live="polite"></div>
      <div class="syg-quick" aria-label="Opciones rápidas"></div>
      <form class="syg-composer">
        <label for="syg-input">Escribe tu pregunta</label>
        <input class="syg-input" id="syg-input" maxlength="240" autocomplete="off" placeholder="¿Qué te gustaría aprender?">
        <button class="syg-send" type="submit" aria-label="Enviar mensaje">↑</button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector('.syg-launcher');
  const panel = root.querySelector('.syg-panel');
  const messageBox = root.querySelector('.syg-messages');
  const quickBox = root.querySelector('.syg-quick');
  const input = root.querySelector('.syg-input');
  const send = root.querySelector('.syg-send');

  function courseCards(items) {
    if (!items?.length) return '';
    return `<div class="syg-course-list">${items.map(course => `
      <article class="syg-course">
        <span class="syg-course__badge" aria-hidden="true">✦</span>
        <div><strong>${escapeHtml(course.title)}</strong><span>${escapeHtml(`${course.area} · ${course.classes} clase${course.classes === 1 ? '' : 's'} · ${course.detail}`)}</span></div>
        <a href="${escapeHtml(courseUrl(course))}" aria-label="Ver ${escapeHtml(course.title)} y registrarme">→</a>
      </article>`).join('')}</div>`;
  }

  function sourceCard(source) {
    if (!source?.items?.length) return '';
    return `<div class="syg-source"><span aria-hidden="true">ⓘ</span><span>Información pública de ${escapeHtml(source.name || 'MedlinePlus.gov')} ${source.items.map(item => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>`).join(' · ')}</span></div>`;
  }

  function renderMessages() {
    messageBox.innerHTML = messages.map(message => `
      <div class="syg-message syg-message--${message.role}">
        <div class="syg-message__bubble">
          ${message.role === 'assistant' ? `<span class="syg-message__label">SYNOVA · ASISTENTE VIRTUAL</span>` : ''}
          ${escapeHtml(message.text)}
          ${courseCards(message.items)}
          ${sourceCard(message.source)}
          ${message.human ? `<div class="syg-source"><span aria-hidden="true">💬</span><span><a href="${escapeHtml(config.whatsappUrl)}" target="_blank" rel="noreferrer">Abrir WhatsApp con un asesor</a>. La conversación no se transfiere automáticamente.</span></div>` : ''}
          <span class="syg-message__time">${escapeHtml(message.time || '')}</span>
        </div>
      </div>`).join('') + (waiting ? `<div class="syg-message syg-message--assistant"><div class="syg-message__bubble"><span class="syg-message__label">SYNOVA está consultando</span><span class="syg-thinking" aria-label="Preparando respuesta"><i></i><i></i><i></i></span></div></div>` : '');
    requestAnimationFrame(() => { messageBox.scrollTop = messageBox.scrollHeight; });
  }

  function setQuick(actions) {
    quickActions = actions || [];
    quickBox.innerHTML = quickActions.map((action, index) => `<button type="button" class="syg-chip${action.primary ? ' syg-chip--primary' : ''}" data-quick="${escapeHtml(action.value)}" data-index="${index}">${escapeHtml(action.label)}</button>`).join('');
  }

  function homeActions() {
    setQuick([
      { label:'Descubrir mi ruta', value:'route', primary:true },
      { label:'Buscar por tema', value:'courses' },
      { label:'Aprender conceptos', value:'concepts' },
      { label:'Conocer la membresía', value:'membership' },
      { label:'Resolver una duda', value:'question' },
      { label:'Hablar con un asesor', value:'human' }
    ]);
  }

  function setMotion(value, duration = 900) {
    clearTimeout(motionTimer);
    root.dataset.motion = value;
    if (value !== 'idle') motionTimer = window.setTimeout(() => { root.dataset.motion = 'idle'; }, duration);
  }

  function openAssistant() {
    launcher.hidden = true;
    panel.hidden = false;
    renderMessages();
    if (!quickActions.length) homeActions(); else setQuick(quickActions);
    setMotion('wave');
    window.setTimeout(() => input.focus(), 120);
  }

  function closeAssistant() {
    panel.hidden = true;
    launcher.hidden = false;
    setMotion('wave');
  }

  function addMessage(role, text, extra = {}) {
    messages.push({ role, text:String(text || ''), time:timeLabel(), ...extra });
    messages = messages.slice(-18);
    saveSession();
    renderMessages();
  }

  function reply(text, extra = {}) {
    waiting = false;
    send.disabled = false;
    addMessage('assistant', text, extra);
    setMotion(extra.items?.length ? 'course' : 'answer', extra.items?.length ? 1200 : 760);
  }

  function setWaiting(value) {
    waiting = value;
    send.disabled = value;
    renderMessages();
    if (value) setMotion('think', 16000);
  }

  function findConcept(value) {
    const normalized = normalize(value);
    let best = null;
    let bestScore = 0;
    Object.values(knowledge).forEach(concept => {
      (concept.aliases || []).forEach(alias => {
        const key = normalize(alias);
        const score = normalized === key ? 100 : normalized.includes(key) ? 60 + key.length : key.includes(normalized) && normalized.length > 3 ? 30 : 0;
        if (score > bestScore) { best = concept; bestScore = score; }
      });
    });
    return best;
  }

  function explainConcept(concept) {
    const recommendations = findNamedCourses(concept.courses || [], 3);
    const suffix = recommendations.length ? '\n\nPara llevar este tema a la práctica, te recomiendo estos cursos del Club VIP:' : '';
    reply(`${concept.answer}${suffix}`, { items:recommendations });
    setQuick([
      { label:'Explorar otro concepto', value:'concepts' },
      { label:'Buscar otro curso', value:'courses' },
      { label:'Preparar mi ruta', value:'route', primary:true },
      { label:'Volver al menú', value:'home' }
    ]);
  }

  function explainMembership() {
    reply('El Club VIP reúne el catálogo completo de cursos clínicos, clases en vivo, materiales, juegos de práctica, herramientas y certificados verificables. Puedes crear una cuenta gratis y después activar la membresía que mejor se adapte a tu ritmo.', { items:config.courses.slice(0, 2) });
    setQuick([
      { label:'Preparar mi ruta', value:'route', primary:true },
      { label:'Explorar cursos', value:'courses' },
      { label:'Hablar con un asesor', value:'human' },
      { label:'Volver al menú', value:'home' }
    ]);
  }

  function showConcepts() {
    reply('Puedo explicar conceptos clínicos con lenguaje claro y conectarlos con una ruta de aprendizaje. Elige uno o escribe cualquier otro tema de salud.');
    setQuick([
      { label:'¿Qué es la sepsis?', value:'ask:¿Qué es la sepsis?' },
      { label:'Triage hospitalario', value:'ask:¿Qué es el triage hospitalario?' },
      { label:'Lesiones por presión', value:'ask:¿Qué son las lesiones por presión?' },
      { label:'Cetoacidosis diabética', value:'ask:¿Qué es la cetoacidosis diabética?' },
      { label:'Terapia de infusión', value:'ask:Explícame la terapia de infusión' },
      { label:'Escribir otro tema', value:'question' }
    ]);
  }

  function showCourseTopics() {
    reply('¿Qué área te interesa? Buscaré dentro de los cursos reales que están en el Club VIP.');
    setQuick([
      { label:'Urgencias', value:'search:urgencias trauma triage' },
      { label:'Heridas y apósitos', value:'search:heridas apositos' },
      { label:'Enfermería e infusión', value:'search:enfermeria infusion accesos' },
      { label:'Materno y neonatal', value:'search:materno neonatal' },
      { label:'Prevención e infecciones', value:'search:prevencion infecciones' },
      { label:'Nutrición y diabetes', value:'search:nutricion diabetes' }
    ]);
  }

  function searchCourses(value) {
    const results = rankCourses(value, 3);
    if (!results.length) {
      reply('No encontré una coincidencia exacta en el catálogo actual, pero puedo ayudarte a afinar la búsqueda por área o preparar una ruta completa.');
      showCourseTopics();
      return;
    }
    reply(`Encontré ${results.length === 1 ? 'un curso relacionado' : 'estos cursos relacionados'} dentro del Club VIP. Puedes abrir cualquiera para registrarte y ver su acceso:`, { items:results });
    setQuick([
      { label:'Buscar otro tema', value:'courses' },
      { label:'Preparar mi ruta', value:'route', primary:true },
      { label:'Conocer la membresía', value:'membership' }
    ]);
  }

  async function askMedlinePlus(value) {
    setWaiting(true);
    const controller = new AbortController();
    // Railway puede necesitar unos segundos extra al despertar; el servidor
    // conserva su propio límite de 8 s para la consulta a MedlinePlus.
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${config.apiBase}/api/assistant/health-topic`, {
        method:'POST',
        headers:{ Accept:'application/json', 'Content-Type':'application/json' },
        body:JSON.stringify({ query:value }),
        signal:controller.signal
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(body.items) || !body.items.length) throw new Error(body.error || 'Sin resultados');
      const lead = body.items[0];
      const related = rankCourses([value, lead.title], 3);
      const text = `${lead.summary || `Encontré información educativa sobre ${lead.title}.`}${related.length ? '\n\nTambién encontré formación relacionada dentro de SYNOVA:' : ''}`;
      reply(text, { items:related, source:{ name:body.source, items:body.items.slice(0, 2) } });
      setQuick([
        { label:'Profundizar otro tema', value:'question' },
        { label:'Buscar un curso', value:'courses' },
        { label:'Preparar mi ruta', value:'route', primary:true },
        { label:'Volver al menú', value:'home' }
      ]);
    } catch (_) {
      const related = rankCourses(value, 3);
      const text = related.length
        ? 'No pude consultar la fuente clínica de respaldo en este momento, pero sí encontré formación relacionada dentro de SYNOVA:'
        : 'No pude consultar la fuente clínica de respaldo en este momento. Puedo ayudarte a reformular el tema, explorar conceptos frecuentes o hablar con un asesor.';
      reply(text, { items:related });
      setQuick([{ label:'Ver conceptos', value:'concepts' }, { label:'Buscar cursos', value:'courses' }, { label:'Hablar con un asesor', value:'human' }]);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function handleInput(rawValue) {
    const value = String(rawValue || '').trim().slice(0, 240);
    if (!value || waiting) return;
    addMessage('user', value);
    input.value = '';
    const normalized = normalize(value);

    if (emergency.test(value)) {
      reply('Esto puede ser una emergencia. Llama ahora al 911 o al número local de emergencias y sigue las instrucciones del personal. No retrases la atención por continuar este chat. Si estás con la persona, permanece a su lado y actúa solo dentro de tu capacitación.');
      setQuick([{ label:'Hablar con un asesor de cursos', value:'human' }, { label:'Volver al menú', value:'home' }]);
      return;
    }

    if (personalSymptoms.test(value)) {
      reply('Puedo ofrecer información educativa, pero no diagnosticar ni indicar dosis para una persona concreta. Si hay síntomas intensos, empeoramiento, dificultad para respirar, dolor de pecho, alteración del estado de conciencia o sangrado importante, busca atención urgente. Si quieres, dime el nombre general del tema y te lo explico sin datos personales.');
      setQuick([{ label:'Aprender conceptos', value:'concepts' }, { label:'Buscar un curso', value:'courses' }, { label:'Volver al menú', value:'home' }]);
      return;
    }

    if (/ruta|recomienda.*curso|que curso|por donde empiezo/.test(normalized)) { openRoute('welcome'); return; }
    if (/membresia|club vip|precio|suscripcion|que incluye/.test(normalized)) { explainMembership(); return; }
    if (/asesor|persona|whatsapp|contacto/.test(normalized)) { offerHuman(); return; }
    if (/catalogo|buscar curso|cursos de|curso sobre/.test(normalized)) { searchCourses(value); return; }

    const concept = findConcept(value);
    if (concept) { explainConcept(concept); return; }
    await askMedlinePlus(value);
  }

  function offerHuman() {
    reply('Puedes hablar con el equipo de SYNOVA por WhatsApp para resolver dudas sobre cursos, acceso o membresía. El botón abre una conversación nueva y no comparte automáticamente lo que escribiste aquí.', { human:true });
    setQuick([{ label:'Preparar mi ruta', value:'route', primary:true }, { label:'Buscar cursos', value:'courses' }, { label:'Volver al menú', value:'home' }]);
  }

  function resetConversation() {
    messages = [{ role:'assistant', text:'¡Hola! Soy la guía virtual de SYNOVA. Puedo explicarte temas de salud, recomendar cursos reales o preparar una ruta personalizada. ¿Qué te gustaría hacer?', time:timeLabel() }];
    saveSession();
    renderMessages();
    homeActions();
    setMotion('wave');
  }

  function runQuick(value) {
    if (value === 'home') { reply('Claro. ¿Qué te gustaría hacer ahora?'); homeActions(); return; }
    if (value === 'route') { openRoute('welcome'); return; }
    if (value === 'courses') { showCourseTopics(); return; }
    if (value === 'concepts') { showConcepts(); return; }
    if (value === 'membership') { explainMembership(); return; }
    if (value === 'human') { offerHuman(); return; }
    if (value === 'question') { reply('Escribe el tema o la definición que quieres consultar. Para proteger tu privacidad, evita nombres, teléfonos y datos identificables.'); setQuick([{ label:'Sepsis', value:'ask:¿Qué es la sepsis?' }, { label:'Diabetes', value:'ask:¿Qué es la diabetes?' }, { label:'Heridas', value:'ask:¿Cómo se valora una herida?' }]); input.focus(); return; }
    if (value.startsWith('ask:')) { void handleInput(value.slice(4)); return; }
    if (value.startsWith('search:')) { searchCourses(value.slice(7)); return; }
  }

  launcher.addEventListener('click', openAssistant);
  root.querySelector('.syg-avatar').addEventListener('click', () => setMotion('wave'));
  root.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'close') closeAssistant();
    if (action === 'reset') resetConversation();
    if (action === 'pause') {
      const paused = root.dataset.paused !== 'true';
      root.dataset.paused = String(paused);
      const button = root.querySelector('[data-action="pause"]');
      button.textContent = paused ? '▶' : 'Ⅱ';
      button.setAttribute('aria-label', paused ? 'Reanudar movimiento' : 'Pausar movimiento');
    }
    const quick = event.target.closest('[data-quick]');
    if (quick) runQuick(quick.dataset.quick);
  });
  root.querySelector('.syg-composer').addEventListener('submit', event => { event.preventDefault(); void handleInput(input.value); });

  const routeRoot = document.createElement('div');
  routeRoot.className = 'syg-route';
  routeRoot.dataset.sygRoute = '';
  routeRoot.hidden = true;
  routeRoot.innerHTML = '<section class="syg-route__dialog" role="dialog" aria-modal="true" aria-labelledby="syg-route-title"><button class="syg-route__close" type="button" aria-label="Cerrar cuestionario">×</button><div class="syg-route__content"></div></section>';
  document.body.appendChild(routeRoot);
  const routeContent = routeRoot.querySelector('.syg-route__content');

  function renderRouteWelcome() {
    const survey = config.survey;
    routeContent.innerHTML = `
      <div class="syg-route__mascot"><img src="${escapeHtml(config.image)}" alt="Asistente clínica virtual de SYNOVA"></div>
      <p class="syg-route__eyebrow">${escapeHtml(survey.eyebrow)}</p>
      <h2 id="syg-route-title">${escapeHtml(survey.title)}</h2>
      <p class="syg-route__lead">${escapeHtml(survey.detail)}</p>
      <div class="syg-route__badges"><span>Sin nombre</span><span>Sin teléfono</span><span>Resultado inmediato</span><span>7 preguntas</span></div>
      <div class="syg-route__actions"><button class="syg-btn syg-btn--primary" type="button" data-route-action="start">Preparar mi ruta <span aria-hidden="true">→</span></button><button class="syg-btn" type="button" data-route-action="dismiss">Ahora no</button></div>`;
  }

  function renderRouteQuestion() {
    const question = config.survey.questions[route.step];
    const percent = Math.round(((route.step + 1) / config.survey.questions.length) * 100);
    routeContent.innerHTML = `
      <div class="syg-progress"><div class="syg-progress__meta"><span>Pregunta ${route.step + 1} de ${config.survey.questions.length}</span><span>${percent}%</span></div><div class="syg-progress__bar"><span style="width:${percent}%"></span></div></div>
      <div class="syg-route__question">
        <p class="syg-route__eyebrow">${escapeHtml(question.overline)}</p>
        <h2 id="syg-route-title">${escapeHtml(question.title)}</h2>
        <p class="syg-route__lead">${escapeHtml(question.detail)}</p>
        <div class="syg-options">${question.options.map((option, index) => `<button class="syg-option" type="button" data-option="${index}"><span class="syg-option__icon">${escapeHtml(option.icon)}</span><span><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.detail)}</small></span><span class="syg-option__radio" aria-hidden="true"></span></button>`).join('')}</div>
        <div class="syg-route__footer"><button class="syg-btn" type="button" data-route-action="back">← Volver</button><span>Elige una respuesta y avanzamos automáticamente</span></div>
      </div>`;
  }

  function routeRecommendations() {
    const chosenTags = route.answers.flat();
    const wantsShort = chosenTags.includes('short');
    const wantsLong = chosenTags.includes('long');
    return config.courses.map((course, index) => {
      const score = (course.tags || []).reduce((sum, tag) => sum + chosenTags.filter(chosen => chosen === tag).length * 4, 0)
        + (wantsShort && course.classes <= 3 ? 3 : 0)
        + (wantsLong && course.classes >= 4 ? 2 : 0);
      return { course, score, index };
    }).sort((a,b) => b.score - a.score || a.index - b.index).slice(0, 3).map(item => item.course);
  }

  function renderRouteResult() {
    route.result = routeRecommendations();
    try { localStorage.setItem(welcomeKey, 'completed'); } catch (_) {}
    routeContent.innerHTML = `
      <div class="syg-result__hero">
        <div><p class="syg-route__eyebrow">RUTA LISTA</p><h2 id="syg-route-title">Tu siguiente paso ya tiene dirección.</h2><p>Elegimos cursos reales del Club VIP según tu área, experiencia, objetivo y ritmo. Puedes empezar por el primero o comparar los tres.</p></div>
        <img src="${escapeHtml(config.image)}" alt="Asistente clínica virtual de SYNOVA celebrando tu ruta">
      </div>
      <h3 class="syg-result__title">Tu ruta recomendada</h3>
      <div class="syg-result__courses">${route.result.map((course, index) => `<article class="syg-result-card"><span class="syg-result-card__area">${index === 0 ? 'MEJOR COINCIDENCIA' : escapeHtml(course.area)}</span><strong>${escapeHtml(course.title)}</strong><p>${escapeHtml(course.detail)} · ${course.classes} clases.</p><a href="${escapeHtml(courseUrl(course))}">Ver curso y registrarme →</a></article>`).join('')}</div>
      <div class="syg-route__actions"><button class="syg-btn syg-btn--primary" type="button" data-route-action="chat-result">Hablar con la guía</button><button class="syg-btn" type="button" data-route-action="restart">Repetir diagnóstico</button><a class="syg-btn syg-btn--ink" href="${escapeHtml(config.catalogUrl)}">Entrar al Club VIP →</a></div>`;
  }

  function openRoute(mode = 'welcome') {
    route = { step:mode === 'question' ? 0 : -1, answers:[], result:[] };
    routeRoot.hidden = false;
    document.body.classList.add('syg-lock');
    if (route.step < 0) renderRouteWelcome(); else renderRouteQuestion();
    setMotion('wave');
    routeRoot.querySelector('.syg-route__close').focus();
  }

  function closeRoute(dismiss = false) {
    routeRoot.hidden = true;
    document.body.classList.remove('syg-lock');
    if (dismiss) { try { localStorage.setItem(welcomeKey, 'dismissed'); } catch (_) {} }
  }

  routeRoot.addEventListener('click', event => {
    if (event.target === routeRoot || event.target.closest('.syg-route__close')) { closeRoute(true); return; }
    const action = event.target.closest('[data-route-action]')?.dataset.routeAction;
    if (action === 'start') { route.step = 0; renderRouteQuestion(); setMotion('wave'); return; }
    if (action === 'dismiss') { closeRoute(true); return; }
    if (action === 'back') {
      if (route.step <= 0) { route.step = -1; renderRouteWelcome(); }
      else { route.step -= 1; route.answers.pop(); renderRouteQuestion(); }
      return;
    }
    if (action === 'restart') { route = { step:0, answers:[], result:[] }; renderRouteQuestion(); return; }
    if (action === 'chat-result') {
      const result = route.result.slice();
      closeRoute();
      openAssistant();
      reply('Ya tengo tu ruta. Estas son tus tres recomendaciones principales; puedes abrir cada curso y registrarte en el Club VIP:', { items:result });
      setQuick([{ label:'Buscar otro tema', value:'courses' }, { label:'Resolver una duda', value:'question' }, { label:'Hablar con un asesor', value:'human' }]);
      return;
    }
    const optionButton = event.target.closest('[data-option]');
    if (!optionButton) return;
    const question = config.survey.questions[route.step];
    const option = question.options[Number(optionButton.dataset.option)];
    if (!option) return;
    routeRoot.querySelectorAll('.syg-option').forEach(button => button.classList.remove('is-selected'));
    optionButton.classList.add('is-selected');
    route.answers[route.step] = option.tags || [];
    setMotion('answer');
    window.setTimeout(() => {
      route.step += 1;
      if (route.step >= config.survey.questions.length) renderRouteResult(); else renderRouteQuestion();
    }, 230);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!routeRoot.hidden) closeRoute(true);
    else if (!panel.hidden) closeAssistant();
  });

  function mountCookieNotice() {
    let accepted = false;
    try { accepted = Boolean(localStorage.getItem(cookieKey)) || /(?:^|;\s*)synova_privacy_consent=1(?:;|$)/.test(document.cookie); } catch (_) {}
    if (accepted) return;
    const notice = document.createElement('aside');
    notice.className = 'syg-cookie';
    notice.setAttribute('aria-label', 'Aviso de privacidad y almacenamiento local');
    notice.innerHTML = `<div><strong>Tu privacidad importa</strong><p>Usamos cookies y almacenamiento necesario para recordar tus preferencias, además de medición anónima para mejorar el sitio. Consulta nuestro <a href="${escapeHtml(config.privacyUrl)}">Aviso de Privacidad</a>.</p></div><button type="button">Acepto</button>`;
    document.body.appendChild(notice);
    document.body.classList.add('syg-cookie-open');
    notice.querySelector('button').addEventListener('click', () => {
      try { localStorage.setItem(cookieKey, JSON.stringify({ status:'accepted', at:new Date().toISOString() })); } catch (_) {}
      try { document.cookie = 'synova_privacy_consent=1; Max-Age=31536000; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); } catch (_) {}
      notice.hidden = true;
      document.body.classList.remove('syg-cookie-open');
      window.dispatchEvent(new CustomEvent('synova:privacy-consent'));
    });
  }

  loadSession();
  renderMessages();
  homeActions();
  mountCookieNotice();
  window.setTimeout(() => {
    let seen = false;
    try { seen = Boolean(localStorage.getItem(welcomeKey)); } catch (_) {}
    if (!seen && panel.hidden) openRoute('welcome');
  }, 850);

  window.SynovaGuide = Object.freeze({ open:openAssistant, openRoute, search:searchCourses, ask:handleInput });
})();
