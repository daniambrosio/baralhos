import { createDeckLibrary } from '../library';
import { isImpostorItem, isMimicaItem, type MimicaItem } from '../items';
import { deckLanguage } from '../language';
import { parseIndex } from '../validate';
import type { CoverCache, DeckLibraryConfig, KeyValueStore } from '../types';

const BASE = 'https://baralhos.example';

function entry(id: string, versao: number, extra: Record<string, unknown> = {}) {
  return {
    id,
    versao,
    titulo: id,
    descricao: '',
    capa: `capas/${id}.webp`,
    categorias: ['familia'],
    preco: 'gratis',
    faixa: 'livre',
    itens: 2,
    ...extra,
  };
}

function index(entries: unknown[], extra: Record<string, unknown> = {}) {
  return { formato: 1, jogo: 'mimica', idioma: 'pt-BR', categorias: [{ id: 'familia', nome: 'Família' }], baralhos: entries, ...extra };
}

const deckFile = (id: string, versao: number, words = ['gato', 'cão']) => ({
  id,
  versao,
  itens: words.map((texto) => ({ texto })),
});

function memoryStore(initial: Record<string, unknown> = {}): KeyValueStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    data,
    getItem: async (k) => data.get(k) ?? null,
    setItem: async (k, v) => {
      data.set(k, v);
    },
  };
}

/** Fake server: path → JSON body, or a number for an HTTP error. A missing path throws (no internet). */
function server(files: Record<string, unknown>) {
  const calls: string[] = [];
  const fetchFn = jest.fn(async (url: string) => {
    calls.push(url);
    const path = url.replace(`${BASE}/`, '');
    if (!(path in files)) throw new TypeError('Network request failed');
    const body = files[path];
    if (typeof body === 'number') return { ok: false, status: body, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(body)) };
  });
  return { fetch: fetchFn as unknown as typeof fetch, calls };
}

const embedded = {
  index: index([entry('animais', 1, { embutido: true })]),
  decks: { animais: deckFile('animais', 1, ['girafa']) },
  covers: { 'capas/animais.webp': 42 },
};

function library(overrides: Partial<DeckLibraryConfig<MimicaItem>> = {}) {
  return createDeckLibrary<MimicaItem>({
    game: 'mimica',
    baseUrl: `${BASE}/`,
    language: 'pt-BR',
    embedded: { 'pt-BR': embedded },
    storage: memoryStore(),
    isItem: isMimicaItem,
    fetch: server({}).fetch,
    ...overrides,
  });
}

describe('deckLanguage', () => {
  it.each([
    ['pt-BR', 'pt-BR'],
    ['pt-PT', 'pt-BR'],
    ['pt_BR', 'pt-BR'],
    ['es-MX', 'es'],
    ['es', 'es'],
    ['en-US', 'en'],
    ['fr-FR', 'en'],
    ['', 'en'],
    [undefined, 'en'],
  ])('%s → %s', (locale, expected) => {
    expect(deckLanguage(locale)).toBe(expected);
  });
});

describe('parseIndex', () => {
  it('keeps only "livre" decks and drops unknown fields', () => {
    const parsed = parseIndex(
      index([entry('a', 1, { novidade: 'x' }), entry('b', 1, { faixa: 'adulto' }), { id: 'sem-versao' }]),
      'mimica',
      'pt-BR',
    );
    expect(parsed?.baralhos.map((d) => d.id)).toEqual(['a']);
    expect(parsed?.baralhos[0]).not.toHaveProperty('novidade');
  });

  it('rejects another format, game or language', () => {
    expect(parseIndex(index([], { formato: 2 }), 'mimica', 'pt-BR')).toBeNull();
    expect(parseIndex(index([], { jogo: 'impostor' }), 'mimica', 'pt-BR')).toBeNull();
    expect(parseIndex(index([], { idioma: 'es' }), 'mimica', 'pt-BR')).toBeNull();
  });
});

describe('index', () => {
  it('without network and nothing stored, uses the embedded index', async () => {
    const lib = library();
    const idx = await lib.refreshIndex();
    expect(idx.baralhos.map((d) => d.id)).toEqual(['animais']);
  });

  it('downloads, stores and later uses the stored index offline', async () => {
    const storage = memoryStore();
    const online = server({ 'mimica/pt-BR/indice.json': index([entry('animais', 1), entry('comidas', 1)]) });
    await library({ storage, fetch: online.fetch }).refreshIndex();
    expect(online.calls).toEqual([`${BASE}/mimica/pt-BR/indice.json`]);

    const offline = library({ storage });
    const idx = await offline.refreshIndex();
    expect(idx.baralhos.map((d) => d.id)).toEqual(['animais', 'comidas']);
  });

  it('a newer format on the server keeps what is stored', async () => {
    const storage = memoryStore();
    await library({ storage, fetch: server({ 'mimica/pt-BR/indice.json': index([entry('animais', 1), entry('comidas', 1)]) }).fetch }).refreshIndex();
    const lib = library({ storage, fetch: server({ 'mimica/pt-BR/indice.json': index([entry('x', 1)], { formato: 2 }) }).fetch });
    expect((await lib.refreshIndex()).baralhos.map((d) => d.id)).toEqual(['animais', 'comidas']);
  });

  it('an HTTP error falls back to the embedded index', async () => {
    const lib = library({ fetch: server({ 'mimica/pt-BR/indice.json': 500 }).fetch });
    expect((await lib.refreshIndex()).baralhos.map((d) => d.id)).toEqual(['animais']);
  });

  it('a language with nothing embedded and no network gives an empty index', async () => {
    const lib = library({ language: 'en' });
    expect((await lib.refreshIndex()).baralhos).toEqual([]);
  });
});

