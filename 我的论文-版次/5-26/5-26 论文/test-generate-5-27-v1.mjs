import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const generatorPath = path.join(dir, 'generate-5-27-v1.mjs');
const outputPath = path.join(dir, '5-27-v1.txt');

execFileSync(process.execPath, [generatorPath], { stdio: 'pipe' });

const output = fs.readFileSync(outputPath, 'utf8');
const match = output.match(/var data = (\{[\s\S]*\});\s*$/);
assert.ok(match, 'output should use `var data = {...};` format');

const data = JSON.parse(match[1]);
const entries = Object.values(data);
const sections = entries.map((entry) => entry.sectionContentList[0].trim());

for (const entry of entries) {
  assert.deepEqual(entry.revisedContent, [], 'each entry should include empty revisedContent');
}

assert.equal(
  sections[0],
  '大语言模型（LLM）的快速发展，使自然语言处理系统从单一文本生成工具逐步转向具备任务理解、知识整合和策略推理能力的通用计算接口。随着参数规模、训练语料和指令微调方法的持续演进，LLM在问答、摘要、代码生成、数学推理等任务中表现出较强的迁移能力，也推动了模型从“被动回答”向“主动执行”的应用形态转变。在这一转变过程中，模型需要能够根据任务目标选择外部知识、调用工具并利用环境反馈修正后续决策，单纯依赖模型内部参数记忆已经难以满足真实场景中的准确性和时效性要求。'
);

assert.equal(
  sections.at(-1),
  '总体而言，Agentlz并非追求无限开放的通用智能体框架，而是面向企业知识问答和受控多步执行任务提供一种可运行、可评测、可审计的闭环参考架构。该架构在提高任务成功率的同时，也为工业级智能体平台的工程实现提供了可复用的方法和系统设计经验。'
);

const forbiddenExact = new Set([
  '摘要',
  '关键词：LLM智能体，ReAct，检索增强，工具调用，工作流编排',
  'Abstract',
  'Key words: LLM Agent, ReAct, Retrieval-Augmented Generation, Tool Use, Workflow Orchestration',
  '目录',
  '1  引言',
  '1.1研究背景',
  '7.3未来工作',
  '结论',
  '参考文献',
  '致谢',
  '附录A主要缩略语与符号说明',
  '附录B原型系统功能清单（摘要）',
]);

for (const section of sections) {
  assert.ok(!forbiddenExact.has(section), `unexpected title/front matter: ${section}`);
  assert.ok(!/^\d+(?:\.\d+)*\s*[^\s]+\s+\d+$/.test(section), `unexpected TOC row: ${section}`);
  assert.ok(!/^图\d+\.\d+/.test(section), `unexpected figure title: ${section}`);
  assert.ok(!/^表\d+\.\d+(?:关键|召回|指标|失败)/.test(section), `unexpected table title: ${section}`);
  assert.ok(!/^\[\d+\]/.test(section), `unexpected reference entry: ${section}`);
}

console.log(`validated ${sections.length} body sections`);
