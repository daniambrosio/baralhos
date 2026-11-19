#!/usr/bin/env python3
"""Valida todos os índices e baralhos. Uso: python3 ferramentas/validar.py"""
import json, re, sys, unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CAMPOS = {"impostor": ("palavra", "parecida"), "mimica": ("texto",)}
PRECOS = {"gratis", "pago", "avulso"}
FAIXAS = {"livre", "adulto"}
erros = []
avisos = []

def sem_acento(texto):
    # O ñ é letra própria no espanhol (año ≠ ano); os outros acentos são ignorados.
    t = unicodedata.normalize("NFD", str(texto).strip().lower().replace("ñ", "\0"))
    return "".join(c for c in t if unicodedata.category(c) != "Mn").replace("\0", "ñ")

def fichas(texto):
    """Palavras do texto, sem acento e sem pontuação: 'Pé-de-moleque!' vira ['pe', 'de', 'moleque']."""
    return re.findall(r"[a-z0-9ñ]+", sem_acento(texto))

def contem(maior, menor):
    """A sequência de palavras `menor` aparece inteira, na ordem, dentro de `maior`?"""
    n = len(menor)
    return n > 0 and any(maior[i:i + n] == menor for i in range(len(maior) - n + 1))

TERMOS = json.loads((RAIZ / "ferramentas" / "termos_vetados.json").read_text(encoding="utf-8"))

def vetados(idioma, faixa, jogo):
    """Lista de (categoria, palavras do termo) que valem para este idioma, faixa e jogo."""
    blocos = [TERMOS["sempre"]]
    if faixa != "adulto":
        blocos.append(TERMOS["livre"])
    if jogo == "mimica":
        blocos.append(TERMOS["so_mimica"])
    saida = []
    for bloco in blocos:
        for chave in ("todos", idioma):
            for categoria, termos in bloco.get(chave, {}).items():
                saida += [(categoria, fichas(t), t) for t in termos]
    return saida

def conferir_texto(onde, texto, idioma, lista):
    """Erros de conteúdo que valem para qualquer texto que o usuário lê: item, título e descrição."""
    palavras = fichas(texto)
    for categoria, termo, original in lista:
        if contem(palavras, termo):
            erro(onde, f"termo vetado ({categoria}): '{original}' em '{texto}'")
    baixo = str(texto).lower()
    for errada, certa in TERMOS["grafia"].get(idioma, {}).items():
        if re.search(rf"(?<!\w){re.escape(errada)}(?!\w)", baixo):
            erro(onde, f"grafia fora do padrão: '{errada}' em '{texto}'. Use '{certa}'")
    for nome in TERMOS["maiusculas"].get(idioma, []):
        if re.search(rf"(?<!\w){re.escape(nome)}(?!\w)", str(texto)):
            erro(onde, f"'{nome}' se escreve com inicial maiúscula: '{texto}'")
    if texto != str(texto).strip() or "  " in str(texto):
        erro(onde, f"espaço sobrando em '{texto}'")

def dica_entrega(palavra, parecida):
    """A dica do impostor contém a palavra (ou o contrário): 'golfe' e 'minigolfe', 'plancha' e 'plancha de pelo'."""
    a, b = fichas(palavra), fichas(parecida)
    if contem(a, b) or contem(b, a):
        return True
    if len(a) == 1 and len(b) == 1:
        curto, longo = sorted((a[0], b[0]), key=len)
        return len(curto) >= 4 and longo.endswith(curto)
    return False

def erro(onde, msg):
    erros.append(f"{onde}: {msg}")

def aviso(onde, msg):
    avisos.append(f"{onde}: {msg}")

