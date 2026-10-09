/* Base editorial educativa de la guía SYNOVA.
   No sustituye valoración, diagnóstico, prescripción ni protocolos locales. */
window.SYNOVA_GUIDE_KNOWLEDGE = Object.freeze({
  triage: {
    label: 'Triage hospitalario', aliases: ['triage','triaje','clasificacion de urgencias','prioridad de atencion'],
    answer: 'El triage es un proceso de valoración rápida que ordena la atención según gravedad, riesgo vital y recursos necesarios; no funciona por orden de llegada. Debe reevaluarse porque el estado de una persona puede cambiar mientras espera.',
    courses: ['Manejo del paciente politraumatizado en la sala de urgencia']
  },
  abcde: {
    label: 'Evaluación ABCDE', aliases: ['abcde','valoracion primaria','evaluacion primaria'],
    answer: 'ABCDE organiza la valoración inicial: vía aérea, respiración, circulación, estado neurológico y exposición. Su propósito es detectar y tratar primero lo que amenaza la vida, con reevaluación continua y activación temprana del equipo correspondiente.',
    courses: ['Manejo del paciente politraumatizado en la sala de urgencia','Manejo del paciente quemado']
  },
  sepsis: {
    label: 'Sepsis', aliases: ['sepsis','choque septico','shock septico','infeccion generalizada'],
    answer: 'La sepsis es una disfunción orgánica potencialmente mortal causada por una respuesta desregulada a una infección. El reconocimiento temprano del deterioro, la toma oportuna de estudios y el inicio del protocolo institucional son esenciales.',
    courses: ['Manejo de sepsis neonatal','Prevención y control de infecciones asociadas a la atención en salud estrategias para la seguridad del paciente']
  },
  shock: {
    label: 'Choque circulatorio', aliases: ['choque','shock','hipoperfusion','choque hipovolemico'],
    answer: 'El choque es un estado de perfusión tisular insuficiente. Puede ser hipovolémico, distributivo, cardiogénico u obstructivo; la prioridad es reconocer signos de mala perfusión, identificar la causa y seguir el protocolo de estabilización.',
    courses: ['Manejo del paciente politraumatizado en la sala de urgencia','Manejo integral del síndrome de HELLP']
  },
  trauma: {
    label: 'Paciente politraumatizado', aliases: ['politrauma','politraumatizado','trauma multiple','paciente traumatizado'],
    answer: 'Un paciente politraumatizado presenta lesiones en dos o más regiones o sistemas, con posibilidad de compromiso vital. La atención exige seguridad de la escena, evaluación primaria estructurada, control de hemorragia, inmovilización selectiva y traslado coordinado.',
    courses: ['Manejo del paciente politraumatizado en la sala de urgencia']
  },
  hemorragia: {
    label: 'Control de hemorragias', aliases: ['hemorragia','sangrado','control de sangrado'],
    answer: 'La hemorragia significativa puede causar choque rápidamente. La respuesta inicial prioriza identificar el origen, presión directa cuando procede, medidas de control según el sitio y activación del protocolo de emergencia; nunca debe retrasarse la atención definitiva.',
    courses: ['Manejo del paciente politraumatizado en la sala de urgencia','Manejo integral del síndrome de HELLP']
  },
  viaAerea: {
    label: 'Vía aérea', aliases: ['via aerea','obstruccion de via aerea','manejo de via aerea'],
    answer: 'La valoración de la vía aérea busca confirmar que el aire puede pasar y detectar obstrucción, secreciones, trauma o pérdida de reflejos protectores. Toda intervención debe corresponder al nivel de entrenamiento y al protocolo del servicio.',
    courses: ['Manejo del paciente politraumatizado en la sala de urgencia','Manejo de la hipoxemia y mejora de la ventilación pulmonar en el contexto de la fisioterapia pulmonar']
  },
  hipoxemia: {
    label: 'Hipoxemia', aliases: ['hipoxemia','oxigeno bajo','saturacion baja','desaturacion'],
    answer: 'La hipoxemia es una disminución del oxígeno en sangre arterial. La oximetría ayuda a detectarla, pero debe interpretarse junto con el estado clínico, la perfusión, la ventilación y posibles fuentes de error de medición.',
    courses: ['Manejo de la hipoxemia y mejora de la ventilación pulmonar en el contexto de la fisioterapia pulmonar']
  },
  ventilacion: {
    label: 'Ventilación pulmonar', aliases: ['ventilacion pulmonar','fisioterapia pulmonar','ventilacion mecanica','oxigenoterapia'],
    answer: 'Ventilar significa movilizar aire hacia dentro y fuera de los pulmones; oxigenar es transferir oxígeno a la sangre. Son procesos relacionados pero distintos, por lo que la valoración debe integrar esfuerzo respiratorio, intercambio gaseoso y respuesta al soporte.',
    courses: ['Manejo de la hipoxemia y mejora de la ventilación pulmonar en el contexto de la fisioterapia pulmonar']
  },
  quemaduras: {
    label: 'Quemaduras', aliases: ['quemadura','quemaduras','paciente quemado'],
    answer: 'Las quemaduras se valoran por profundidad, extensión, localización, mecanismo y condiciones del paciente. Las prioridades incluyen detener la fuente, valorar ABCDE, prevenir hipotermia, cubrir de forma limpia y referir cuando existan criterios de gravedad.',
    courses: ['Manejo del paciente quemado']
  },
  heridas: {
    label: 'Manejo de heridas', aliases: ['herida','heridas','curacion de heridas','cicatrizacion'],
    answer: 'El manejo de una herida comienza con una valoración integral: causa, perfusión, carga microbiana, tejido, exudado, bordes, dolor y condiciones de la persona. El apósito se elige por objetivos clínicos, no solo por apariencia.',
    courses: ['Fundamentos del manejo avanzado de heridas y selección de apósitos','Preparación del lecho de la herida (PLH)']
  },
  cicatrizacion: {
    label: 'Cicatrización', aliases: ['fases de cicatrizacion','cicatrizacion','granulacion','epitelizacion'],
    answer: 'La cicatrización progresa por hemostasia, inflamación, proliferación y remodelación. Las fases se superponen y pueden alterarse por infección, isquemia, presión, nutrición, glucosa elevada, medicamentos o enfermedades crónicas.',
    courses: ['Fundamentos del manejo avanzado de heridas y selección de apósitos','Preparación del lecho de la herida (PLH)']
  },
  apositos: {
    label: 'Apósitos', aliases: ['aposito','apositos','hidrocoloide','alginato','espuma para heridas'],
    answer: 'Un apósito ayuda a controlar exudado, proteger el lecho y mantener un ambiente favorable. Su selección depende de profundidad, tejido, cantidad de exudado, infección, piel perilesional y frecuencia de cambio indicada.',
    courses: ['Fundamentos del manejo avanzado de heridas y selección de apósitos']
  },
  lechoHerida: {
    label: 'Preparación del lecho', aliases: ['preparacion del lecho','time heridas','lecho de la herida','desbridamiento'],
    answer: 'La preparación del lecho organiza la valoración y corrección de barreras para cicatrizar. El marco TIME revisa tejido, infección o inflamación, equilibrio de humedad y bordes; debe aplicarse dentro de una valoración integral.',
    courses: ['Preparación del lecho de la herida (PLH)','Fundamentos del manejo avanzado de heridas y selección de apósitos']
  },
  lpp: {
    label: 'Lesiones por presión', aliases: ['lesion por presion','ulcera por presion','escaras','lpp'],
    answer: 'Las lesiones por presión son daños localizados en piel y tejidos, generalmente sobre una prominencia ósea o bajo un dispositivo. La prevención combina valoración de riesgo, alivio de presión, cuidado de piel, movilidad, nutrición y vigilancia frecuente.',
    courses: ['Manejo y abordaje de las lesiones por presión (LPP)']
  },
  tpn: {
    label: 'Terapia de presión negativa', aliases: ['presion negativa','tpn','vac heridas','terapia vac'],
    answer: 'La terapia de presión negativa aplica presión subatmosférica controlada sobre una herida mediante un sistema sellado. Puede favorecer el manejo del exudado y del lecho en casos seleccionados, con indicación, técnica y vigilancia profesional.',
    courses: ['Manejo de la terapia de presión negativa (TPN)']
  },
  ostomias: {
    label: 'Ostomías', aliases: ['ostomia','colostomia','ileostomia','estoma'],
    answer: 'Una ostomía crea una abertura para eliminar contenido intestinal o urinario. El cuidado incluye valorar color y perfusión del estoma, medirlo, proteger piel periestomal, ajustar el dispositivo y educar para reconocer complicaciones.',
    courses: ['Manejo integral de ostomías']
  },
  cateter: {
    label: 'Catéter implantable', aliases: ['cateter implantable','port a cath','reservorio venoso','puerto implantable'],
    answer: 'Un catéter implantable ofrece acceso venoso de larga duración mediante un reservorio subcutáneo. Su uso seguro exige técnica aséptica, aguja adecuada, confirmación de permeabilidad, vigilancia del sitio y protocolo institucional.',
    courses: ['Acceso y cuidado de catéteres implantables','Manejo de accesos vasculares']
  },
  accesos: {
    label: 'Accesos vasculares', aliases: ['acceso vascular','accesos vasculares','cateter periferico','cateter central'],
    answer: 'Los accesos vasculares permiten administrar soluciones o terapias y obtener muestras. La selección depende de duración, osmolaridad, tipo de tratamiento, condición vascular y riesgos; la vigilancia reduce infiltración, flebitis e infección.',
    courses: ['Manejo de accesos vasculares','Terapia de infusión en enfermería']
  },
  infusion: {
    label: 'Terapia de infusión', aliases: ['terapia de infusion','infusion intravenosa','venoclisis'],
    answer: 'La terapia de infusión administra líquidos, medicamentos, sangre o nutrición por una vía vascular. Requiere verificar indicación, compatibilidad, velocidad, acceso, respuesta clínica y signos de complicación.',
    courses: ['Terapia de infusión en enfermería','Manejo de accesos vasculares']
  },
  flebitis: {
    label: 'Flebitis', aliases: ['flebitis','vena inflamada','infiltracion intravenosa','extravasacion'],
    answer: 'La flebitis es inflamación de una vena y puede manifestarse con dolor, eritema, calor o trayecto palpable. Infiltración y extravasación son complicaciones distintas; la conducta depende del fármaco, el daño y el protocolo institucional.',
    courses: ['Terapia de infusión en enfermería','Manejo de accesos vasculares']
  },
  hemodialisis: {
    label: 'Hemodiálisis', aliases: ['hemodialisis','dialisis','fistula arteriovenosa','cateter de hemodialisis'],
    answer: 'La hemodiálisis depura la sangre mediante un filtro extracorpóreo cuando la función renal es insuficiente. El acceso vascular, la prevención de infecciones, el balance de líquidos y la vigilancia hemodinámica son elementos centrales.',
    courses: ['Accesos vasculares para diálisis tipos, cuidados y prevención de infecciones']
  },
  infecciones: {
    label: 'Prevención de infecciones', aliases: ['infeccion nosocomial','iaas','infecciones asociadas','control de infecciones'],
    answer: 'Las infecciones asociadas a la atención en salud se reducen con higiene de manos, técnica aséptica, precauciones según transmisión, limpieza, uso prudente de dispositivos y vigilancia de prácticas seguras.',
    courses: ['Prevención y control de infecciones asociadas a la atención en salud estrategias para la seguridad del paciente']
  },
  manos: {
    label: 'Higiene de manos', aliases: ['higiene de manos','lavado de manos','cinco momentos'],
    answer: 'La higiene de manos interrumpe la transmisión de microorganismos. Debe realizarse en los momentos indicados, con técnica completa y el producto adecuado; los guantes no reemplazan la higiene.',
    courses: ['Prevención y control de infecciones asociadas a la atención en salud estrategias para la seguridad del paciente']
  },
  asepsia: {
    label: 'Asepsia y antisepsia', aliases: ['asepsia','antisepsia','tecnica aseptica','campo esteril'],
    answer: 'Asepsia reúne medidas para evitar contaminación; antisepsia usa agentes sobre tejido vivo para reducir microorganismos. La técnica depende del procedimiento y debe preservar las barreras críticas de seguridad.',
    courses: ['Prevención y control de infecciones asociadas a la atención en salud estrategias para la seguridad del paciente','Terapia de infusión en enfermería']
  },
  esterilizacion: {
    label: 'Esterilización', aliases: ['esterilizacion','desinfeccion','autoclave','material esteril'],
    answer: 'Esterilizar destruye todas las formas de vida microbiana, incluidas esporas; desinfectar reduce microorganismos en objetos, con niveles distintos. El método se elige según el riesgo y la compatibilidad del dispositivo.',
    courses: ['Prevención y control de infecciones asociadas a la atención en salud estrategias para la seguridad del paciente']
  },
  vacunas: {
    label: 'Vacunación', aliases: ['vacuna','vacunas','inmunizacion','esquema de vacunacion'],
    answer: 'Las vacunas entrenan al sistema inmunitario para reconocer agentes infecciosos y reducir enfermedad grave, complicaciones y transmisión. Indicaciones, intervalos y contraindicaciones deben consultarse en el esquema vigente y la historia clínica.',
    courses: ['La importancia de las vacunas en la prevención de enfermedades']
  },
  diabetes: {
    label: 'Diabetes mellitus', aliases: ['diabetes','diabetes tipo 2','glucosa alta','hiperglucemia'],
    answer: 'La diabetes mellitus agrupa trastornos con glucosa sanguínea elevada por alteraciones en la producción o acción de la insulina. El cuidado combina educación, alimentación, actividad, medicamentos cuando se indican y vigilancia de complicaciones.',
    courses: ['Actualización sobre el manejo de la diabetes mellitus tipo 2','Manejo integral del paciente con cetoacidosis diabética']
  },
  cetoacidosis: {
    label: 'Cetoacidosis diabética', aliases: ['cetoacidosis','cad','cetonas altas','cetoacidosis diabetica'],
    answer: 'La cetoacidosis diabética es una emergencia caracterizada por hiperglucemia, cetosis y acidosis metabólica. Requiere valoración inmediata, líquidos, insulina y corrección vigilada de electrolitos conforme al protocolo clínico.',
    courses: ['Manejo integral del paciente con cetoacidosis diabética']
  },
  insulina: {
    label: 'Insulina', aliases: ['insulina','tipos de insulina','aplicacion de insulina'],
    answer: 'La insulina facilita que la glucosa entre a las células. Existen perfiles de acción distintos; dosis, horario, almacenamiento, técnica y prevención de hipoglucemia deben individualizarse por el equipo tratante.',
    courses: ['Actualización sobre el manejo de la diabetes mellitus tipo 2','Manejo integral del paciente con cetoacidosis diabética']
  },
  pae: {
    label: 'Proceso de Atención de Enfermería', aliases: ['pae','proceso enfermero','proceso de atencion de enfermeria','plan de cuidados'],
    answer: 'El PAE es un método sistemático que integra valoración, diagnóstico de enfermería, planeación, ejecución y evaluación. Permite documentar decisiones, priorizar necesidades y ajustar cuidados según resultados.',
    courses: ['Aplicación del proceso de atención en enfermería (PAE)']
  },
  seguridad: {
    label: 'Seguridad del paciente', aliases: ['seguridad del paciente','evento adverso','cultura de seguridad','identificacion del paciente'],
    answer: 'La seguridad del paciente busca reducir daño evitable mediante identificación correcta, comunicación efectiva, medicamentos seguros, prevención de infecciones, cirugía segura, aprendizaje de incidentes y trabajo en equipo.',
    courses: ['Prevención y control de infecciones asociadas a la atención en salud estrategias para la seguridad del paciente','Aplicación del proceso de atención en enfermería (PAE)']
  },
  medicamentos: {
    label: 'Seguridad de medicamentos', aliases: ['medicamentos seguros','correctos de medicamentos','error de medicacion','administracion de medicamentos'],
    answer: 'La administración segura verifica paciente, medicamento, dosis, vía, hora, registro, indicación, respuesta y derecho a información, entre otros controles. Las alergias, interacciones y medicamentos de alto riesgo requieren barreras adicionales.',
    courses: ['Aplicación del proceso de atención en enfermería (PAE)','Terapia de infusión en enfermería']
  },
  hellp: {
    label: 'Síndrome de HELLP', aliases: ['hellp','sindrome hellp','preeclampsia severa'],
    answer: 'HELLP combina hemólisis, elevación de enzimas hepáticas y plaquetas bajas, generalmente en el contexto de trastornos hipertensivos del embarazo. Es una urgencia obstétrica que requiere reconocimiento y manejo hospitalario inmediato.',
    courses: ['Manejo integral del síndrome de HELLP']
  },
  preeclampsia: {
    label: 'Preeclampsia', aliases: ['preeclampsia','eclampsia','hipertension en el embarazo'],
    answer: 'La preeclampsia es hipertensión de nueva aparición durante el embarazo acompañada de datos de afectación orgánica. Cefalea intensa, alteraciones visuales, dolor epigástrico, disnea o convulsiones requieren atención urgente.',
    courses: ['Manejo integral del síndrome de HELLP']
  },
  neonatal: {
    label: 'Sepsis neonatal', aliases: ['sepsis neonatal','infeccion neonatal','recien nacido con sepsis'],
    answer: 'La sepsis neonatal es una infección sistémica en el recién nacido y puede presentarse con signos poco específicos como mala alimentación, alteración térmica, dificultad respiratoria, letargo o inestabilidad. La sospecha exige valoración urgente.',
    courses: ['Manejo de sepsis neonatal']
  },
  fragilidad: {
    label: 'Fragilidad en la vejez', aliases: ['fragilidad','adulto mayor fragil','geriatria','sindrome de fragilidad'],
    answer: 'La fragilidad es una disminución de la reserva fisiológica que aumenta vulnerabilidad ante eventos estresantes. La valoración considera función, fuerza, movilidad, nutrición, cognición, entorno y objetivos de la persona.',
    courses: ['Síndrome de fragilidad en la vejez']
  },
  cetogenica: {
    label: 'Dieta cetogénica', aliases: ['dieta cetogenica','keto','cetosis nutricional'],
    answer: 'La dieta cetogénica restringe carbohidratos y aumenta grasa para promover cetosis nutricional. No es equivalente a cetoacidosis y requiere evaluación profesional, especialmente con diabetes, embarazo, enfermedad renal, hepática o medicación.',
    courses: ['Dieta cetogénica para profesionales de la salud']
  },
  nutricion: {
    label: 'Nutrición clínica', aliases: ['nutricion clinica','valoracion nutricional','desnutricion','soporte nutricional'],
    answer: 'La nutrición clínica evalúa ingesta, composición corporal, síntomas, enfermedad y requerimientos para prevenir o tratar malnutrición. Un plan seguro se individualiza y se monitoriza con objetivos medibles.',
    courses: ['Dieta cetogénica para profesionales de la salud','Síndrome de fragilidad en la vejez']
  },
  toxicologia: {
    label: 'Toxicología clínica y forense', aliases: ['toxicologia','intoxicacion','veneno','toxico','peritaje toxicologico'],
    answer: 'La toxicología estudia efectos de sustancias sobre el organismo; en el ámbito forense agrega cadena de custodia, interpretación analítica y contexto legal. Ante una exposición real se debe contactar al servicio de emergencias o centro toxicológico local.',
    courses: ['La importancia del peritaje toxicológico en investigaciones criminales']
  },
  custodia: {
    label: 'Cadena de custodia', aliases: ['cadena de custodia','muestra forense','evidencia toxicologica'],
    answer: 'La cadena de custodia documenta quién recolectó, transportó, recibió, analizó y resguardó una evidencia. Su trazabilidad, sellado, identificación y condiciones de conservación sostienen la integridad del resultado.',
    courses: ['La importancia del peritaje toxicológico en investigaciones criminales']
  },
  vectores: {
    label: 'Vigilancia y control de vectores', aliases: ['vectores','control de vectores','mosquitos','dengue','zika','chikungunya'],
    answer: 'El control de vectores combina vigilancia epidemiológica y entomológica, eliminación de criaderos, barreras físicas, educación comunitaria y uso racional de intervenciones químicas o biológicas.',
    courses: ['Estrategias avanzadas en vigilancia y control de vectores']
  },
  plasma: {
    label: 'Plasma Pen y electrolifting', aliases: ['plasma pen','electrolifting','rejuvenecimiento facial'],
    answer: 'El Plasma Pen genera una descarga de plasma para producir puntos controlados sobre la piel con fines estéticos. Requiere capacitación, selección cuidadosa, consentimiento, bioseguridad y reconocimiento de contraindicaciones y complicaciones.',
    courses: ['Rejuvenecimiento facial eficaz domina el electrolifting con Plasma Pen']
  },
  signos: {
    label: 'Signos vitales', aliases: ['signos vitales','presion arterial','frecuencia cardiaca','frecuencia respiratoria','temperatura corporal'],
    answer: 'Los signos vitales reflejan funciones básicas y deben interpretarse como tendencias, no como números aislados. Técnica, equipo, edad, contexto y síntomas influyen en su significado clínico.',
    courses: ['Aplicación del proceso de atención en enfermería (PAE)','Manejo del paciente politraumatizado en la sala de urgencia']
  },
  glasgow: {
    label: 'Escala de Glasgow', aliases: ['glasgow','escala de coma de glasgow','nivel de conciencia'],
    answer: 'La escala de Glasgow valora apertura ocular, respuesta verbal y respuesta motora. Ayuda a comunicar el nivel de conciencia, pero no sustituye la evaluación neurológica ni la búsqueda de causas reversibles.',
    courses: ['Manejo del paciente politraumatizado en la sala de urgencia']
  },
  rcp: {
    label: 'Reanimación cardiopulmonar', aliases: ['rcp','reanimacion cardiopulmonar','paro cardiaco','cpr'],
    answer: 'La RCP busca mantener circulación y oxigenación durante un paro cardiaco. Si una persona no responde y no respira normalmente, activa el sistema de emergencias, solicita un DEA e inicia compresiones según tu capacitación.',
    courses: ['Manejo del paciente politraumatizado en la sala de urgencia']
  },
  consentimiento: {
    label: 'Consentimiento informado', aliases: ['consentimiento informado','autonomia del paciente','rechazo de tratamiento'],
    answer: 'El consentimiento informado es un proceso de comunicación: explica propósito, beneficios, riesgos, alternativas y consecuencias de no realizar una intervención. Requiere capacidad, comprensión y decisión libre, con documentación apropiada.',
    courses: ['Aplicación del proceso de atención en enfermería (PAE)']
  },
  bioseguridad: {
    label: 'Bioseguridad', aliases: ['bioseguridad','equipo de proteccion personal','epp','precauciones estandar'],
    answer: 'La bioseguridad reúne prácticas para reducir exposición a riesgos biológicos. Incluye evaluación del riesgo, higiene de manos, EPP apropiado, manejo de punzocortantes, limpieza y eliminación segura de residuos.',
    courses: ['Prevención y control de infecciones asociadas a la atención en salud estrategias para la seguridad del paciente']
  }
});
