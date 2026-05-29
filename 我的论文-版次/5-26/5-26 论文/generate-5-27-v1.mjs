import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(dir, '论文.txt');
const outputPath = path.join(dir, '5-27-v1.txt');

const source = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n?/g, '\n');

const isBodyStart = (line) => /^1\s+引言$/.test(line);
const isBodyEnd = (line) => line === '参考文献';
const isSectionTitle = (line) =>
  /^结论$/.test(line) ||
  /^[1-7]\s+/.test(line) ||
  /^\d+(?:\.\d+)+\S+$/.test(line);
const isFigureTitle = (line) => /^图\d+\.\d+/.test(line);
const isTableTitle = (line) => /^表\d+\.\d+(?:关键|召回|指标|失败)/.test(line);

const sections = [];
let inBody = false;
let inTable = false;

for (const rawLine of source.split('\n')) {
  const line = rawLine.trim();

  if (!line) {
    inTable = false;
    continue;
  }

  if (!inBody) {
    if (isBodyStart(line)) {
      inBody = true;
    }
    continue;
  }

  if (isBodyEnd(line)) {
    break;
  }

  if (inTable) {
    continue;
  }

  if (isTableTitle(line)) {
    inTable = true;
    continue;
  }

  if (isSectionTitle(line) || isFigureTitle(line)) {
    continue;
  }

  sections.push(line);
}

const lines = ['var data = {'];

sections.forEach((section, index) => {
  const id = String(index + 1);
  const suffix = index === sections.length - 1 ? '' : ',';

  lines.push(`    ${JSON.stringify(id)}: {`);
  lines.push(`        "sectionContentList": [${JSON.stringify(`${section}\n`)}],`);
  lines.push('        "revisedContent": []');
  lines.push(`    }${suffix}`);
});

lines.push('};');
lines.push('');

fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${sections.length} sections to ${outputPath}`);
