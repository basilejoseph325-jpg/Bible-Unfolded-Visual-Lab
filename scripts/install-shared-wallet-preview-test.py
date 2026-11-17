#!/usr/bin/env python3
"""One-time opt-in preview loader in the huge HTML entry, branch ONLY.

The generated native core transport is never touched. This script does
not run against GitHub main, LIVE, or the public Visual Lab deployment.
"""
from pathlib import Path
p=Path('index.html')
body=p.read_text(encoding='utf8')
anchor='<head>'
assert body.startswith('<!doctype html><html lang="en"><head>'), 'Unexpected game entry'
assert 'bu-test-native-storage-fence-v1.js' not in body, 'Already installed'
insert=(
 '<script src="experiments/bu-test-native-storage-fence-v1.js"></script>'
 '<script src="experiments/bu-test-word-trails-economy-v1.js" defer></script>'
 '<script src="experiments/bu-test-insight-native-bridge-v2.js" defer></script>'
)
out=body.replace(anchor,anchor+insert,1)
assert out.replace(insert,'',1)==body, 'Only the preview loader may change'
assert out.count(insert)==1
p.write_text(out,encoding='utf8')
print('PASS preview loader inserted before ALL existing scripts')
print('Unmodified native transport and normal TEST entry preserved')
