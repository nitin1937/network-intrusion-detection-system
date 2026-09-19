import csv
from pathlib import Path

path = Path('dataset/final/processed_dataset.csv')
with path.open(newline='') as f:
    reader = csv.reader(f)
    header = next(reader)

if 'Label' in header:
    header.remove('Label')

print('FEATURE_COUNT', len(header))
for name in header:
    print(name)
