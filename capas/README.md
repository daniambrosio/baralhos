# Capas

Uma imagem por tema, usada pelos dois jogos e por todos os idiomas.

## Estilo: contorno de adesivo

Escolhido em 14/11/2026. Exemplos nos protótipos em `~/projects/impostor/docs/prototipo` (`ImagensContorno.dc.html`) e `~/projects/mimica/docs/prototipo`.

- **Um objeto só**, grande e centralizado, que resuma o tema (coroa, hambúrguer, fita cassete, capacete).
- **Contorno escuro grosso** (`#14111F`), com cantos e pontas arredondados. Espessura constante.
- **Cores cheias**, sem degradê, sem sombra suave, sem textura.
- **Fundo de uma cor só**, da paleta do estúdio: menta `#3DDBA8`, amarelo `#FFD23F`, rosa `#FF8FC7`, azul `#5CB8FF`, lilás `#B79CFF`, coral `#FF5C3A`. O objeto não pode ter a cor do fundo.
- **Um ou dois detalhes soltos** no fundo (brilhos em cruz), no mesmo traço.
- **Sem texto, sem letras, sem números.** O título vem do app.
- **Sem marcas, logotipos ou personagens de terceiros.**

A mesma capa serve ao tema claro e ao escuro, porque tem fundo próprio.

## Arquivo

- Proporção 4:3, 800 × 600 px, `.webp`.
- Nome igual ao tema, minúsculo, sem acento: `classicos.webp`, `anos-90.webp`.
- O objeto fica dentro de uma margem de 15% em cada lado: o app corta as bordas conforme o tamanho do cartão.

## Estado

Prontas: `classicos`, `animais`, `fim-de-ano`, `comidas`, `lugares`, `profissoes`, `esportes`, `acoes`. Para gerar o `.webp` a partir do `.svg`: `ferramentas/capa.sh <nome>` (usa o Chrome sem janela e o `cwebp`).
