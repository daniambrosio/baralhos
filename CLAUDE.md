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
ferramentas/           validar.py, capa.sh, formatar_indice.py
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
4. **Sem marcas de terceiros em título, descrição e capa.** O baralho se chama "Terror", não leva o nome de uma franquia. Dentro dos itens pode: um nome próprio solto (um personagem, um console, uma banda) é só uma palavra do jogo. O que não pode é um baralho inteiro de uma franquia só.
5. **Nunca mude o `id` de um baralho publicado.** Os apps guardam o que foi baixado e desbloqueado por `id`. Para mudar o conteúdo, aumente `versao`.
6. **`formato` só muda com quebra de compatibilidade.** Campo novo e opcional não muda o `formato`; os apps ignoram o que não conhecem.
7. **Validador passando antes de publicar.**
8. **Conteúdo adulto** leva `"faixa": "adulto"`. Os apps atuais só mostram `livre`; a faixa adulta é para uma versão 18+ futura, com outro nome.

## Estado

- Modelo definido e validador escrito.
- PT-BR completo para o lançamento: 4 grátis e 12 pagos em cada jogo. Impostor: Clássicos, Comidas, Lugares, Animais (grátis); Natal e Ano-Novo, Carnaval, Anos 90, Terror, Brasil Raiz, Escola, Rolê, Coisas de Casa, Tecnologia, Difícil, Profissões, Esportes. Na Testa: Animais, Profissões, Esportes, Ações do dia a dia (grátis); Natal e Ano-Novo, Carnaval, Anos 90, Terror, Brasil Raiz, Escola, Rolê, Comidas, Emoções e Situações, Danças e Ritmos, Expressões, Animais Difíceis.
- Capas desenhadas à mão em SVG no estilo de contorno; o `.svg` fica ao lado do `.webp`. Gerar o `.webp` com `ferramentas/capa.sh <nome>`.
- `ferramentas/formatar_indice.py` reescreve um índice no formato da casa depois de editado por script.
- Publicado em `https://baralhos.odanigeek.co`; publicar de novo com `~/projects/vps-ops/scripts/deploy-baralhos.sh` (detalhes no fim do `docs/MODELO.md`).
- Faltam: `es` e `en`, e copiar os baralhos grátis para dentro dos apps.
