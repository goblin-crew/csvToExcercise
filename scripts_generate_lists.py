#!/usr/bin/env python3
import csv, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / 'data'
OUT_FILE = ROOT / 'generated-lists.js'
COLORS = ['#7c6ff7', '#34d399', '#f59e0b', '#38bdf8', '#f472b6', '#a3e635']

def slug(name: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return s or 'list'

lists = []
for i, path in enumerate(sorted(DATA_DIR.glob('*.csv'))):
    with path.open(encoding='utf-8-sig', newline='') as f:
        rows = list(csv.DictReader(f))
    lists.append({
        'id': slug(path.stem),
        'name': f"{path.stem} ({len(rows)})",
        'data': rows,
        'color': COLORS[i % len(COLORS)],
        'builtIn': True,
        'sourceFile': str(path.relative_to(ROOT)).replace('\\\\', '/')
    })

OUT_FILE.write_text(
    '// Auto-generated from data/*.csv by scripts_generate_lists.py\n'
    + 'window.GENERATED_DEFAULT_LISTS = '
    + json.dumps(lists, ensure_ascii=False, indent=2)
    + ';\n',
    encoding='utf-8'
)
print(f'Wrote {OUT_FILE} with {len(lists)} lists.')
