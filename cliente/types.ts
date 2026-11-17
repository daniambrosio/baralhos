/**
 * Deck download, shared by the studio's games (Na Testa, Impostor).
 * Model: ~/projects/baralhos/docs/MODELO.md. Field names follow the files.
 */

export type DeckLanguage = 'pt-BR' | 'es' | 'en';

export interface IndexCategory {
  id: string;
  nome: string;
}

export interface IndexEntry {
  id: string;
  versao: number;
  titulo: string;
  descricao: string;
  /** Path from the repository root, e.g. "capas/animais.webp". */
  capa: string;
  categorias: string[];
  preco: 'gratis' | 'pago' | 'avulso';
  faixa: 'livre';
  itens: number;
  embutido: boolean;
}

export interface DeckIndex {
  formato: 1;
  jogo: string;
  idioma: DeckLanguage;
  categorias: IndexCategory[];
  baralhos: IndexEntry[];
}

export interface DeckFile<Item> {
  id: string;
  versao: number;
  itens: Item[];
}

/** Same shape as AsyncStorage, so it can be passed as is. */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

/** Local copies of downloaded covers. `path` is the index's `capa`. */
export interface CoverCache {
  /** Local URI of the cached file, or null. */
  get(path: string): Promise<string | null>;
  /** Downloads `url` and returns the local URI. */
  save(url: string, path: string): Promise<string>;
}

/** What an <Image source> takes: a bundled asset or a URI. */
export type CoverSource = number | { uri: string };

/** Files shipped inside the app for one language. Values are the parsed JSON. */
export interface EmbeddedLanguage {
  index: unknown;
  decks: Record<string, unknown>;
  /** Bundled covers by `capa` path, e.g. { "capas/animais.webp": require(...) }. */
  covers?: Record<string, number>;
}

export interface DeckLibraryConfig<Item> {
  /** Folder of the game in the repository: "mimica", "impostor". */
  game: string;
  /** e.g. "https://baralhos.odanigeek.co" (no trailing slash needed). */
  baseUrl: string;
  language: DeckLanguage;
  embedded: Partial<Record<DeckLanguage, EmbeddedLanguage>>;
  storage: KeyValueStore;
  /** Checks one item of a deck file; invalid items are dropped. */
  isItem: (value: unknown) => value is Item;
  fetch?: typeof fetch;
  covers?: CoverCache;
  /** Network timeout per request, in ms. */
  timeoutMs?: number;
}
