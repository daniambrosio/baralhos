#!/bin/sh
# Gera capas/<nome>.webp (800x600) a partir de capas/<nome>.svg.
# Uso: ferramentas/capa.sh <nome> [<nome> ...]   Precisa do Google Chrome e do cwebp (brew install webp).
set -eu
RAIZ=$(cd "$(dirname "$0")/.." && pwd)
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP=$(mktemp -d)
trap 'rm -rf "${TMP:?}"' EXIT
for nome in "$@"; do
  svg="$RAIZ/capas/$nome.svg"
  [ -f "$svg" ] || { echo "não achei $svg" >&2; exit 1; }
  printf '<html><body style="margin:0"><img src="file://%s" width="800" height="600" style="display:block"></body></html>' "$svg" > "$TMP/p.html"
  "$CHROME" --headless --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --window-size=800,600 --screenshot="$TMP/$nome.png" "file://$TMP/p.html" >/dev/null 2>&1
  [ -s "$TMP/$nome.png" ] || { echo "o Chrome não gerou a imagem de $nome; rode de novo" >&2; exit 1; }
  cwebp -quiet -q 90 "$TMP/$nome.png" -o "$RAIZ/capas/$nome.webp"
  echo "capas/$nome.webp"
done
