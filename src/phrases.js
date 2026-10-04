export const PHRASES = [
  'La disciplina es elegir lo que quieres más, sobre lo que quieres ahora.',
  'No tienes que sentir ganas. Solo empieza 15 minutos.',
  'Cada día cumplido es un voto por la persona que quieres ser.',
  'Un día perfecto no se pierde por descansar: se pierde por rendirse.',
  'Tu racha se construye hoy, no mañana.',
  'La motivación te arranca; el hábito te sostiene.',
  'Hazlo aunque sea pequeño. Pequeño sigue sumando.',
  'Quien domina su mañana, domina su día.',
  'El inglés y la ciberseguridad abren puertas. Hoy toca avanzar.',
  'Un exploit se aprende línea a línea; un hábito, día a día.',
  'Leer 15 minutos hoy es una ventaja que casi nadie toma.',
  'Cero alcohol hoy: mente clara, mejores decisiones.',
  'No negocies contigo mismo. Cumple.',
  'Lo difícil no es empezar: es volver cuando fallas. Vuelve.',
  'Eres lo que haces repetidamente. Repite lo que te construye.',
  'Si fuera fácil, todos lo harían. Por eso vale.',
  'Respira. Enfoca. Ejecuta.',
  'Tu yo del futuro te agradece cada minuto de hoy.',
  'Constancia vence a talento cuando el talento no es constante.',
  'Hoy es un buen día para no romper la cadena.',
  'Menos excusas, más repeticiones.',
  'El progreso silencioso también es progreso.',
  'Entrena la mente igual que el cuerpo: sin faltar.',
  'Un paso más en tu camino de monje. Sin prisa, sin pausa.',
  'Aprender un poco cada día supera estudiar mucho una vez.',
  'La libertad nace de la disciplina.',
  'Termina lo que empezaste en la mañana. Cierra el día fuerte.',
  'No cuentes los días: haz que los días cuenten.',
  'Cuando dudes, haz los 5 primeros minutos.',
  'Hoy protege tu racha como protegerías un sistema crítico.',
  'El impulso dura minutos. Tu decisión define semanas.',
  'Energía bien guardada es energía para construir tu futuro.',
  'Cuando llegue el impulso: respira, muévete, cambia de lugar.',
  'Cada día limpio devuelve foco, claridad y respeto propio.',
];

export const phraseFor = (key, offset = 0) => {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PHRASES[(h + offset) % PHRASES.length];
};
