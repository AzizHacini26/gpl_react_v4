"""
SQL INSERT to JSON converter for client import.

Usage:
  python sql_to_json.py input.sql -o output.json
  python sql_to_json.py input.sql              # prints to stdout
  cat insert.sql | python sql_to_json.py -     # reads from stdin
"""

import re
import sys
import json
import argparse


def parse_value(raw):
    raw = raw.strip()
    if raw == 'NULL':
        return None
    if raw.startswith("'") and raw.endswith("'"):
        return raw[1:-1]
    try:
        return int(raw)
    except ValueError:
        try:
            return float(raw)
        except ValueError:
            return raw


def parse_insert(sql):
    match = re.match(
        r'INSERT\s+INTO\s+"?\w+"?\s*\.?\s*"?\w+"?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)',
        sql.strip().rstrip(';'),
        re.IGNORECASE,
    )
    if not match:
        return None

    columns = [c.strip().strip('"') for c in match.group(1).split(',')]
    raw_values = match.group(2)

    values = []
    current = ''
    in_string = False
    i = 0
    while i < len(raw_values):
        ch = raw_values[i]
        if in_string:
            if ch == "'" and i + 1 < len(raw_values) and raw_values[i + 1] == "'":
                current += "''"
                i += 2
                continue
            current += ch
            if ch == "'":
                in_string = False
        else:
            if ch == "'":
                in_string = True
                current += ch
            elif ch == ',':
                values.append(parse_value(current))
                current = ''
            else:
                current += ch
        i += 1
    if current.strip():
        values.append(parse_value(current))

    return dict(zip(columns, values))


def convert(sql_text):
    statements = re.split(r';\s*(?:\r?\n|$)', sql_text)
    results = []
    for stmt in statements:
        stmt = stmt.strip()
        if not stmt.upper().startswith('INSERT'):
            continue
        row = parse_insert(stmt)
        if row:
            results.append(row)
    return results


def main():
    parser = argparse.ArgumentParser(description='Convert SQL INSERT statements to JSON for client import.')
    parser.add_argument('input', help='SQL file path, or - for stdin')
    parser.add_argument('-o', '--output', help='Output JSON file (default: stdout)')
    args = parser.parse_args()

    if args.input == '-':
        sql_text = sys.stdin.read()
    else:
        with open(args.input, 'r', encoding='utf-8') as f:
            sql_text = f.read()

    data = convert(sql_text)
    for row in data:
        if 'number' in row:
            row['battlenumb'] = row.pop('number')
    output = json.dumps(data, ensure_ascii=False, indent=2)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f'Done. {len(data)} clients written to {args.output}')
    else:
        sys.stdout.reconfigure(encoding='utf-8')
        print(output)

    print(f'Total: {len(data)} clients converted.', file=sys.stderr)


if __name__ == '__main__':
    main()
