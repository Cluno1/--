import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(dir, '论文.txt');
const revisedDataPath = path.join(dir, '5-27-v1.txt');
const outputPath = path.join(dir, '5-27-3-07论文.txt');

const normalizeNewlines = (value) => value.replace(/\r\n?/g, '\n');
const stripOneTrailingNewline = (value) => value.replace(/\n$/, '');

const parseRevisedData = (filePath) => {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/var data = (\{[\s\S]*\});\s*$/);

  if (!match) {
    throw new Error(`${filePath} should use \`var data = {...};\` format`);
  }

  return JSON.parse(match[1]);
};

const buildReplacementPairs = (data) => {
  const keys = Object.keys(data).sort((a, b) => Number(a) - Number(b));
  const pairs = [];

  for (const key of keys) {
    const entry = data[key];
    const originalList = entry.sectionContentList;
    const revisedList = entry.revisedContent;

    if (!Array.isArray(originalList) || !Array.isArray(revisedList)) {
      throw new Error(`Entry ${key} should include sectionContentList and revisedContent arrays`);
    }

    if (originalList.length !== revisedList.length) {
      throw new Error(
        `Entry ${key} has mismatched array lengths: ${originalList.length}/${revisedList.length}`,
      );
    }

    for (let index = 0; index < originalList.length; index += 1) {
      pairs.push({
        key,
        index,
        original: stripOneTrailingNewline(normalizeNewlines(originalList[index])),
        revised: stripOneTrailingNewline(normalizeNewlines(revisedList[index])),
      });
    }
  }

  return pairs;
};

const template = normalizeNewlines(fs.readFileSync(templatePath, 'utf8'));
const data = parseRevisedData(revisedDataPath);
const pairs = buildReplacementPairs(data);

const templateEndsWithNewline = template.endsWith('\n');
const templateLines = template.split('\n');

if (templateEndsWithNewline) {
  templateLines.pop();
}

let replacementIndex = 0;
const outputLines = [];

for (const line of templateLines) {
  const pair = pairs[replacementIndex];

  if (pair && line === pair.original) {
    outputLines.push(...pair.revised.split('\n'));
    replacementIndex += 1;
  } else {
    outputLines.push(line);
  }
}

if (replacementIndex !== pairs.length) {
  const pair = pairs[replacementIndex];
  throw new Error(
    `Only replaced ${replacementIndex}/${pairs.length}. First unmatched entry: ${pair.key}.${pair.index} ${pair.original.slice(0, 80)}`,
  );
}

const output = `${outputLines.join('\n')}${templateEndsWithNewline ? '\n' : ''}`;

for (const requiredText of ['目录', '1.4本文主要工作', '4.4.1多链路召回与融合重排', '参考文献', '附录B原型系统功能清单（摘要）']) {
  if (!output.includes(requiredText)) {
    throw new Error(`Generated paper is missing required structure text: ${requiredText}`);
  }
}

fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Wrote ${outputPath}`);
console.log(`Replaced ${replacementIndex} text blocks and preserved template structure`);
