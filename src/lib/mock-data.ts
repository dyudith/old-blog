// Fase 3: `projects` migró a Supabase/PostgreSQL — ver src/repositories/projects.ts.
// Lo que queda acá es lo que todavía no tiene una página consumiéndolo desde
// DB: el sidebar sigue usando estos valores fijos aunque ya existe la tabla
// `music_entries` con datos reales (ver src/repositories/music.ts), porque
// esta fase solo pedía migrar projects. Es un candidato natural para la
// próxima limpieza, no algo que haya que resolver ahora.

export const nowPlaying = {
  artist: 'Boards of Canada',
  track: 'Roygbiv',
};

export const nowReading = {
  title: 'The Pragmatic Programmer',
  author: 'David Thomas & Andrew Hunt',
};
