# Critérios de conteúdo

Vale para todo item, título e descrição, nos três idiomas. Quem escreve ou revisa um baralho (pessoa ou IA) lê este arquivo antes.

O validador (`ferramentas/validar.py`) trava o que consegue reconhecer por lista: `ferramentas/termos_vetados.json`. A lista é um piso. O critério é este documento, e a revisão de leitura no fim dele é obrigatória.

## Princípio

Os baralhos são jogados em família, com criança, avó e gente que acabou de se conhecer. **Na dúvida, o item sai.** Cada idioma tem palavra de sobra; nenhuma piada vale o risco de ofender alguém. Ofensa não é questão de intenção: se uma parte do público lê o termo como ofensa, ele não entra.

## O que não entra em nenhum baralho

1. **Racismo e estereótipo étnico ou regional.** Inclui expressão que parece inocente e carrega isso: "cabelo ruim", "ovelha negra", "programa de índio", "Irish goodbye", "trabajar como negro". Inclui também encenar povo ou cultura como fantasia: dança da chuva, pintura de guerra, boneco de vodu.
2. **Deboche de corpo, deficiência ou saúde mental.** Banguela, gago, anão, "retardado", apelido para gordo ou careca.
3. **Sexismo e LGBTfobia**, e papel fixo por gênero: a sogra, a vizinha fofoqueira, a loira burra. Em profissões, misturar masculino e feminino sem padrão (não pode ser "enfermera" e "azafata" de um lado, "médico" e "juez" do outro).
4. **Religião como piada.** Vale para qualquer religião viva, incluindo as de matriz africana e indígenas.
   - Festa e costume em volta da religião podem: procissão, missa do galo, Domingo de Ramos, sino, coral, presépio, menorá.
   - No Na Testa, ninguém encena sacramento, oração ou rito: rezar, sinal da cruz, ajoelhar, comungar, batizar, benzer, lava-pés, Santa Ceia, via-sacra, oferenda, exorcismo.
   - No Impostor, palavra sagrada só leva dica da mesma família e do mesmo respeito ("Reis Magos / pastores"), nunca dica-piada ("Reis Magos / três porquinhos", "água benta / água de coco").
   - Tradição de bater ou queimar boneco (malhação do Judas) não entra.
5. **Palavrão e xingamento**, mesmo leve.
6. **Violência real grave**: suicídio, estupro, sequestro, escravidão, massacre. O Terror fica no clichê de filme (vampiro, zumbi, motosserra, casa mal-assombrada).

## O que não entra em baralho `livre`

Hoje todos são `livre`. Isso também pesa na classificação etária das lojas.

- **Álcool**: bebida, bar, bebedeira, ressaca, jogo de beber. Brinde e festa podem; a bebida, não.
- **Fumo e droga.**
- **Sexo e sensualidade**: dança ou programa de apelo sexual ("dança da garrafa", "Banheira do Gugu"), nudez, roupa íntima como graça, paquera adulta.

## Nomes próprios e famosos

- Marca, personagem ou pessoa real pode ser item solto; não pode ser título, capa, nem o tema do baralho inteiro (regra 4 do `CLAUDE.md`).
- **Famoso vivo pode aparecer no baralho e ser citado na descrição como exemplo do que tem dentro** (decisão do Daniel, 19/11/2026). O nome não está vendendo o produto: é só uma das cartas do baralho vendido. O que não pode é a pessoa virar título, capa ou promessa ("o baralho da Taylor Swift").
- O item sobre uma pessoa real é a pessoa em si, pelo que ela é conhecida. Nunca uma parte do corpo, um escândalo ou um apelido depreciativo ("caderas de Shakira" não entra).
- Grafia oficial do nome: "Silvio Santos", sem acento.

## Qualidade do item

**Impostor (`palavra` / `parecida`)**
- A dica é da mesma família da palavra e diferente o bastante para o impostor se entregar. Nem sinônimo ("monaguillo / acólito"), nem coisa sem relação ("volcán / montaña rusa").
- A dica não contém a palavra, nem o contrário ("golfe / minigolfe", "plancha / plancha de pelo"). O validador trava.
- Sem dicas em círculo (A dá B, B dá C, C dá A). O validador trava.

**Na Testa (`texto`)**
- Cada item precisa de um gesto que o separe dos outros do mesmo baralho. "Sabiá", "pardal" e "canário" juntos não funcionam.
- Alvo de até 3 palavras, teto de 4. **Nunca cortar artigo ou preposição para caber**: "lechuga en los dientes", não "lechuga en dientes"; "throw in the towel", não "throw the towel". Se não cabe em 4, troque o item.
- Expressão idiomática entra inteira e na forma certa, ou não entra.
- O item tem que se entender sozinho, sem o contexto do vizinho ("fazer a árvore" só fazia sentido ao lado de "teatrinho").

**Nos dois**
- O item pertence ao tema do baralho na cultura daquele idioma (dança do dragão não é carnaval).
- Uma grafia só por palavra em cada idioma; as escolhidas estão em `grafia`, no `termos_vetados.json`.
- Nome de festa e de personagem com maiúscula: Natal, Páscoa, Papai Noel, Navidad, Easter.
- Espanhol é latino-americano neutro: evitar palavra que só um país usa quando existe uma comum, e não usar forma da Espanha.

## Revisão antes de publicar

O validador não lê contexto. Antes de publicar um baralho novo ou alterado:

1. `python3 ferramentas/validar.py` sem erro.
2. Ler **todos** os itens do baralho, um a um, contra as listas acima. Para cada item, perguntar: alguém de outra cor, religião, região, corpo, gênero ou idade poderia se sentir o alvo? Uma criança de 8 anos pode ler isso em voz alta? Se a resposta for "talvez", troque.
3. Ler o baralho no idioma como falante dali, não como tradução: expressão, gíria e referência têm que existir naquele público.
4. Termo ruim que passou pelo validador: corrigir o baralho e acrescentar o termo ao `termos_vetados.json` no mesmo commit.
5. Todo arquivo de baralho alterado sobe a `versao`, no arquivo e no índice.
