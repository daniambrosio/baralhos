#!/usr/bin/env python3
"""Reescreve um indice.json no formato da casa (categorias numa linha, listas curtas inline).
Uso: python3 ferramentas/formatar_indice.py <jogo>/<idioma>/indice.json"""
import json, sys

def fmt(dados):
    j = lambda v: json.dumps(v, ensure_ascii=False)
    linhas = ["{", f'  "formato": {j(dados["formato"])},', f'  "jogo": {j(dados["jogo"])},', f'  "idioma": {j(dados["idioma"])},', '  "categorias": [']
    linhas.append(",\n".join(f'    {{ "id": {j(c["id"])}, "nome": {j(c["nome"])} }}' for c in dados["categorias"]))
    linhas += ["  ],", '  "baralhos": [']
    blocos = []
    for b in dados["baralhos"]:
        campos = ",\n".join(f'      {j(k)}: {j(v) if not isinstance(v, list) else "[" + ", ".join(j(x) for x in v) + "]"}' for k, v in b.items())
        blocos.append("    {\n" + campos + "\n    }")
    linhas += [",\n".join(blocos), "  ]", "}"]
    return "\n".join(linhas) + "\n"

if __name__ == "__main__":
    for p in sys.argv[1:]:
        d = json.load(open(p, encoding="utf-8"))
        open(p, "w", encoding="utf-8").write(fmt(d))
