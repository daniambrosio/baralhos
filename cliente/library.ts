import type { CoverSource, DeckFile, DeckIndex, DeckLibraryConfig, IndexEntry } from './types';
import { parseDeck, parseIndex } from './validate';

export interface DeckLibrary<Item> {
  readonly language: DeckLibraryConfig<Item>['language'];
  /** Without network: last stored index, else the embedded one, else an empty index. */
  cachedIndex(): Promise<DeckIndex>;
  /** Downloads and stores the index; on any failure returns cachedIndex(). */
  refreshIndex(): Promise<DeckIndex>;
  /**
   * Best copy of a deck. Downloads it when the index has a newer `versao` than
   * the stored or embedded copy; the stored copy only changes after the new
   * file is validated. Null when there is no usable copy at all.
   */
  deck(id: string): Promise<DeckFile<Item> | null>;
  /** Bundled cover, cached cover, or downloads it to the cache. Null if none can be shown. */
  cover(entry: Pick<IndexEntry, 'capa'>): Promise<CoverSource | null>;
}

const DEFAULT_TIMEOUT_MS = 8000;

export function createDeckLibrary<Item>(config: DeckLibraryConfig<Item>): DeckLibrary<Item> {
  const { game, language, storage, isItem } = config;
  const base = config.baseUrl.replace(/\/+$/, '');
  // Looked up on each call, so a fetch installed later (tests, polyfills) is the one used.
  const doFetch: typeof fetch = config.fetch ?? ((input, init) => fetch(input, init));
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const embedded = config.embedded[language];
  const prefix = `baralhos:${game}:${language}`;
  const indexKey = `${prefix}:indice`;
  const deckKey = (id: string) => `${prefix}:baralho:${id}`;

  /** Most recent index seen in this session, used to know which deck version is current. */
  let latest: DeckIndex | null = null;
  const inFlight = new Map<string, Promise<DeckFile<Item> | null>>();

  async function getJson(url: string): Promise<unknown> {
    const controller = typeof AbortController === 'undefined' ? null : new AbortController();
    const timer = setTimeout(() => controller?.abort(), timeoutMs);
    try {
      const response = await doFetch(url, controller ? { signal: controller.signal } : undefined);
      if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function readStored(key: string): Promise<unknown> {
    try {
      const text = await storage.getItem(key);
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }

  async function write(key: string, value: unknown): Promise<void> {
    try {
      await storage.setItem(key, JSON.stringify(value));
    } catch {
      // A full or broken storage must not break the game: the copy in memory is still used.
    }
  }

  const emptyIndex = (): DeckIndex => ({ formato: 1, jogo: game, idioma: language, categorias: [], baralhos: [] });

  async function cachedIndex(): Promise<DeckIndex> {
    const index =
      parseIndex(await readStored(indexKey), game, language) ??
      parseIndex(embedded?.index, game, language) ??
      emptyIndex();
    latest ??= index;
    return index;
  }

  async function refreshIndex(): Promise<DeckIndex> {
    try {
      const index = parseIndex(await getJson(`${base}/${game}/${language}/indice.json`), game, language);
      if (index) {
        await write(indexKey, index);
        latest = index;
        return index;
      }
    } catch {
      // No internet, timeout or bad file: fall through to what we have.
    }
    return cachedIndex();
  }

  async function localDeck(id: string): Promise<DeckFile<Item> | null> {
    const stored = parseDeck(await readStored(deckKey(id)), id, isItem);
    const bundled = parseDeck(embedded?.decks[id], id, isItem);
    if (stored && bundled) return stored.versao >= bundled.versao ? stored : bundled;
    return stored ?? bundled;
  }

  async function loadDeck(id: string): Promise<DeckFile<Item> | null> {
    const local = await localDeck(id);
    const entry = (latest ?? (await cachedIndex())).baralhos.find((d) => d.id === id);
    if (!entry || (local && local.versao >= entry.versao)) return local;
    try {
      const fresh = parseDeck(await getJson(`${base}/${game}/${language}/${id}.json`), id, isItem);
      if (fresh && (!local || fresh.versao > local.versao)) {
        await write(deckKey(id), fresh);
        return fresh;
      }
    } catch {
      // Keep the local copy.
    }
    return local;
  }

  function deck(id: string): Promise<DeckFile<Item> | null> {
    const running = inFlight.get(id);
    if (running) return running;
    const task = loadDeck(id).finally(() => inFlight.delete(id));
    inFlight.set(id, task);
    return task;
  }

  async function cover({ capa }: Pick<IndexEntry, 'capa'>): Promise<CoverSource | null> {
    if (!capa) return null;
    const bundled = embedded?.covers?.[capa];
    if (bundled !== undefined) return bundled;
    const url = `${base}/${capa.replace(/^\/+/, '')}`;
    if (!config.covers) return { uri: url };
    try {
      const local = await config.covers.get(capa);
      if (local) return { uri: local };
      return { uri: await config.covers.save(url, capa) };
    } catch {
      return null;
    }
  }

  return { language, cachedIndex, refreshIndex, deck, cover };
}
