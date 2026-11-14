# Modelo dos baralhos

## Como os apps usam

1. Cada app traz alguns baralhos embutidos (`"embutido": true`), para funcionar sem internet na primeira abertura.
2. Ao abrir, o app baixa `<jogo>/<idioma>/indice.json`. Se não houver internet, usa o último índice guardado.
3. Para cada baralho do índice com `versao` maior que a guardada, o app baixa `<jogo>/<idioma>/<id>.json` quando o usuário escolhe o baralho (ou em segundo plano).
4. As capas são baixadas e guardadas em cache pelo caminho em `capa`.
5. O bloqueio dos baralhos pagos é feito no app. Os arquivos são públicos: o que se vende é a conveniência, não um segredo.

## Índice (`indice.json`)

```json
{
  "formato": 1,
  "jogo": "impostor",
  "idioma": "pt-BR",
  "categorias": [{ "id": "familia", "nome": "Família" }],
  "baralhos": [
    {
      "id": "classicos",
      "versao": 1,
      "titulo": "Clássicos",
      "descricao": "Uma ou duas frases dizendo o que tem dentro.",
      "capa": "capas/classicos.webp",
      "categorias": ["familia"],
      "preco": "gratis",
      "faixa": "livre",
      "itens": 60,
      "embutido": true,
      "relacionados": []
    }
  ]
}
```

| Campo | Regra |
|---|---|
| `categorias` (do índice) | O `id` é fixo e igual em todos os idiomas. O `nome` é escrito em cada idioma. |
| `id` | Minúsculas, sem acento, com hífen. Nunca muda depois de publicado. |
| `versao` | Inteiro. Aumenta a cada mudança no arquivo do baralho. |
| `descricao` | Aparece ao escolher o baralho e na tela de desbloquear. |
| `capa` | Caminho a partir da raiz deste repositório. |
| `preco` | `gratis`: aberto a todos. `pago`: abre com vídeo (até meia-noite), passe de 3 dias ou compra "para sempre". `avulso`: reservado para o Trunfo, com preço próprio por baralho; Impostor e Mímica não usam. |
| `faixa` | `livre` ou `adulto`. |
| `itens` | Quantidade de itens; tem que bater com o arquivo. |
| `embutido` | Opcional. O baralho vai dentro do app. |
| `relacionados` | Opcional, `id`s do mesmo índice. Para recomendação, no futuro. |

O preço é por jogo: o mesmo tema pode ser grátis num jogo e pago no outro, porque cada jogo tem o seu índice.

## Baralho do Impostor (`<id>.json`)

```json
{ "id": "classicos", "versao": 1, "itens": [{ "palavra": "praia", "parecida": "piscina" }] }
```

`parecida` é a dica que o impostor pode receber no lugar de não receber nada. O uso é um ajuste do app. A palavra parecida tem que ser da mesma família, mas diferente o bastante para o impostor se entregar se confiar demais nela.

## Baralho da Mímica (`<id>.json`)

```json
{ "id": "animais", "versao": 1, "itens": [{ "texto": "girafa" }] }
```

`texto` é o que aparece na tela: curto, legível de longe, de preferência até 3 palavras.

## Jogos do estúdio (`jogos.json`)

Lista usada pelo "nossos outros jogos" de cada app. O app esconde a si mesmo e os jogos sem link da loja preenchido.

## Publicação

Endereço fixo: `https://baralhos.odanigeek.co` (VPS, no ar desde 14/11/2026). Os caminhos são os mesmos deste repositório, por exemplo `https://baralhos.odanigeek.co/impostor/pt-BR/indice.json`. Esse endereço fica gravado nos apps e não pode mudar depois do lançamento sem redirecionamento.

Para publicar:

```bash
~/projects/vps-ops/scripts/deploy-baralhos.sh
```

O script roda o validador e para se ele falhar, envia só o que é público (`jogos.json`, os `.json` de `impostor/` e `mimica/`, e `capas/*.webp`) e remove do servidor o que saiu daqui. Ele publica a pasta como está, mesmo sem commit.

- Os `.json` ficam em cache por 5 minutos; as capas, por 24 horas. Para trocar uma capa com efeito imediato, publique com outro nome de arquivo.
- Tipo novo de arquivo público (por exemplo `.png`) ou pasta de um jogo novo exige ajustar o script e o servidor: ver `~/projects/vps-ops/projects/baralhos/playbook.md`.
