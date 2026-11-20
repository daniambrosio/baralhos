# Baralhos

Conteúdo dos jogos de festa do estúdio: os baralhos do Impostor e da Mímica, as capas e a lista de jogos para venda cruzada. Não tem app nem servidor: são arquivos estáticos publicados num endereço fixo, que os apps baixam. Também guarda o `cliente/`, o pacote que os apps usam para baixar esses arquivos.

- Modelo completo dos arquivos: `docs/MODELO.md`
- Critérios de conteúdo (o que não entra, qualidade do item, revisão): `docs/CONTEUDO.md`. **Leia antes de escrever ou revisar qualquer baralho.**
- Estilo das capas: `capas/README.md`
- Apps que leem este conteúdo: `~/projects/impostor` e `~/projects/mimica`

## Estrutura

```
capas/                 Imagens de capa, sem texto. Servem a todos os jogos e idiomas.
impostor/<idioma>/     indice.json + um arquivo por baralho.
mimica/<idioma>/       indice.json + um arquivo por baralho.
jogos.json             Lista dos jogos do estúdio, para o "nossos outros jogos".
ferramentas/           validar.py, termos_vetados.json, capa.sh, formatar_indice.py
cliente/               Pacote de download usado pelos apps (TypeScript, com testes). Ver cliente/README.md.
```

Idiomas: `pt-BR`, `es` (espanhol latino-americano neutro), `en` (inglês americano). Os três têm os mesmos baralhos, com os mesmos `id`s e capas, menos os que só fazem sentido num público (hoje só `festa-junina`, só em pt-BR).

## Comandos

```bash
python3 ferramentas/validar.py   # confere índices, baralhos, capas e conteúdo vetado
npm test && npm run typecheck    # testes e tipos do cliente/
```

O `cliente/` é a única cópia do código de download (decisão do Daniel, 17/11/2026). Os apps instalam `github:daniambrosio/baralhos#vX.Y.Z`; mudança no `cliente/` vira tag nova e cada app sobe a versão no seu `package.json`. O repositório é público para o build na nuvem da Expo conseguir instalar.

## Regras (não quebrar)

1. **Catálogos separados por jogo.** Um baralho do Impostor nunca é reaproveitado como arquivo na Mímica. O tema pode repetir; o arquivo não.
2. **Cada idioma é um baralho próprio**, escrito para aquele público. Não é tradução linha a linha.
3. **Capa sem texto.** O título vem do índice, no idioma do usuário. A mesma capa serve a todos os idiomas e jogos.
4. **Sem marcas de terceiros em título e capa.** O baralho se chama "Terror", não leva o nome de uma franquia. Dentro dos itens pode: um nome próprio solto (um personagem, um console, uma banda) é só uma palavra do jogo. A descrição pode citar esses itens como exemplo (Tamagotchi, Chucky, Lego). O que não pode é um baralho inteiro de uma franquia só.
5. **Nunca mude o `id` de um baralho publicado.** Os apps guardam o que foi baixado e desbloqueado por `id`. Para mudar o conteúdo, aumente `versao`.
6. **`formato` só muda com quebra de compatibilidade.** Campo novo e opcional não muda o `formato`; os apps ignoram o que não conhecem.
7. **Validador passando antes de publicar**, e a revisão de leitura do `docs/CONTEUDO.md` feita em todo baralho novo ou alterado. O validador não lê contexto; passar nele não basta.
8. **Conteúdo adulto** leva `"faixa": "adulto"`. Os apps atuais só mostram `livre`; a faixa adulta é para uma versão 18+ futura, com outro nome. Baralho `livre` não tem álcool, fumo, droga nem apelo sexual.
9. **Nada que ofenda.** Racismo, estereótipo étnico ou regional, deboche de corpo ou deficiência, sexismo, LGBTfobia, religião como piada e palavrão não entram em nenhum baralho, de nenhuma faixa. Na dúvida, o item sai: há palavra de sobra em cada idioma. Detalhes e exemplos no `docs/CONTEUDO.md`.
10. **Termo ruim encontrado vira regra.** Corrija o baralho e acrescente o termo ao `ferramentas/termos_vetados.json` no mesmo commit, para ele não voltar.
11. **Famoso vivo pode ser item e exemplo na descrição** (decisão do Daniel, 19/11/2026): o nome é uma carta do baralho, não o que vende o produto. Não pode virar título, capa nem tema do baralho inteiro, e o item é a pessoa, nunca uma parte do corpo ou um escândalo.

## Estado

- Modelo definido e validador escrito.
- PT-BR completo para o lançamento: 4 grátis e 12 pagos em cada jogo. Impostor: Clássicos, Comidas, Lugares, Animais (grátis); Natal e Ano-Novo, Carnaval, Anos 90, Terror, Brasil Raiz, Escola, Rolê, Coisas de Casa, Tecnologia, Difícil, Profissões, Esportes. Na Testa: Animais, Profissões, Esportes, Ações do dia a dia (grátis); Natal e Ano-Novo, Carnaval, Anos 90, Terror, Brasil Raiz, Escola, Rolê, Comidas, Emoções e Situações, Danças e Ritmos, Expressões, Animais Difíceis.
- Capas desenhadas à mão em SVG no estilo de contorno; o `.svg` fica ao lado do `.webp`. Gerar o `.webp` com `ferramentas/capa.sh <nome>`.
- `ferramentas/formatar_indice.py` reescreve um índice no formato da casa depois de editado por script.
- Publicado em `https://baralhos.odanigeek.co`; publicar de novo com `~/projects/vps-ops/scripts/deploy-baralhos.sh` (detalhes no fim do `docs/MODELO.md`).
- `es` e `en` escritos para o próprio público, não traduzidos: "Brasil Raiz" vira "De Nuestra Tierra" (tradições latino-americanas) e "Americana"; Anos 90, Natal, Carnaval e Expressões seguem a cultura de cada idioma. A categoria `brasil` se chama "Lo Nuestro" e "Hometown".
- Segundo lote (18/11/2026): Infantil (grátis, nos dois jogos, sem embutir), Páscoa (pago, nos dois jogos; em es "Semana Santa y Pascua"), Famosos (pago, só Na Testa) e Festa Junina (pago, nos dois jogos, só pt-BR). Impostor fica com 5 grátis e 13 pagos (14 em pt-BR); Na Testa com 5 grátis e 14 pagos (15 em pt-BR).
- Revisão de conteúdo (19/11/2026): os 115 baralhos foram lidos nos três idiomas; 64 subiram de versão. Saíram um termo racista ("cabelo ruim"), álcool e apelo sexual em baralho `livre`, ritos religiosos encenados e dicas-piada com o sagrado, estereótipos e erros de grafia. O validador passou a travar termo vetado, dica que entrega a palavra, dicas em círculo, grafia fora do padrão e nome próprio em minúscula. Publicado em 19/11/2026.
- Download nos apps: feito pelo `cliente/` deste repositório (índice ao abrir, `versao`, baralhos e capas em cache, idioma do aparelho), com cópias embutidas dos grátis só como reserva sem internet. Cada app atualiza essas cópias a partir do endereço publicado em todo build (`scripts/sincronizar-baralhos.mjs` de cada app, desde 19/11/2026); não se copia mais à mão.
