import { useEffect, useRef, useState } from 'react';

// Tipado mínimo de lo que necesitamos de la API de Pagefind en runtime.
interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    meta: { title?: string };
    excerpt: string;
  }>;
}
interface PagefindAPI {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

interface ResultItem {
  url: string;
  title: string;
  excerpt: string;
}

export default function SearchWidget() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'unavailable'>('idle');
  const pagefindRef = useRef<PagefindAPI | null>(null);

  useEffect(() => {
    // Pagefind genera este módulo en /pagefind/pagefind.js recién en el
    // `npm run build` (el script `postbuild` corre `pagefind --site dist`).
    // En `astro dev` este archivo todavía no existe: lo manejamos como
    // "no disponible" en vez de romper la página.
    // La ruta se arma en una variable (no como string literal directo en el
    // import) a propósito: así ni Vite ni Rollup intentan resolverla en
    // build time — es un import verdaderamente dinámico, resuelto por el
    // navegador en runtime.
    const pagefindEntry = ['', 'pagefind', 'pagefind.js'].join('/');
    import(/* @vite-ignore */ pagefindEntry)
      .then((mod) => {
        pagefindRef.current = mod;
      })
      .catch(() => setStatus('unavailable'));
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    if (!pagefindRef.current) {
      if (status !== 'unavailable') setStatus('unavailable');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    const timeout = setTimeout(async () => {
      const { results: raw } = await pagefindRef.current!.search(trimmed);
      const withData = await Promise.all(raw.slice(0, 10).map((r) => r.data()));
      if (!cancelled) {
        setResults(
          withData.map((d) => ({
            url: d.url,
            title: d.meta.title ?? d.url,
            excerpt: d.excerpt,
          }))
        );
        setStatus('idle');
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div>
      <label htmlFor="search-input" className="visually-hidden">
        Buscar en el sitio
      </label>
      <input
        id="search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar posts, proyectos, tags..."
        className="search-input"
        autoFocus
      />

      {status === 'unavailable' && (
        <p className="search-hint">
          El índice de búsqueda solo existe en el sitio compilado (
          <code>npm run build</code>). En <code>npm run dev</code> esta caja
          no va a devolver resultados.
        </p>
      )}

      <ul className="search-results">
        {results.map((r) => (
          <li key={r.url} className="box">
            <a href={r.url}>
              <h2 dangerouslySetInnerHTML={{ __html: r.title }} />
            </a>
            <p dangerouslySetInnerHTML={{ __html: r.excerpt }} />
          </li>
        ))}
      </ul>

      {status === 'idle' && query.trim() && results.length === 0 && (
        <p>No encontré resultados para "{query}".</p>
      )}
    </div>
  );
}
