import { Directory, File, Paths } from 'expo-file-system';
import type { CoverCache } from './types';

/**
 * Covers kept in the app's cache folder (the system may clear it; they are
 * downloaded again). File name = `capa` path with "/" replaced, so a new cover
 * published under a new name never collides with the old one.
 */
export function createExpoCoverCache(folder = 'capas-baralhos'): CoverCache {
  const directory = new Directory(Paths.cache, folder);
  const fileFor = (path: string) => new File(directory, path.replace(/[^a-zA-Z0-9._-]/g, '_'));

  return {
    async get(path) {
      const file = fileFor(path);
      return file.exists ? file.uri : null;
    },
    async save(url, path) {
      if (!directory.exists) directory.create({ intermediates: true, idempotent: true });
      const file = fileFor(path);
      if (file.exists) return file.uri;
      const saved = await File.downloadFileAsync(url, file);
      return saved.uri;
    },
  };
}
