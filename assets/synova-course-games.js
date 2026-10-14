/* SYNOVA · Mini juegos por curso
   Cada curso tiene su propio paquete: un juego distinto por clase y todo el
   contenido (palabras, pistas, pares, casos) sale del tema del curso.
   El panel reconoce el curso por su nombre (match) y elige el juego según el
   número de clase. Tipos: crossword, memory, wordsearch, puzzle, guess,
   classify, hazard (board = escena de riesgo), spot (board = planta). */
(function(){
'use strict';
var IMG='assets/images/cursos/curso-';
window.SYNOVA_COURSE_GAMES=[
  {id:'01',collection:'9b86ca59-78c4-4ecd-b50f-47b8e3b76b28',name:'Catéteres implantables',match:'implantable',games:[
    {type:'crossword',topic:'Puerto implantable',config:{entries:[['RESERVORIO','Cámara del puerto donde se inserta la aguja'],['HUBER','Aguja de punta no cortante que protege el septum'],['SEPTUM','Membrana de silicona autosellante que se punciona'],['HEPARINA','Puede usarse en el sellado según el protocolo institucional'],['RETORNO','Se aspira para confirmar la permeabilidad del catéter']]}},
    {type:'classify',topic:'Acceso al puerto',config:{question:'Clasifica cada acción según el momento del acceso al puerto.',categories:['Antes de puncionar','Durante el acceso','Al retirar la aguja'],items:[['Higiene de manos y técnica estéril',0],['Antisepsia de la piel con clorhexidina',0],['Verificar retorno venoso',1],['Fijar la aguja con apósito transparente',1],['Lavado pulsátil con solución salina',2],['Retirar con presión positiva',2]]}},
    {type:'memory',topic:'Componentes y cuidados',config:{pairs:[['Aguja Huber','Punta no cortante para el puerto'],['Septum','Membrana de silicona autosellante'],['Reservorio','Cámara implantada bajo la piel'],['Retorno venoso','Confirma la permeabilidad'],['Lavado pulsátil','Arrastra residuos del catéter'],['Presión positiva','Evita reflujo al retirar la aguja']]}},
    {type:'guess',topic:'Complicaciones del puerto',config:{words:[['TROMBOSIS','Coágulo que puede ocluir el catéter o la vena'],['EXTRAVASACION','Salida de la infusión al tejido por mala posición de la aguja'],['INFECCION','Complicación que se previene con técnica estéril estricta']]}},
    {type:'puzzle',topic:'Cuidado del catéter implantable'}
  ]},
  {id:'02',collection:'b14dbbda-b07d-4c44-a229-bed647d83a0f',name:'Accesos vasculares para diálisis',match:'dialisis',games:[
    {type:'crossword',topic:'Accesos para hemodiálisis',config:{entries:[['FISTULA','Unión quirúrgica de arteria y vena para hemodiálisis'],['THRILL','Vibración que se palpa sobre una fístula funcional'],['SOPLO','Sonido continuo que se ausculta en la fístula'],['INJERTO','Acceso con material protésico entre arteria y vena'],['CATETER','Acceso venoso central para diálisis temporal o urgente']]}},
    {type:'memory',topic:'Tipos de acceso',config:{pairs:[['Fístula arteriovenosa','Acceso de elección a largo plazo'],['Injerto protésico','Tubo entre arteria y vena'],['Catéter tunelizado','Acceso central de larga duración'],['Thrill','Vibración palpable del flujo'],['Soplo','Sonido a la auscultación'],['Maduración','Tiempo antes de poder puncionar']]}},
    {type:'classify',topic:'Cuidados del brazo con fístula',config:{question:'¿Qué se recomienda y qué se evita en el brazo con fístula?',categories:['Se recomienda','Se debe evitar'],items:[['Revisar el thrill todos los días',0],['Lavar el brazo con agua y jabón',0],['Ejercicios con pelota para madurar',0],['Tomar la presión arterial en ese brazo',1],['Dormir apoyado sobre la fístula',1],['Usar reloj o ropa apretada',1]]}},
    {type:'wordsearch',topic:'Hemodiálisis',config:{words:['FISTULA','INJERTO','THRILL','DIALIZADOR','HEPARINA','ASEPSIA','PUNCION','FLUJO']}},
    {type:'puzzle',topic:'Sala de hemodiálisis'}
  ]},
  {id:'17',collection:'45d2d4ba-6ea7-4709-9d8c-78dffa05c1a6',name:'Cetoacidosis diabética',match:'cetoacidosis',games:[
    {type:'crossword',topic:'Cetoacidosis diabética',config:{entries:[['CETONAS','Cuerpos que se acumulan por falta de insulina'],['ACIDOSIS','Descenso del pH sanguíneo'],['POTASIO','Electrolito que se verifica antes de iniciar insulina'],['INSULINA','Se administra en infusión continua intravenosa'],['KUSSMAUL','Respiración profunda y rápida típica de la CAD']]}},
    {type:'classify',topic:'Criterios diagnósticos',config:{question:'¿Es un criterio diagnóstico de cetoacidosis diabética?',categories:['Criterio de CAD','No es criterio'],items:[['Glucosa mayor de 250 mg/dL',0],['pH menor de 7.30',0],['Bicarbonato menor de 18 mEq/L',0],['Cetonas positivas',0],['Glucosa de 140 mg/dL',1],['pH de 7.42',1]]}},
    {type:'guess',topic:'Vigilancia en la CAD',config:{words:[['BICARBONATO','Disminuye en la acidosis metabólica'],['BRECHA','Brecha ___ aniónica: se eleva en la CAD'],['EDEMA','___ cerebral: riesgo si la glucosa baja demasiado rápido']]}},
    {type:'puzzle',topic:'Paciente con CAD en terapia intensiva'}
  ]},
  {id:'03',collection:'67a7eb13-72db-4140-9404-53d48e1afc68',name:'Diabetes mellitus tipo 2',match:'diabetes',games:[
    {type:'crossword',topic:'Diabetes tipo 2',config:{entries:[['GLUCOSA','Azúcar que se mide en sangre capilar'],['INSULINA','Hormona con resistencia aumentada en la DM2'],['METFORMINA','Fármaco oral de primera línea en DM2'],['NEUROPATIA','Daño de nervios periféricos por hiperglucemia'],['GLICADA','Hemoglobina ___: refleja el control de 3 meses']]}},
    {type:'wordsearch',topic:'Control y complicaciones',config:{words:['GLUCOSA','INSULINA','DIETA','EJERCICIO','RETINOPATIA','NEFROPATIA','GLUCOMETRO','HIPOGLUCEMIA']}},
    {type:'classify',topic:'Glucosa capilar en ayuno',config:{question:'Clasifica cada resultado de glucosa capilar en ayuno.',categories:['Hipoglucemia','Dentro de meta','Hiperglucemia'],items:[['62 mg/dL',0],['55 mg/dL con sudoración',0],['95 mg/dL',1],['120 mg/dL',1],['210 mg/dL',2],['280 mg/dL',2]]}},
    {type:'puzzle',topic:'Consulta de control glucémico'}
  ]},
  {id:'04',collection:'03273029-51b4-4d21-8048-89af01cd49e6',name:'Proceso de atención en enfermería',match:'proceso de atencion|\\bpae\\b',games:[
    {type:'crossword',topic:'Etapas del PAE',config:{entries:[['VALORACION','Primera etapa: recolección sistemática de datos'],['DIAGNOSTICO','Juicio clínico sobre la respuesta del paciente'],['PLANEACION','Se fijan objetivos e intervenciones'],['EJECUCION','Se realizan las intervenciones planeadas'],['EVALUACION','Se mide si se alcanzaron los resultados']]}},
    {type:'memory',topic:'Lenguaje enfermero',config:{pairs:[['NANDA','Taxonomía de diagnósticos'],['NOC','Clasificación de resultados'],['NIC','Clasificación de intervenciones'],['Dato objetivo','Signo medible por el profesional'],['Dato subjetivo','Lo que refiere el paciente'],['Característica definitoria','Sustenta el diagnóstico']]}},
    {type:'classify',topic:'Tipos de datos',config:{question:'Clasifica cada dato de la valoración.',categories:['Dato objetivo','Dato subjetivo'],items:[['FC de 112 lpm',0],['Temperatura de 38.6 °C',0],['Herida con eritema en bordes',0],['Refiere dolor punzante',1],['Dice sentirse muy cansado',1],['Expresa miedo a la cirugía',1]]}},
    {type:'guess',topic:'Valoración enfermera',config:{words:[['GORDON','Autora de los 11 patrones funcionales de salud'],['ETIQUETA','Nombre del diagnóstico enfermero según NANDA'],['INTERVENCION','Acción de enfermería para lograr un resultado']]}},
    {type:'puzzle',topic:'Plan de cuidados al pie de cama'}
  ]},
  {id:'05',collection:'40a9cdd0-79f5-42a8-8ccf-9043c769c85b',name:'Dieta cetogénica',match:'cetogenica',games:[
    {type:'wordsearch',topic:'Dieta cetogénica',config:{words:['CETOSIS','AGUACATE','GRASAS','PROTEINA','CETONAS','CARBOHIDRATO','HIDRATACION','ELECTROLITOS']}},
    {type:'classify',topic:'Alimentos en dieta cetogénica',config:{question:'¿Este alimento se permite o se evita en la dieta cetogénica?',categories:['Permitido','Evitar'],items:[['Aguacate',0],['Huevo',0],['Salmón',0],['Tortilla de maíz',1],['Arroz blanco',1],['Refresco regular',1]]}},
    {type:'puzzle',topic:'Plato cetogénico en consulta'}
  ]},
  {id:'06',collection:'1e5e8a07-cafd-419d-b463-5946fcc63baa',name:'Vigilancia y control de vectores',match:'vector',games:[
    {type:'crossword',topic:'Control de vectores',config:{entries:[['AEDES','Género del mosquito que transmite dengue'],['LARVA','Fase acuática que se elimina en los criaderos'],['CRIADERO','Recipiente con agua donde se reproduce el mosquito'],['DENGUE','Enfermedad viral transmitida por mosquito'],['OVITRAMPA','Dispositivo para vigilar la puesta de huevos']]}},
    {type:'classify',topic:'Medidas de control',config:{question:'Clasifica cada medida de control del vector.',categories:['Control físico','Control químico','Participación comunitaria'],items:[['Eliminar llantas y cacharros',0],['Tapar tinacos y tambos',0],['Larvicida en depósitos de agua',1],['Nebulización espacial',1],['Jornada de descacharrización vecinal',2],['Pláticas en escuelas',2]]}}
  ]},
  {id:'20',collection:'c6e6d42a-a624-45d7-8ce2-ee089c3e3693',name:'Preparación del lecho de la herida',match:'lecho de la herida|\\bplh\\b',games:[
    {type:'crossword',topic:'Preparación del lecho',config:{entries:[['TIME','Acrónimo del esquema para preparar el lecho de la herida'],['BIOPELICULA','Comunidad de bacterias que retrasa la cicatrización'],['EXUDADO','Líquido que produce la herida'],['NECROSIS','Tejido muerto que debe retirarse'],['BORDES','Se valoran para ver si la herida avanza']]}},
    {type:'memory',topic:'Esquema TIME',config:{pairs:[['T · Tejido','Retirar tejido no viable'],['I · Infección','Controlar carga bacteriana'],['M · Humedad','Equilibrar el exudado'],['E · Bordes','Favorecer el avance epitelial'],['Desbridamiento autolítico','Usa la humedad del apósito'],['Desbridamiento cortante','Con bisturí o tijera']]}},
    {type:'classify',topic:'Tipo de tejido',config:{question:'¿El tejido del lecho es viable o no viable?',categories:['Viable','No viable'],items:[['Granulación roja y brillante',0],['Epitelio rosado en bordes',0],['Bordes que avanzan',0],['Esfacelo amarillo',1],['Escara negra',1],['Necrosis seca',1]]}},
    {type:'puzzle',topic:'Curación y lecho de la herida'}
  ]},
  {id:'07',collection:'954637be-6048-4879-97da-25dc8f05748e',name:'Manejo avanzado de heridas y apósitos',match:'apositos|manejo avanzado de heridas',games:[
    {type:'crossword',topic:'Apósitos avanzados',config:{entries:[['ALGINATO','Apósito para heridas muy exudativas'],['HIDROCOLOIDE','Apósito oclusivo para exudado bajo a moderado'],['ESPUMA','Apósito absorbente que amortigua'],['PLATA','Componente antimicrobiano de algunos apósitos'],['HIDROGEL','Aporta humedad a heridas secas']]}},
    {type:'memory',topic:'Función de cada apósito',config:{pairs:[['Alginato','Alta absorción de exudado'],['Hidrogel','Hidrata lechos secos'],['Plata','Acción antimicrobiana'],['Espuma','Absorbe y amortigua'],['Hidrocoloide','Exudado bajo a moderado'],['Película','Protege piel íntegra']]}},
    {type:'classify',topic:'Elección según el exudado',config:{question:'¿Para qué tipo de herida es más adecuado cada apósito?',categories:['Herida seca','Exudado moderado','Exudado abundante'],items:[['Hidrogel',0],['Hidrogel en lámina',0],['Hidrocoloide',1],['Espuma',1],['Alginato',2],['Hidrofibra',2]]}},
    {type:'hazard',board:1},
    {type:'puzzle',topic:'Selección de apósitos'}
  ]},
  {id:'08',collection:'8d243ae2-b293-4f3e-9147-61119a15b494',name:'Vacunas',match:'vacuna',games:[
    {type:'wordsearch',topic:'Vacunación',config:{words:['INMUNIDAD','REFUERZO','ANTIGENO','CARTILLA','BIOLOGICO','ESQUEMA','ANTICUERPO','ADYUVANTE']}},
    {type:'classify',topic:'Cadena de frío',config:{question:'¿La acción respeta o rompe la cadena de frío?',categories:['Respeta la cadena de frío','La rompe'],items:[['Mantener entre +2 y +8 °C',0],['Registrar la temperatura dos veces al día',0],['Usar termo con paquetes refrigerantes',0],['Guardar alimentos en el refrigerador de vacunas',1],['Dejar el termo abierto al sol',1],['Congelar vacunas que no lo permiten',1]]}},
    {type:'puzzle',topic:'Módulo de vacunación'}
  ]},
  {id:'09',collection:'bc3002cf-ef6b-4bc3-a939-2a8d74b47443',name:'Peritaje toxicológico',match:'toxicolog|peritaje',games:[
    {type:'crossword',topic:'Toxicología forense',config:{entries:[['CUSTODIA','Cadena que garantiza la integridad de la evidencia'],['CROMATOGRAFIA','Técnica confirmatoria para identificar sustancias'],['METABOLITO','Producto de la transformación de un tóxico'],['ETANOL','Alcohol que se cuantifica en sangre'],['MUESTRA','Material biológico que se analiza']]}},
    {type:'memory',topic:'Análisis toxicológico',config:{pairs:[['Cadena de custodia','Registro de quién manejó la evidencia'],['Inmunoensayo','Prueba de tamizaje'],['Cromatografía de gases','Prueba confirmatoria'],['Humor vítreo','Muestra útil post mortem'],['Metabolito','Producto de la biotransformación'],['Ventana de detección','Tiempo en que la sustancia es medible']]}},
    {type:'classify',topic:'Ventana de detección',config:{question:'¿Qué periodo de consumo refleja mejor cada muestra?',categories:['Horas','Días','Semanas a meses'],items:[['Sangre',0],['Saliva',0],['Aire espirado',0],['Orina',1],['Cabello',2],['Uñas',2]]}},
    {type:'wordsearch',topic:'Peritaje',config:{words:['TOXICO','AUTOPSIA','OPIACEOS','EVIDENCIA','PERITO','DICTAMEN','LABORATORIO','SANGRE']}},
    {type:'puzzle',topic:'Laboratorio de toxicología forense'}
  ]},
  {id:'10',collection:'bfa9946e-0fdc-41ac-85ef-4e2673c7ce90',name:'Manejo de accesos vasculares',match:'accesos vasculares',games:[
    {type:'crossword',topic:'Accesos venosos periféricos',config:{entries:[['CALIBRE','Grosor del catéter expresado en Gauge'],['FLEBITIS','Inflamación de la vena canalizada'],['TORNIQUETE','Se coloca para ingurgitar la vena'],['ULTRASONIDO','Guía la punción en venas difíciles'],['APOSITO','Cubre y fija el sitio de inserción']]}},
    {type:'memory',topic:'Dispositivos de acceso',config:{pairs:[['Catéter corto periférico','Terapias breves compatibles'],['Línea media','Punta antes de la axila'],['PICC','Central de inserción periférica'],['CVC','Catéter venoso central'],['Escala de flebitis','Valora la inflamación del sitio'],['14 G','Mayor calibre, mayor flujo']]}},
    {type:'classify',topic:'Selección de la vena',config:{question:'Al elegir el sitio de punción, ¿qué se prefiere y qué se evita?',categories:['Preferir','Evitar'],items:[['Venas del antebrazo',0],['Vena recta y palpable',0],['Brazo no dominante',0],['Zonas de flexión',1],['Brazo con fístula',1],['Miembro con linfedema',1]]}},
    {type:'puzzle',topic:'Punción guiada por ultrasonido'}
  ]},
  {id:'11',collection:'11d81c88-eec7-4039-9407-7247ec4716ea',name:'Hipoxemia y fisioterapia pulmonar',match:'hipoxemia|fisioterapia pulmonar',games:[
    {type:'crossword',topic:'Oxigenación',config:{entries:[['SATURACION','Porcentaje de hemoglobina unida a oxígeno'],['HIPOXEMIA','Oxígeno arterial bajo'],['INCENTIVADOR','Dispositivo para inspiraciones profundas'],['DIAFRAGMA','Músculo principal de la respiración'],['ATELECTASIA','Colapso de alveolos que se previene con ejercicios']]}},
    {type:'memory',topic:'Dispositivos y técnicas',config:{pairs:[['Puntas nasales','Bajo flujo, hasta 6 L/min'],['Mascarilla con reservorio','FiO2 alta sin recircular'],['Alto flujo','Gas calentado y humidificado'],['Posición prono','Mejora la relación V/Q'],['Tos asistida','Moviliza secreciones'],['Oximetría','Mide SpO2 sin invadir']]}},
    {type:'classify',topic:'Saturación de oxígeno',config:{question:'Clasifica cada lectura de SpO2 en un adulto sin neumopatía crónica.',categories:['Hipoxemia severa','Hipoxemia leve a moderada','Rango normal'],items:[['SpO2 82%',0],['SpO2 85%',0],['SpO2 90%',1],['SpO2 92%',1],['SpO2 96%',2],['SpO2 98%',2]]}},
    {type:'wordsearch',topic:'Fisioterapia pulmonar',config:{words:['OXIGENO','DRENAJE','POSTURA','PERCUSION','VIBRACION','ALVEOLO','BRONQUIO','ESPIRACION']}},
    {type:'puzzle',topic:'Fisioterapia respiratoria'}
  ]},
  {id:'12',collection:'0e2e8ab7-ac74-4440-af26-9fc79d1d599a',name:'Terapia de presión negativa',match:'presion negativa|\\btpn\\b',games:[
    {type:'crossword',topic:'Terapia de presión negativa',config:{entries:[['PRESION','Se aplica de forma negativa y controlada sobre la herida'],['CONTENEDOR','Recibe el exudado aspirado'],['ESPUMA','Material que se coloca en el lecho de la herida'],['GRANULACION','Tejido que la terapia estimula'],['FUGA','Pérdida del sellado que activa la alarma']]}},
    {type:'memory',topic:'Componentes de la TPN',config:{pairs:[['-125 mmHg','Presión continua más usada'],['Espuma de poliuretano','Distribuye la presión'],['Película adhesiva','Sella la herida'],['Contenedor','Recolecta el exudado'],['Alarma de fuga','Indica sellado deficiente'],['Granulación','Tejido que se estimula']]}},
    {type:'classify',topic:'Indicaciones',config:{question:'¿La terapia de presión negativa está indicada o contraindicada?',categories:['Indicada','Contraindicada'],items:[['Herida quirúrgica dehiscente',0],['Úlcera crónica con buen lecho',0],['Fijación de injerto de piel',0],['Necrosis sin desbridar',1],['Malignidad en la herida',1],['Vasos sanguíneos expuestos',1]]}},
    {type:'guess',topic:'Cuidados de la TPN',config:{words:[['DESBRIDAR','Retirar el tejido no viable antes de iniciar'],['MACERACION','Daño de la piel por exceso de humedad'],['SELLADO','Debe ser hermético para que la terapia funcione']]}},
    {type:'puzzle',topic:'Equipo de presión negativa'}
  ]},
  {id:'13',collection:'f21c8cf0-6f60-42ad-baa1-a21e40fa1f45',name:'Sepsis neonatal',match:'neonatal',games:[
    {type:'crossword',topic:'Sepsis neonatal',config:{entries:[['TEMPRANA','Sepsis que inicia en las primeras 72 horas'],['TARDIA','Sepsis adquirida después de las 72 horas'],['HEMOCULTIVO','Estándar para confirmar la sepsis'],['APNEA','Pausa respiratoria que puede ser signo de sepsis'],['HIPOTERMIA','Temperatura baja, signo frecuente en el neonato']]}},
    {type:'memory',topic:'Diagnóstico y tratamiento',config:{pairs:[['Sepsis temprana','Transmisión vertical, menos de 72 h'],['Sepsis tardía','Adquirida en el hospital o comunidad'],['Hemocultivo','Confirma el diagnóstico'],['PCR','Proteína C reactiva'],['Estreptococo grupo B','Causa frecuente temprana'],['Ampicilina + gentamicina','Esquema empírico inicial']]}},
    {type:'classify',topic:'Riesgo y signos',config:{question:'¿Es un factor de riesgo materno o un signo en el neonato?',categories:['Factor de riesgo materno','Signo en el neonato'],items:[['Ruptura de membranas mayor de 18 h',0],['Fiebre materna intraparto',0],['Corioamnionitis',0],['Apnea',1],['Rechazo al alimento',1],['Inestabilidad térmica',1]]}},
    {type:'wordsearch',topic:'Cuidados en UCIN',config:{words:['INCUBADORA','ASEPSIA','PREMATURO','ANTIBIOTICO','LETARGIA','ICTERICIA','CULTIVO','NEONATO']}},
    {type:'puzzle',topic:'Unidad de cuidados intensivos neonatales'}
  ]},
  {id:'14',collection:'e91c16b0-20ca-45bc-b251-9e7891ac9afe',name:'Paciente politraumatizado',match:'politraumat',games:[
    {type:'crossword',topic:'Atención inicial del trauma',config:{entries:[['COLLARIN','Inmoviliza la columna cervical'],['HEMORRAGIA','Se controla primero si es exsanguinante'],['NEUMOTORAX','Aire en la pleura que compromete la ventilación'],['GLASGOW','Escala para valorar el estado neurológico'],['CHOQUE','Estado de hipoperfusión que se reconoce en la C']]}},
    {type:'spot',board:0}
  ]},
  {id:'15',collection:'1f65357c-941a-4ee1-bcf9-6de1822e2a5d',name:'Paciente quemado',match:'quemad',games:[
    {type:'crossword',topic:'Paciente quemado',config:{entries:[['PARKLAND','Fórmula para calcular la reposición de líquidos'],['NUEVE','Regla de los ___ para estimar la superficie quemada'],['ESCAROTOMIA','Incisión que libera una escara circunferencial'],['ESCARA','Tejido quemado, rígido y sin vida'],['DIURESIS','Su meta horaria guía la reanimación con líquidos']]}},
    {type:'classify',topic:'Profundidad de la quemadura',config:{question:'Clasifica cada hallazgo según la profundidad de la quemadura.',categories:['Primer grado','Segundo grado','Tercer grado'],items:[['Eritema sin ampollas',0],['Dolor leve, como quemadura solar',0],['Ampollas y dolor intenso',1],['Lecho rosado y húmedo',1],['Piel acartonada e indolora',2],['Afecta todo el espesor de la piel',2]]}},
    {type:'puzzle',topic:'Unidad de quemados'}
  ]},
  {id:'16',collection:'63573514-d69d-4627-816f-dfa4aee1ddf5',name:'Ostomías',match:'ostomia',games:[
    {type:'crossword',topic:'Ostomías',config:{entries:[['ESTOMA','Abertura quirúrgica del intestino en la piel'],['COLOSTOMIA','Derivación del colon a la pared abdominal'],['ILEOSTOMIA','Derivación del íleon, con efluente líquido'],['PLACA','Base adhesiva que protege la piel'],['DERMATITIS','Irritación de la piel alrededor del estoma']]}},
    {type:'memory',topic:'Tipos y dispositivos',config:{pairs:[['Colostomía','Heces formadas'],['Ileostomía','Efluente líquido'],['Urostomía','Derivación de orina'],['Placa','Protege la piel periestomal'],['Pasta','Rellena pliegues y sella'],['Medidor','Ajusta el diámetro del recorte']]}},
    {type:'classify',topic:'Valoración del estoma',config:{question:'¿El hallazgo es normal o es un signo de alarma?',categories:['Estoma normal','Signo de alarma'],items:[['Rojo y húmedo',0],['Ligeramente brillante',0],['Sangrado leve al limpiarlo',0],['Color negro o morado',1],['Retraído bajo la piel',1],['Piel periestomal ulcerada',1]]}},
    {type:'puzzle',topic:'Educación al paciente ostomizado'}
  ]},
  {id:'18',collection:'375e490d-e9fa-4b99-aa84-62a5a4ff0bce',name:'Síndrome de HELLP',match:'hellp',games:[
    {type:'crossword',topic:'Síndrome de HELLP',config:{entries:[['HEMOLISIS','Destrucción de glóbulos rojos: la H de HELLP'],['PLAQUETAS','Su descenso es la LP de HELLP'],['TRANSAMINASAS','Enzimas hepáticas que se elevan'],['MAGNESIO','Sulfato de ___ para prevenir convulsiones'],['EPIGASTRIO','Zona del dolor típico del síndrome']]}},
    {type:'memory',topic:'Componentes y manejo',config:{pairs:[['H','Hemólisis'],['EL','Enzimas hepáticas elevadas'],['LP','Plaquetas bajas'],['Sulfato de magnesio','Previene la eclampsia'],['Reflejos osteotendinosos','Vigilan toxicidad por magnesio'],['Gluconato de calcio','Antídoto del magnesio']]}},
    {type:'classify',topic:'Vigilancia',config:{question:'¿El hallazgo indica severidad o es tranquilizador?',categories:['Dato de severidad','Dato tranquilizador'],items:[['Dolor en epigastrio',0],['Plaquetas menores de 100 000',0],['Cefalea intensa',0],['TA de 120/80 mmHg',1],['Diuresis mayor de 30 mL/h',1],['Reflejos presentes y normales',1]]}},
    {type:'spot',board:3},
    {type:'puzzle',topic:'Vigilancia obstétrica'}
  ]},
  {id:'19',collection:'9c69ea75-8f61-4e3a-8d4f-e74d0809fea8',name:'Lesiones por presión',match:'lesiones por presion|\\blpp\\b',games:[
    {type:'crossword',topic:'Lesiones por presión',config:{entries:[['BRADEN','Escala para valorar el riesgo de LPP'],['CIZALLA','Fuerza que desliza los tejidos entre sí'],['SACRO','Zona más frecuente de LPP en decúbito'],['TALON','Prominencia ósea que se protege con taloneras'],['HUMEDAD','Factor de riesgo por incontinencia o sudor']]}},
    {type:'classify',topic:'Estadios de LPP',config:{question:'Clasifica cada hallazgo según el estadio de la lesión.',categories:['Estadio 1','Estadio 2','Estadio 3 o 4'],items:[['Eritema que no blanquea',0],['Piel íntegra enrojecida',0],['Flictena con líquido seroso',1],['Pérdida parcial de la dermis',1],['Grasa subcutánea visible',2],['Hueso o tendón expuesto',2]]}},
    {type:'puzzle',topic:'Reposicionamiento del paciente'}
  ]},
  {id:'21',collection:'15ab9c56-bfe1-4b11-864e-bc5716b616ab',name:'Prevención de infecciones (IAAS)',match:'infecciones asociadas|\\biaas\\b|control de infecciones',games:[
    {type:'crossword',topic:'Prevención de IAAS',config:{entries:[['ASEPSIA','Ausencia de microorganismos patógenos'],['MOMENTOS','Los cinco ___ de la higiene de manos'],['ALCOHOL','Base del gel para la higiene de manos'],['AISLAMIENTO','Precauciones según la vía de transmisión'],['NEUMONIA','IAAS asociada a ventilación mecánica']]}},
    {type:'classify',topic:'Precauciones por vía de transmisión',config:{question:'¿Qué tipo de precaución requiere cada caso?',categories:['Contacto','Gotas','Aire'],items:[['Clostridioides difficile',0],['Bacteria multirresistente',0],['Influenza',1],['Tos ferina',1],['Tuberculosis pulmonar',2],['Sarampión',2]]}},
    {type:'hazard',board:3},
    {type:'spot',board:1}
  ]},
  {id:'22',collection:'9bf93256-6938-4a77-acda-5c71d4c3ed08',name:'Electrolifting con Plasma Pen',match:'plasma|electrolifting|rejuvenecimiento',games:[
    {type:'crossword',topic:'Plasma Pen',config:{entries:[['FIBROBLASTO','Célula que produce colágeno'],['COLAGENO','Proteína que da firmeza a la piel'],['COSTRA','Se forma tras el disparo y no se retira'],['FOTOTIPO','Clasificación de Fitzpatrick'],['PARPADO','Zona frecuente de tratamiento por flacidez']]}},
    {type:'memory',topic:'Procedimiento',config:{pairs:[['Fitzpatrick','Clasifica los fototipos'],['Arco de plasma','Sublima la epidermis'],['Anestésico tópico','Se aplica antes'],['Fotoprotector','Obligatorio en la recuperación'],['Hiperpigmentación','Riesgo en fototipos altos'],['Costras','Caen solas en 5 a 7 días']]}},
    {type:'classify',topic:'Selección de la paciente',config:{question:'¿La paciente es apta para Plasma Pen?',categories:['Apta','No apta'],items:[['Arrugas finas periorbitarias',0],['Fototipo II',0],['Flacidez leve de párpado',0],['Embarazo',1],['Infección activa en la zona',1],['Tendencia a queloides',1]]}},
    {type:'wordsearch',topic:'Estética facial',config:{words:['PLASMA','ARRUGA','EPIDERMIS','FLACIDEZ','ELASTINA','CICATRIZ','ANESTESIA','PROTECTOR']}},
    {type:'puzzle',topic:'Cabina de tratamiento facial'}
  ]},
  {id:'23',collection:'979b31a8-c853-427f-943c-8ac8f860aec8',name:'Síndrome de fragilidad',match:'fragilidad',games:[
    {type:'crossword',topic:'Fragilidad en la vejez',config:{entries:[['SARCOPENIA','Pérdida de masa y fuerza muscular'],['FRIED','Autora del fenotipo de fragilidad'],['MARCHA','Su velocidad lenta es criterio de fragilidad'],['DINAMOMETRO','Mide la fuerza de prensión'],['CAIDAS','Riesgo principal que se busca prevenir']]}},
    {type:'memory',topic:'Fenotipo de fragilidad',config:{pairs:[['Fenotipo de Fried','5 criterios de fragilidad'],['Prefrágil','1 o 2 criterios'],['Frágil','3 o más criterios'],['Velocidad de marcha','Lenta si es menor de 0.8 m/s'],['Fuerza de prensión','Se mide con dinamómetro'],['Sarcopenia','Pérdida de masa y fuerza']]}},
    {type:'classify',topic:'Criterios de Fried',config:{question:'¿Es un criterio del fenotipo de fragilidad de Fried?',categories:['Criterio de Fried','No es criterio'],items:[['Pérdida de peso no intencionada',0],['Agotamiento referido',0],['Marcha lenta',0],['Debilidad en la prensión',0],['Hipertensión controlada',1],['Uso de lentes',1]]}},
    {type:'hazard',board:0},
    {type:'puzzle',topic:'Acompañamiento del adulto mayor'}
  ]},
  {id:'24',collection:'ab74f978-c7d1-4e9e-9570-3ccaa2a05368',name:'Terapia de infusión',match:'infusion',games:[
    {type:'crossword',topic:'Terapia de infusión',config:{entries:[['GOTEO','Velocidad de la infusión en gotas por minuto'],['OSMOLARIDAD','Concentración de partículas de la solución'],['INFILTRACION','Fuga de solución no vesicante al tejido'],['BOMBA','Equipo que controla el flujo programado'],['CEBADO','Llenar la línea de solución para retirar el aire']]}},
    {type:'memory',topic:'Soluciones y equipos',config:{pairs:[['Solución isotónica','Osmolaridad similar al plasma'],['Solución hipertónica','Mayor osmolaridad'],['Macrogotero','20 gotas = 1 mL'],['Microgotero','60 gotas = 1 mL'],['Bomba de infusión','Controla el flujo'],['Infiltración','Fuga no vesicante']]}},
    {type:'classify',topic:'Tonicidad de soluciones',config:{question:'Clasifica cada solución según su tonicidad.',categories:['Isotónica','Hipotónica','Hipertónica'],items:[['Solución salina 0.9%',0],['Ringer lactato',0],['Solución salina 0.45%',1],['Solución salina 0.33%',1],['Solución glucosada 10%',2],['Solución salina 3%',2]]}},
    {type:'hazard',board:2},
    {type:'puzzle',topic:'Programación de bomba de infusión'}
  ]}
];
window.SYNOVA_COURSE_GAMES.forEach(function(p){p.image=IMG+p.id+'.webp';});
})();