describe('deck', () => {
  it('uses the embedded deck when the index has the same version', async () => {
    const online = server({ 'mimica/pt-BR/indice.json': index([entry('animais', 1)]) });
    const lib = library({ fetch: online.fetch });
    await lib.refreshIndex();
    expect((await lib.deck('animais'))?.itens).toEqual([{ texto: 'girafa' }]);
    expect(online.calls).toHaveLength(1);
  });

  it('downloads a newer version, stores it and uses it offline', async () => {
    const storage = memoryStore();
    const online = server({
      'mimica/pt-BR/indice.json': index([entry('animais', 2)]),
      'mimica/pt-BR/animais.json': deckFile('animais', 2, ['ornitorrinco']),
    });
    const lib = library({ storage, fetch: online.fetch });
    await lib.refreshIndex();
    expect((await lib.deck('animais'))?.versao).toBe(2);

    const offline = library({ storage });
    await offline.refreshIndex();
    expect((await offline.deck('animais'))?.itens).toEqual([{ texto: 'ornitorrinco' }]);
  });

  it('downloads a deck that is not embedded', async () => {
    const lib = library({
      fetch: server({
        'mimica/pt-BR/indice.json': index([entry('animais', 1), entry('comidas', 1)]),
        'mimica/pt-BR/comidas.json': deckFile('comidas', 1, ['pizza', '']),
      }).fetch,
    });
    await lib.refreshIndex();
    expect((await lib.deck('comidas'))?.itens).toEqual([{ texto: 'pizza' }]);
  });

  it('an invalid download keeps the old copy', async () => {
    const storage = memoryStore();
    const lib = library({
      storage,
      fetch: server({
        'mimica/pt-BR/indice.json': index([entry('animais', 3)]),
        'mimica/pt-BR/animais.json': { id: 'outro', versao: 3, itens: [{ texto: 'x' }] },
      }).fetch,
    });
    await lib.refreshIndex();
    expect((await lib.deck('animais'))?.versao).toBe(1);
    expect(storage.data.has('baralhos:mimica:pt-BR:baralho:animais')).toBe(false);
  });

  it('a deck not embedded, with no network, is null', async () => {
    const storage = memoryStore({ 'baralhos:mimica:pt-BR:indice': index([entry('comidas', 1)]) });
    const lib = library({ storage });
    await lib.refreshIndex();
    expect(await lib.deck('comidas')).toBeNull();
  });

  it('a newer embedded deck (app update) wins over an older stored one', async () => {
    const storage = memoryStore({ 'baralhos:mimica:pt-BR:baralho:animais': deckFile('animais', 1, ['antigo']) });
    const lib = library({
      storage,
      embedded: { 'pt-BR': { ...embedded, decks: { animais: deckFile('animais', 2, ['novo']) } } },
    });
    await lib.refreshIndex();
    expect((await lib.deck('animais'))?.itens).toEqual([{ texto: 'novo' }]);
  });

  it('two calls at the same time download once', async () => {
    const online = server({
      'mimica/pt-BR/indice.json': index([entry('animais', 2)]),
      'mimica/pt-BR/animais.json': deckFile('animais', 2),
    });
    const lib = library({ fetch: online.fetch });
    await lib.refreshIndex();
    await Promise.all([lib.deck('animais'), lib.deck('animais')]);
    expect(online.calls.filter((u) => u.endsWith('animais.json'))).toHaveLength(1);
  });

  it('works for the Impostor item format', async () => {
    const lib = createDeckLibrary({
      game: 'impostor',
      baseUrl: BASE,
      language: 'es',
      embedded: {
        es: {
          index: index([entry('clasicos', 1)], { jogo: 'impostor', idioma: 'es' }),
          decks: { clasicos: { id: 'clasicos', versao: 1, itens: [{ palavra: 'playa', parecida: 'piscina' }, { texto: 'x' }] } },
        },
      },
      storage: memoryStore(),
      isItem: isImpostorItem,
      fetch: server({}).fetch,
    });
    await lib.refreshIndex();
    expect((await lib.deck('clasicos'))?.itens).toEqual([{ palavra: 'playa', parecida: 'piscina' }]);
  });
});

describe('cover', () => {
  it('uses the bundled cover', async () => {
    expect(await library().cover({ capa: 'capas/animais.webp' })).toBe(42);
  });

  it('without a cache, points to the server', async () => {
    expect(await library().cover({ capa: 'capas/comidas.webp' })).toEqual({ uri: `${BASE}/capas/comidas.webp` });
  });

  it('downloads to the cache once, then reads it from there', async () => {
    const files = new Map<string, string>();
    const covers: CoverCache = {
      get: jest.fn(async (p) => files.get(p) ?? null),
      save: jest.fn(async (url, p) => {
        files.set(p, `file:///cache/${p}`);
        return files.get(p)!;
      }),
    };
    const lib = library({ covers });
    expect(await lib.cover({ capa: 'capas/comidas.webp' })).toEqual({ uri: 'file:///cache/capas/comidas.webp' });
    expect(await lib.cover({ capa: 'capas/comidas.webp' })).toEqual({ uri: 'file:///cache/capas/comidas.webp' });
    expect(covers.save).toHaveBeenCalledTimes(1);
    expect(covers.save).toHaveBeenCalledWith(`${BASE}/capas/comidas.webp`, 'capas/comidas.webp');
  });

  it('a failed download gives null (the app shows a colored card)', async () => {
    const covers: CoverCache = { get: async () => null, save: async () => Promise.reject(new Error('offline')) };
    expect(await library({ covers }).cover({ capa: 'capas/comidas.webp' })).toBeNull();
  });
});
