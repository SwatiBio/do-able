"""Split doable.html into index.html + app.js + ui.js + events.js"""
import re

with open('doable.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# --- Locate script block ---
# lines[785] = <script> (line 786), lines[2820] = </script> (line 2821)
SOPEN = 785  # index of <script> containing JS
SCLOSE = 2820  # index of </script>
# js_lines[i] = original line 787 + i

js = lines[SOPEN+1:SCLOSE]

# --- Define ranges (js_lines index, inclusive) ---
# app1: data layer | js[0..231] | orig 787-1018
# ui-theme | js[233..252] | orig 1020-1039
# ui-nav+renders | js[254..584] | orig 1041-1371
# events1 | js[585..1606] | orig 1372-2393
# app2: templates/series | js[1607..1656] | orig 2394-2443
# events2 | js[1657..1672] | orig 2444-2459
# ui3: modal..init | js[1674..2031] | orig 2461-2818
# skip: js[232], [253], [1673], [2032-2033]
#   → 232=blank, 253=blank, 1673=blank, 2032=blank, 2033=init(); goes in index.html

EXTRACT = [
    ('app.js',   0, 231),
    ('ui.js',  233, 252),
    ('ui.js',  254, 584),
    ('events.js', 585, 1606),
    ('app.js',  1607, 1656),
    ('events.js', 1657, 1672),
    ('ui.js',   1674, 2031),
]

outputs = {'app.js': [], 'ui.js': [], 'events.js': []}
for target, start, end in EXTRACT:
    outputs[target].extend(js[start:end+1])

# Write JS files
for name, content in outputs.items():
    text = ''.join(content)
    # strip trailing blank lines
    text = text.rstrip('\n') + '\n'
    with open(name, 'w', encoding='utf-8', newline='') as f:
        f.write(text)
    print(f'{name}: {len(content)} lines')

# --- Build index.html ---
# Part 1: HTML shell (lines 0..SOPEN, the <head>+CSS+<body>)
html_head = ''.join(lines[:SOPEN])

# Closing </script> goes to body
html_tail = '<script src="app.js"></script>\n<script src="ui.js"></script>\n<script src="events.js"></script>\n<script>init();</script>\n'
# Add SW registration script
sw_script = ''.join(lines[SCLOSE:])  # </script>\n<script>SW</script>\n</body>\n</html>
# But the first line of sw_script is </script> (the closing of main script)
# Let me skip that first </script>
sw_lines = lines[SCLOSE+1:]  # skip the closing </script> of main block
html_tail += ''.join(sw_lines)

index_html = html_head + html_tail

with open('index.html', 'w', encoding='utf-8', newline='') as f:
    f.write(index_html)
print(f'index.html: {len(lines[:SOPEN])} + {len(sw_lines)} lines')

# --- Verify no data loss ---
total_output = sum(len(v) for v in outputs.values()) + 0  # no skip lines in output
skip_count = 5  # 232, 253, 1673, 2032, 2033
print(f'Total JS lines: {len(js)}, output: {total_output}, skip: {skip_count}')
