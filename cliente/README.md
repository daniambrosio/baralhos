# cliente: download de baralhos

Pacote usado pelos jogos do estúdio (Lorota/Impostor e Na Testa/Mímica). Mora aqui, ao lado do conteúdo que ele lê, e os apps instalam direto do GitHub numa versão marcada:

```bash
npm install github:daniambrosio/baralhos#v1.0.0
```

Não importa nada dos apps. Modelo dos arquivos em `../docs/MODELO.md`.

## Corrigir ou evoluir

De qualquer projeto: editar aqui em `~/projects/baralhos/cliente/`, rodar `npm test` e `npm run typecheck` na raiz deste repositório, subir `version` no `package.json`, commitar, marcar a tag (`git tag v1.0.1 && git push --tags`) e, em cada app, `npm install github:daniambrosio/baralhos#v1.0.1`. Cada app sobe de versão quando quiser; nunca editar o pacote dentro de `node_modules`.

## Arquivos

- `types.ts`: tipos do índice, do baralho e das portas (armazenamento, cache de capas).
- `validate.ts`: `parseIndex` e `parseDeck`. Ignoram campos desconhecidos, ficam só com `faixa: "livre"` e recusam `formato` diferente de 1.
- `items.ts`: formato do item de cada jogo (`isMimicaItem` para `{ texto }`, `isImpostorItem` para `{ palavra, parecida? }`).
- `language.ts`: `deckLanguage(locale)` (pt → pt-BR, es → es, o resto → en) e `deviceLocale()`.
- `library.ts`: `createDeckLibrary`, o que o app usa.
- `expoCoverCache.ts`: cache das capas em disco com `expo-file-system` (fora do `index.ts` para os testes não carregarem módulo nativo).
- `__tests__/library.test.ts`: testes com servidor e armazenamento falsos.

Dependências: `expo-file-system` (só o cache de capas). O armazenamento é passado pelo app (`AsyncStorage` serve como está).

## Uso

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDeckLibrary, deckLanguage, deviceLocale, isImpostorItem } from 'baralhos';
import { createExpoCoverCache } from 'baralhos/cliente/expoCoverCache';

const library = createDeckLibrary({
  game: 'impostor',                         // pasta do jogo no repositório
  baseUrl: 'https://baralhos.odanigeek.co',
  language: deckLanguage(deviceLocale()),
  embedded: {
    'pt-BR': {
      index: require('../assets/baralhos/impostor/pt-BR/indice.json'),
      decks: { classicos: require('../assets/baralhos/impostor/pt-BR/classicos.json') },
      covers: { 'capas/classicos.webp': require('../assets/baralhos/impostor/capas/classicos.webp') },
    },
    // es, en...
  },
  storage: AsyncStorage,
  isItem: isImpostorItem,
  covers: createExpoCoverCache(),
});

await library.cachedIndex();   // sem rede: último guardado, senão o embutido
await library.refreshIndex();  // baixa e guarda; falhou, devolve o guardado
await library.deck('classicos'); // baixa se o índice tem versao maior; null se não há cópia
await library.cover(entry);    // capa embutida, do cache, ou baixa para o cache; null se falhar
```

## Regras

- Endereços: `<base>/<jogo>/<idioma>/indice.json`, `<base>/<jogo>/<idioma>/<id>.json`, capa em `<base>/<capa>`.
- Guardado no armazenamento em `baralhos:<jogo>:<idioma>:indice` e `baralhos:<jogo>:<idioma>:baralho:<id>`.
- Um baralho só é trocado depois que o arquivo novo é validado (mesmo `id`, `versao` maior, ao menos um item válido).
- Baralho embutido com versão maior que a guardada (app atualizado) vence.
- Sem rede, tempo esgotado (8 s) ou arquivo ruim: fica com o que tem, nunca lança erro.
- O que mostrar (grátis, pago, desbloqueado) é decisão do app, não do módulo.
