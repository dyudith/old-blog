// Tipos escritos a mano, con la MISMA forma que genera la herramienta
// oficial de Supabase. Una vez que tengas un proyecto real, regeneralos así
// (necesita la Supabase CLI y estar logueado / tener el project ref):
//
//   npx supabase login
//   npx supabase gen types typescript --project-id <tu-project-ref> --schema public > src/lib/supabase/database.types.ts
//
// Este archivo es el punto de partida para que el resto del código (cliente,
// repositories) ya tenga autocompletado y validación de tipos desde ahora,
// sin esperar a tener credenciales reales. No lo mantengas a mano por mucho
// tiempo: en cuanto exista el proyecto, reemplazalo por el generado.

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          long_description: string | null;
          image: string | null;
          url: string | null;
          github_url: string | null;
          technologies: string[];
          status: 'active' | 'archived' | 'idea';
          featured: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['projects']['Row']> & {
          slug: string;
          name: string;
          description: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Row']>;
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          cover_image: string | null;
          status: 'to_read' | 'reading' | 'finished' | 'abandoned';
          started_at: string | null;
          finished_at: string | null;
          rating: number | null;
          notes: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['books']['Row']> & {
          title: string;
          author: string;
        };
        Update: Partial<Database['public']['Tables']['books']['Row']>;
      };
      music_entries: {
        Row: {
          id: string;
          kind: 'now_playing' | 'log';
          artist: string;
          track: string | null;
          album: string | null;
          is_current: boolean;
          listened_at: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['music_entries']['Row']> & {
          artist: string;
        };
        Update: Partial<Database['public']['Tables']['music_entries']['Row']>;
      };
      links: {
        Row: {
          id: string;
          name: string;
          url: string;
          description: string | null;
          category: string | null;
          image: string | null;
          featured: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['links']['Row']> & {
          name: string;
          url: string;
        };
        Update: Partial<Database['public']['Tables']['links']['Row']>;
      };
      guestbook_entries: {
        Row: {
          id: string;
          name: string;
          message: string;
          website: string | null;
          status: 'pending' | 'approved' | 'hidden';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['guestbook_entries']['Row']> & {
          name: string;
          message: string;
        };
        Update: Partial<Database['public']['Tables']['guestbook_entries']['Row']>;
      };
    };
  };
}
