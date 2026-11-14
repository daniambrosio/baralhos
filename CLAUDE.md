# Baralhos

Conteúdo dos jogos de festa do estúdio: os baralhos do Impostor e da Mímica, as capas e a lista de jogos para venda cruzada. Não tem app nem servidor: são arquivos estáticos publicados num endereço fixo, que os apps baixam.

- Modelo completo dos arquivos: `docs/MODELO.md`
- Estilo das capas: `capas/README.md`
- Apps que leem este conteúdo: `~/projects/impostor` e `~/projects/mimica`

## Estrutura

```
capas/                 Imagens de capa, sem texto. Servem a todos os jogos e idiomas.
impostor/<idioma>/     indice.json + um arquivo por baralho.
mimica/<idioma>/       indice.json + um arquivo por baralho.
jogos.json             Lista dos jogos do estúdio, para o "nossos outros jogos".
ferramentas/           validar.py
```

Idiomas: `pt-BR`, `es`, `en`. Só `pt-BR` tem conteúdo por enquanto.

## Comandos

```bash
python3 ferramentas/validar.py   # confere índices, baralhos e capas
```

## Regras (não quebrar)

1. **Catálogos separados por jogo.** Um baralho do Impostor nunca é reaproveitado como arquivo na Mímica. O tema pode repetir; o arquivo não.
2. **Cada idioma é um baralho próprio**, escrito para aquele público. Não é tradução linha a linha.
3. **Capa sem texto.** O título vem do índice, no idioma do usuário. A mesma capa serve a todos os idiomas e jogos.
4. **Sem marcas de terceiros** em título, descrição, capa ou itens que dependam delas (filmes, séries e personagens com dono). Tema genérico pode: "filmes de terror", não o nome de uma franquia.
5. **Nunca mude o `id` de um baralho publicado.** Os apps guardam o que foi baixado e desbloqueado por `id`. Para mudar o conteúdo, aumente `versao`.
6. **`formato` só muda com quebra de compatibilidade.** Campo novo e opcional não muda o `formato`; os apps ignoram o que não conhecem.
7. **Validador passando antes de publicar.**
8. **Conteúdo adulto** leva `"faixa": "adulto"`. Os apps atuais só mostram `livre`; a faixa adulta é para uma versão 18+ futura, com outro nome.

## Estado

- Modelo definido e validador escrito.
- Um baralho de exemplo por jogo, com 12 itens cada, só para os apps terem o que ler.
- Duas capas de exemplo (`classicos`, `animais`), desenhadas à mão em SVG no estilo de contorno; o `.svg` fica ao lado do `.webp`.
- Publicado em `https://baralhos.odanigeek.co`; publicar de novo com `~/projects/vps-ops/scripts/deploy-baralhos.sh` (detalhes no fim do `docs/MODELO.md`).
- Faltam: os baralhos de verdade e suas capas, `es` e `en`.