for jogo, campos in CAMPOS.items():
    for indice in sorted((RAIZ / jogo).glob("*/indice.json")):
        pasta = indice.parent
        dados = json.loads(indice.read_text(encoding="utf-8"))
        if dados.get("jogo") != jogo or dados.get("idioma") != pasta.name:
            erro(indice, "jogo ou idioma não bate com a pasta")
        idioma = pasta.name
        for c in dados.get("categorias", []):
            conferir_texto(indice, c.get("nome", ""), idioma, vetados(idioma, "livre", jogo))
        cats = {c.get("id") for c in dados.get("categorias", [])}
        ids = set()
        for b in dados.get("baralhos", []):
            onde = f"{indice} [{b.get('id')}]"
            if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", str(b.get("id", ""))):
                erro(onde, "id ausente ou fora do formato (minúsculas, números e hífen)")
                continue
            if not isinstance(b.get("versao"), int):
                erro(onde, "versao tem que ser um número inteiro")
            if b.get("preco") == "avulso":
                erro(onde, "preco avulso é reservado para o Trunfo")
            if b.get("embutido") and b.get("preco") != "gratis":
                erro(onde, "baralho embutido tem que ser grátis")
            if b["id"] in ids:
                erro(onde, "id repetido")
            ids.add(b["id"])
            for campo in ("titulo", "descricao", "capa"):
                if not b.get(campo):
                    erro(onde, f"falta {campo}")
            if b.get("preco") not in PRECOS:
                erro(onde, "preco inválido")
            if b.get("faixa") not in FAIXAS:
                erro(onde, "faixa inválida")
            if set(b.get("categorias", [])) - cats:
                erro(onde, "categoria que não existe neste índice")
            if b.get("capa") and not (RAIZ / b["capa"]).exists():
                erro(onde, f"capa não encontrada: {b['capa']}")
            lista = vetados(idioma, b.get("faixa"), jogo)
            # Título e descrição não são encenados: o so_mimica não vale para eles.
            lista_vitrine = vetados(idioma, b.get("faixa"), "vitrine")
            for campo in ("titulo", "descricao"):
                conferir_texto(onde, b.get(campo, ""), idioma, lista_vitrine)
            arq = pasta / f"{b['id']}.json"
            if not arq.exists():
                erro(onde, "arquivo do baralho não encontrado")
                continue
            baralho = json.loads(arq.read_text(encoding="utf-8"))
            itens = baralho.get("itens", [])
            if baralho.get("id") != b["id"] or baralho.get("versao") != b.get("versao"):
                erro(arq, "id ou versao diferente do índice")
            if len(itens) != b.get("itens"):
                erro(arq, f"índice diz {b.get('itens')} itens, arquivo tem {len(itens)}")
            vistos = set()
            for i, item in enumerate(itens):
                for campo in campos:
                    if not str(item.get(campo, "")).strip():
                        erro(arq, f"item {i}: falta {campo}")
                chave = sem_acento(item.get(campos[0], ""))
                if jogo == "impostor" and chave == sem_acento(item.get("parecida", "")):
                    erro(arq, f"item {i}: parecida igual à palavra")
                if chave in vistos:
                    erro(arq, f"item repetido: {chave}")
                vistos.add(chave)
                for campo in campos:
                    conferir_texto(arq, item.get(campo, ""), idioma, lista)
                if jogo == "impostor" and dica_entrega(item.get("palavra", ""), item.get("parecida", "")):
                    erro(arq, f"a dica entrega a palavra: {item.get('palavra')} / {item.get('parecida')}")
            if jogo == "impostor":
                # Dicas em círculo (A → B → C → A): o impostor recebe uma palavra tão próxima que nunca se entrega.
                seta = {sem_acento(i.get("palavra", "")): sem_acento(i.get("parecida", "")) for i in itens}
                em_ciclo = set()
                for inicio in seta:
                    caminho, atual = [], inicio
                    while atual in seta and atual not in caminho:
                        caminho.append(atual)
                        atual = seta[atual]
                    if atual == inicio and inicio not in em_ciclo:
                        em_ciclo.update(caminho)
                        erro(arq, "dicas em círculo: " + " → ".join(caminho + [inicio]))
        for b in dados.get("baralhos", []):
            if set(b.get("relacionados", [])) - ids:
                erro(f"{indice} [{b.get('id')}]", "relacionado que não existe")
        for solto in pasta.glob("*.json"):
            if solto.name != "indice.json" and solto.stem not in ids:
                erro(solto, "arquivo de baralho que não está no índice")

        # Avisos: não impedem a publicação, mas pedem uma olhada.
        onde_item = {}
        for b in dados.get("baralhos", []):
            arq = pasta / f"{b.get('id')}.json"
            if not arq.exists():
                continue
            for item in json.loads(arq.read_text(encoding="utf-8")).get("itens", []):
                texto = str(item.get(campos[0], ""))
                onde_item.setdefault(sem_acento(texto), []).append(b["id"])
                # Até 3 palavras é o alvo, 4 é o teto. Cortar artigo ou preposição para caber é pior do que passar de 3.
                if jogo == "mimica" and (len(texto.split()) > 4 or len(texto) > 26):
                    aviso(arq, f"longo demais para ler de longe: {texto}")
        # Só o Impostor junta vários baralhos numa partida; no Na Testa repetir não atrapalha.
        for chave, baralhos in sorted(onde_item.items()):
            if jogo == "impostor" and len(baralhos) > 1:
                aviso(pasta, f"'{chave}' aparece em mais de um baralho: {', '.join(baralhos)}")

json.loads((RAIZ / "jogos.json").read_text(encoding="utf-8"))
if avisos:
    print("Avisos:\n" + "\n".join(avisos))
if erros:
    print("Erros:\n" + "\n".join(erros))
    sys.exit(1)
print("Tudo certo." if not avisos else "Sem erros.")
