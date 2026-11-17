/** Item formats of each game (MODELO.md). Each game passes its checker to createDeckLibrary. */

export interface MimicaItem {
  texto: string;
}

export interface ImpostorItem {
  palavra: string;
  parecida?: string;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const filled = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export function isMimicaItem(value: unknown): value is MimicaItem {
  return isObject(value) && filled(value.texto);
}

export function isImpostorItem(value: unknown): value is ImpostorItem {
  return isObject(value) && filled(value.palavra) && (value.parecida === undefined || filled(value.parecida));
}
