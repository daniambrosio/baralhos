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
    t = unicodedata.normalize("NFD", str(texto).strip().lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")

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
                if jogo == "mimica" and len(texto.split()) > 3:
                    aviso(arq, f"mais de 3 palavras: {texto}")
        for chave, baralhos in sorted(onde_item.items()):
            if len(baralhos) > 1:
                aviso(pasta, f"'{chave}' aparece em mais de um baralho: {', '.join(baralhos)}")

json.loads((RAIZ / "jogos.json").read_text(encoding="utf-8"))
if avisos:
    print("Avisos:\n" + "\n".join(avisos))
if erros:
    print("Erros:\n" + "\n".join(erros))
    sys.exit(1)
print("Tudo certo." if not avisos else "Sem erros.")
