import type { DeckFile, DeckIndex, DeckLanguage, IndexCategory, IndexEntry } from './types';

/** Only format the apps understand. A newer one keeps what is stored. */
export const SUPPORTED_FORMAT = 1;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isVersion = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 1;
const PRICES = ['gratis', 'pago', 'avulso'] as const;

function entry(raw: unknown): IndexEntry | null {
  if (!isObject(raw)) return null;
  const { id, versao, titulo, descricao, capa, categorias, preco, faixa, itens, embutido } = raw;
  if (!isString(id) || !isVersion(versao) || !isString(titulo)) return null;
  if (faixa !== 'livre') return null; // only "livre" decks (studio rule)
  if (!PRICES.includes(preco as IndexEntry['preco'])) return null;
  return {
    id,
    versao,
    titulo,
    descricao: typeof descricao === 'string' ? descricao : '',
    capa: typeof capa === 'string' ? capa : '',
    categorias: Array.isArray(categorias) ? categorias.filter(isString) : [],
    preco: preco as IndexEntry['preco'],
    faixa: 'livre',
    itens: typeof itens === 'number' ? itens : 0,
    embutido: embutido === true,
  };
}

function category(raw: unknown): IndexCategory | null {
  if (!isObject(raw) || !isString(raw.id) || !isString(raw.nome)) return null;
  return { id: raw.id, nome: raw.nome };
}

/**
 * Returns a clean index, or null if the file is not usable for this game and
 * language (wrong game, wrong language, unknown format). Unknown fields are
 * dropped, invalid and non-"livre" entries are skipped.
 */
export function parseIndex(raw: unknown, game: string, language: DeckLanguage): DeckIndex | null {
  if (!isObject(raw) || raw.formato !== SUPPORTED_FORMAT) return null;
  if (raw.jogo !== game || raw.idioma !== language || !Array.isArray(raw.baralhos)) return null;
  const seen = new Set<string>();
  const baralhos: IndexEntry[] = [];
  for (const item of raw.baralhos) {
    const e = entry(item);
    if (e && !seen.has(e.id)) {
      seen.add(e.id);
      baralhos.push(e);
    }
  }
  const categorias = Array.isArray(raw.categorias)
    ? raw.categorias.map(category).filter((c): c is IndexCategory => c !== null)
    : [];
  return { formato: SUPPORTED_FORMAT, jogo: game, idioma: language, categorias, baralhos };
}

/** Returns a clean deck with only valid items, or null if it is not the expected deck or has no items. */
export function parseDeck<Item>(
  raw: unknown,
  id: string,
  isItem: (value: unknown) => value is Item,
): DeckFile<Item> | null {
  if (!isObject(raw) || raw.id !== id || !isVersion(raw.versao) || !Array.isArray(raw.itens)) return null;
  const itens = raw.itens.filter(isItem);
  if (itens.length === 0) return null;
  return { id, versao: raw.versao, itens };
}
