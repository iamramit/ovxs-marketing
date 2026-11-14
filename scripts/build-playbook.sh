#!/bin/sh
set -e
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf="$PWD/docs/OVXS-Content-Playbook.pdf" "file://$PWD/docs/guide.html" 2>/dev/null
pages=$(python3 -c "import re;print(len(re.findall(rb'/Type\\s*/Page[^s]',open('docs/OVXS-Content-Playbook.pdf','rb').read())))")
echo "Built docs/OVXS-Content-Playbook.pdf ($pages pages)"
