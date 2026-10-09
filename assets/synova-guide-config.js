window.SYNOVA_GUIDE_CONFIG = Object.freeze({
  id: 'synova-guia-clinica',
  assistantName: 'SYNOVA',
  assistantLabel: 'Asistente virtual · Guía clínica',
  apiBase: 'https://synova-webhook-production.up.railway.app',
  image: 'assets/images/synova-assistant.png',
  privacyUrl: 'privacidad.html',
  whatsappUrl: 'https://wa.me/522381479274?text=Hola%2C%20vengo%20de%20la%20gu%C3%ADa%20virtual%20de%20SYNOVA%20y%20necesito%20orientaci%C3%B3n.',
  catalogUrl: 'vip-auth.html?tab=register&origen=guia-synova',
  welcome: 'Hola, soy la guía virtual de SYNOVA. Puedo explicarte conceptos de salud, ayudarte a encontrar un curso o preparar una ruta personalizada en 7 preguntas.',
  courses: [
    { id:'9b86ca59-78c4-4ecd-b50f-47b8e3b76b28', title:'Acceso y cuidado de catéteres implantables', area:'Enfermería', classes:5, detail:'Técnica, vigilancia y cuidado seguro de reservorios venosos.', tags:['enfermeria','infusion','accesos','infecciones','procedimientos'] },
    { id:'b14dbbda-b07d-4c44-a229-bed647d83a0f', title:'Accesos vasculares para diálisis tipos, cuidados y prevención de infecciones', area:'Hemodiálisis', classes:5, detail:'Accesos, cuidados y prevención de infecciones en terapia renal.', tags:['enfermeria','dialisis','accesos','infecciones','procedimientos'] },
    { id:'67a7eb13-72db-4140-9404-53d48e1afc68', title:'Actualización sobre el manejo de la diabetes mellitus tipo 2', area:'Metabolismo', classes:4, detail:'Actualización clínica y seguimiento integral de diabetes tipo 2.', tags:['diabetes','nutricion','cronicos','actualizacion','intermedio'] },
    { id:'03273029-51b4-4d21-8048-89af01cd49e6', title:'Aplicación del proceso de atención en enfermería (PAE)', area:'Enfermería', classes:5, detail:'Valoración, diagnóstico, planeación, ejecución y evaluación del cuidado.', tags:['enfermeria','pae','fundamentos','seguridad','documentacion'] },
    { id:'40a9cdd0-79f5-42a8-8ccf-9043c769c85b', title:'Dieta cetogénica para profesionales de la salud', area:'Nutrición', classes:3, detail:'Fundamentos, indicaciones y vigilancia profesional de la dieta cetogénica.', tags:['nutricion','diabetes','actualizacion','consulta'] },
    { id:'1e5e8a07-cafd-419d-b463-5946fcc63baa', title:'Estrategias avanzadas en vigilancia y control de vectores', area:'Salud pública', classes:2, detail:'Vigilancia, prevención y control integrado de vectores.', tags:['salud-publica','prevencion','vectores','actualizacion'] },
    { id:'954637be-6048-4879-97da-25dc8f05748e', title:'Fundamentos del manejo avanzado de heridas y selección de apósitos', area:'Heridas', classes:5, detail:'Valoración del lecho y selección razonada de coberturas.', tags:['enfermeria','heridas','apositos','procedimientos','fundamentos'] },
    { id:'8d243ae2-b293-4f3e-9147-61119a15b494', title:'La importancia de las vacunas en la prevención de enfermedades', area:'Prevención', classes:3, detail:'Bases de inmunización, seguridad y prevención de enfermedades.', tags:['prevencion','vacunas','salud-publica','fundamentos'] },
    { id:'bc3002cf-ef6b-4bc3-a939-2a8d74b47443', title:'La importancia del peritaje toxicológico en investigaciones criminales', area:'Toxicología forense', classes:5, detail:'Muestras, cadena de custodia e interpretación del peritaje.', tags:['toxicologia','forense','laboratorio','especialidad','documentacion'] },
    { id:'bfa9946e-0fdc-41ac-85ef-4e2673c7ce90', title:'Manejo de accesos vasculares', area:'Enfermería', classes:4, detail:'Selección, instalación, mantenimiento y detección de complicaciones.', tags:['enfermeria','infusion','accesos','procedimientos','seguridad'] },
    { id:'11d81c88-eec7-4039-9407-7247ec4716ea', title:'Manejo de la hipoxemia y mejora de la ventilación pulmonar en el contexto de la fisioterapia pulmonar', area:'Respiratorio', classes:5, detail:'Oxigenación, ventilación y razonamiento en fisioterapia pulmonar.', tags:['respiratorio','asma','pulmonar','urgencias','fisioterapia','actualizacion','especialidad'] },
    { id:'0e2e8ab7-ac74-4440-af26-9fc79d1d599a', title:'Manejo de la terapia de presión negativa (TPN)', area:'Heridas', classes:5, detail:'Selección, montaje y vigilancia de terapia de presión negativa.', tags:['enfermeria','heridas','tpn','procedimientos','avanzado'] },
    { id:'f21c8cf0-6f60-42ad-baa1-a21e40fa1f45', title:'Manejo de sepsis neonatal', area:'Neonatología', classes:5, detail:'Reconocimiento temprano y abordaje integral de sepsis neonatal.', tags:['neonatal','pediatria','sepsis','urgencias','especialidad'] },
    { id:'e91c16b0-20ca-45bc-b251-9e7891ac9afe', title:'Manejo del paciente politraumatizado en la sala de urgencia', area:'Urgencias', classes:2, detail:'Valoración primaria, prioridades y estabilización del trauma.', tags:['urgencias','trauma','triage','abcde','procedimientos'] },
    { id:'1f65357c-941a-4ee1-bcf9-6de1822e2a5d', title:'Manejo del paciente quemado', area:'Urgencias', classes:3, detail:'Valoración inicial, extensión, estabilización y cuidado de quemaduras.', tags:['urgencias','quemaduras','heridas','procedimientos'] },
    { id:'63573514-d69d-4627-816f-dfa4aee1ddf5', title:'Manejo integral de ostomías', area:'Enfermería', classes:4, detail:'Cuidado del estoma, piel periestomal y educación del paciente.', tags:['enfermeria','ostomias','procedimientos','educacion'] },
    { id:'45d2d4ba-6ea7-4709-9d8c-78dffa05c1a6', title:'Manejo integral del paciente con cetoacidosis diabética', area:'Urgencias metabólicas', classes:4, detail:'Reconocimiento, vigilancia y tratamiento protocolizado de cetoacidosis.', tags:['diabetes','urgencias','metabolismo','avanzado'] },
    { id:'375e490d-e9fa-4b99-aa84-62a5a4ff0bce', title:'Manejo integral del síndrome de HELLP', area:'Obstetricia', classes:5, detail:'Identificación y respuesta multidisciplinaria ante síndrome de HELLP.', tags:['materno','urgencias','hellp','especialidad'] },
    { id:'9c69ea75-8f61-4e3a-8d4f-e74d0809fea8', title:'Manejo y abordaje de las lesiones por presión (LPP)', area:'Heridas', classes:3, detail:'Prevención, clasificación y plan integral de cuidado.', tags:['enfermeria','heridas','lpp','prevencion','geriatria'] },
    { id:'c6e6d42a-a624-45d7-8ce2-ee089c3e3693', title:'Preparación del lecho de la herida (PLH)', area:'Heridas', classes:4, detail:'Marco TIME, tejido, infección, humedad y bordes.', tags:['enfermeria','heridas','procedimientos','intermedio'] },
    { id:'15ab9c56-bfe1-4b11-864e-bc5716b616ab', title:'Prevención y control de infecciones asociadas a la atención en salud estrategias para la seguridad del paciente', area:'Control de infecciones', classes:4, detail:'Barreras, higiene de manos y prácticas seguras en atención.', tags:['infecciones','seguridad','prevencion','calidad','enfermeria'] },
    { id:'9bf93256-6938-4a77-acda-5c71d4c3ed08', title:'Rejuvenecimiento facial eficaz domina el electrolifting con Plasma Pen', area:'Estética', classes:5, detail:'Fundamentos, bioseguridad y aplicación responsable de Plasma Pen.', tags:['estetica','plasma','procedimientos','especialidad'] },
    { id:'979b31a8-c853-427f-943c-8ac8f860aec8', title:'Síndrome de fragilidad en la vejez', area:'Geriatría', classes:5, detail:'Detección y abordaje multidimensional de fragilidad.', tags:['geriatria','fragilidad','nutricion','prevencion'] },
    { id:'ab74f978-c7d1-4e9e-9570-3ccaa2a05368', title:'Terapia de infusión en enfermería', area:'Enfermería', classes:5, detail:'Principios, cálculos, compatibilidad y vigilancia de la infusión.', tags:['enfermeria','infusion','accesos','procedimientos','seguridad'] }
  ],
  survey: {
    eyebrow: 'TU RUTA SYNOVA',
    title: 'Encuentra una ruta de aprendizaje hecha para ti.',
    detail: 'Son 7 preguntas sencillas, sin nombre ni teléfono. Recibirás una recomendación inmediata con cursos reales del Club VIP.',
    questions: [
      {
        overline:'SOBRE TI', title:'¿Cuál de estas opciones te describe mejor actualmente?', detail:'No hay respuestas correctas: queremos entender desde dónde comienzas.',
        options:[
          { icon:'🎓', label:'Estoy estudiando', detail:'Me estoy formando en un área de salud.', tags:['fundamentos','enfermeria'] },
          { icon:'⚕️', label:'Recién egresé', detail:'Quiero convertir teoría en práctica segura.', tags:['fundamentos','procedimientos','seguridad'] },
          { icon:'🩺', label:'Trabajo en atención clínica', detail:'Atiendo pacientes o colaboro en servicios de salud.', tags:['enfermeria','actualizacion','procedimientos'] },
          { icon:'🔬', label:'Soy especialista', detail:'Busco profundizar y actualizar criterios.', tags:['especialidad','avanzado','actualizacion'] },
          { icon:'🏥', label:'Coordino un equipo o servicio', detail:'Me interesan calidad, prevención y protocolos.', tags:['calidad','seguridad','prevencion'] },
          { icon:'✨', label:'Quiero aprender algo nuevo', detail:'Exploro por crecimiento personal o profesional.', tags:['fundamentos','prevencion'] }
        ]
      },
      {
        overline:'TU ÁREA', title:'¿Qué área quieres fortalecer primero?', detail:'Después podrás explorar todas las demás dentro del Club.',
        options:[
          { icon:'⚡', label:'Urgencias y paciente crítico', detail:'Trauma, triage y respuesta inicial.', tags:['urgencias','trauma','abcde'] },
          { icon:'🩹', label:'Heridas y cuidado avanzado', detail:'Valoración, apósitos y cicatrización.', tags:['heridas','apositos','tpn'] },
          { icon:'💉', label:'Enfermería y accesos', detail:'Infusión, catéteres y proceso enfermero.', tags:['enfermeria','infusion','accesos'] },
          { icon:'👶', label:'Materno, neonatal y pediatría', detail:'Atención segura en etapas vulnerables.', tags:['materno','neonatal','pediatria'] },
          { icon:'🫁', label:'Respiratorio y rehabilitación', detail:'Oxigenación y ventilación pulmonar.', tags:['respiratorio','fisioterapia'] },
          { icon:'🧬', label:'Prevención y salud pública', detail:'Vacunas, infecciones y vectores.', tags:['prevencion','infecciones','salud-publica'] }
        ]
      },
      {
        overline:'TU RETO', title:'¿Qué situación quieres resolver mejor?', detail:'Esto nos ayuda a elegir el enfoque, no solo el tema.',
        options:[
          { icon:'⏱️', label:'Decidir con rapidez', detail:'Priorizar riesgos bajo presión.', tags:['urgencias','triage','abcde'] },
          { icon:'🧠', label:'Entender el porqué', detail:'Construir fundamentos clínicos claros.', tags:['fundamentos','pae'] },
          { icon:'🧤', label:'Dominar una técnica', detail:'Aplicar procedimientos con seguridad.', tags:['procedimientos','enfermeria'] },
          { icon:'🛡️', label:'Prevenir complicaciones', detail:'Identificar riesgos antes del daño.', tags:['prevencion','seguridad','infecciones'] },
          { icon:'📋', label:'Ordenar y documentar', detail:'Estructurar cuidados y evidencias.', tags:['pae','documentacion','calidad'] },
          { icon:'📚', label:'Actualizarme', detail:'Contrastar mi práctica con criterios actuales.', tags:['actualizacion','especialidad'] }
        ]
      },
      {
        overline:'TU EXPERIENCIA', title:'¿Qué nivel de profundidad necesitas?', detail:'Ajustaremos la ruta a tu punto de partida.',
        options:[
          { icon:'1', label:'Comenzar desde cero', detail:'Necesito bases y lenguaje claro.', tags:['fundamentos'] },
          { icon:'2', label:'Nivel intermedio', detail:'Ya conozco lo esencial y quiero aplicarlo.', tags:['intermedio','procedimientos'] },
          { icon:'3', label:'Profundización clínica', detail:'Busco razonamiento y escenarios complejos.', tags:['avanzado','especialidad'] },
          { icon:'↻', label:'Actualización puntual', detail:'Quiero revisar cambios y reforzar criterios.', tags:['actualizacion'] }
        ]
      },
      {
        overline:'TU OBJETIVO', title:'¿Qué resultado sería más valioso para ti?', detail:'Tu recomendación priorizará ese resultado.',
        options:[
          { icon:'✓', label:'Atender con más seguridad', detail:'Reducir errores y anticipar riesgos.', tags:['seguridad','prevencion'] },
          { icon:'🏅', label:'Certificar mi aprendizaje', detail:'Respaldar formalmente mi formación.', tags:['especialidad','actualizacion'] },
          { icon:'🧰', label:'Aplicar una técnica', detail:'Llevar el conocimiento a mi práctica.', tags:['procedimientos'] },
          { icon:'📈', label:'Crecer profesionalmente', detail:'Ampliar competencias y oportunidades.', tags:['actualizacion','especialidad'] }
        ]
      },
      {
        overline:'TU RITMO', title:'¿Cómo prefieres avanzar?', detail:'Todos los cursos recomendados están disponibles en línea.',
        options:[
          { icon:'⚡', label:'Ruta breve y enfocada', detail:'Quiero una victoria rápida para comenzar.', tags:['short'] },
          { icon:'🗺️', label:'Ruta completa', detail:'Prefiero desarrollar el tema paso a paso.', tags:['long'] },
          { icon:'🔁', label:'Práctica continua', detail:'Me sirven retos, repasos y ejercicios.', tags:['procedimientos','intermedio'] },
          { icon:'🎯', label:'Según mi necesidad', detail:'Combinaré profundidad y rapidez.', tags:['actualizacion'] }
        ]
      },
      {
        overline:'PRIMER PASO', title:'¿Con qué tema te gustaría empezar hoy?', detail:'Elige el que más se acerque; puedes cambiar de ruta después.',
        options:[
          { icon:'🚑', label:'Trauma y urgencias', detail:'Evaluación y prioridades inmediatas.', tags:['urgencias','trauma'] },
          { icon:'🩹', label:'Heridas y piel', detail:'Lecho, apósitos y lesiones por presión.', tags:['heridas','apositos'] },
          { icon:'💧', label:'Infusión y accesos', detail:'Catéteres, diálisis y terapia intravenosa.', tags:['infusion','accesos','dialisis'] },
          { icon:'🦠', label:'Infecciones y prevención', detail:'Sepsis, vacunas y barreras de seguridad.', tags:['infecciones','prevencion','sepsis'] },
          { icon:'🧪', label:'Metabolismo y nutrición', detail:'Diabetes, cetoacidosis y nutrición.', tags:['diabetes','nutricion','metabolismo'] },
          { icon:'👩‍🍼', label:'Materno y neonatal', detail:'HELLP y sepsis neonatal.', tags:['materno','neonatal'] }
        ]
      }
    ]
  }
});
