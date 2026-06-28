import re

def fix_readme():
    with open('README.md', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    out = []
    in_code_block = False

    for i, line in enumerate(lines):
        # MD033 / MD041
        if line.startswith('<div align="center">'):
            continue
        if line.startswith('</div>'):
            continue
        
        # MD001
        if line.startswith('### Enterprise Industrial Costing Platform'):
            line = line.replace('### ', '## ')

        # MD040
        if line.startswith('```'):
            if line.strip() == '```':
                if not in_code_block:
                    line = '```text\n'
                    in_code_block = True
                else:
                    in_code_block = False
            else:
                in_code_block = True
                if in_code_block and line.strip() == '```':
                    in_code_block = False
        
        # MD060
        if line.strip().startswith('|'):
            # simple spacing fix for tables: "|text|" -> "| text |"
            line = re.sub(r'\|([^\s\|])', r'| \1', line)
            line = re.sub(r'([^\s\|])\|', r'\1 |', line)

        # MD022 (blank around headings)
        if line.startswith('#'):
            # Ensure blank line before
            if out and out[-1].strip() != '':
                out.append('\n')
            
            # The line itself
            out.append(line)
            
            # Ensure blank line after will be handled by looking ahead?
            # Or just appending next time. We can just add a newline after if the next line is not blank
            # but it's easier to just look at the next line
            if i + 1 < len(lines) and lines[i+1].strip() != '':
                out.append('\n')
            continue

        out.append(line)

    with open('README.md', 'w', encoding='utf-8') as f:
        f.writelines(out)

if __name__ == "__main__":
    fix_readme()
