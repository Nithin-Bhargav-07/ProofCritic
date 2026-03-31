/**
 * src/reviewer.js
 * Runs a single reviewer sub-agent (Dr. Rigor, Prof. Factcheck, or Ms. Clarity)
 * against the paper and streams the response.
 */

import fs from 'fs-extra';
import chalk from 'chalk';
import { chat } from './llm.js';

export async function runReviewer({ agent, skillPath, paper, brief, knowledge, label, color }) {
  const skillRaw = await fs.readFile(skillPath, 'utf8');
  // Strip YAML frontmatter (--- ... ---) to get just the instructions
  const skillBody = skillRaw.replace(/^---[\s\S]*?---\n/, '').trim();

  const system = [
    agent.soul,
    '## Your Hard Rules',
    agent.rules,
    '## Your Review Skill — Follow These Steps Exactly',
    skillBody,
    '## Shared Knowledge Base',
    knowledge,
    '## Output Requirements',
    '- Follow the output format defined in your skill exactly',
    '- Cite specific sections, paragraphs, or short phrases for every finding',
    '- Rate every issue: FATAL | MAJOR | MINOR | NOTE',
    '- Acknowledge genuine strengths — be honest, not performative',
    '- Every sentence must add information — no padding or filler',
  ].join('\n\n');

  const user = `## Your Brief for This Paper\n${brief}\n\n## Paper to Review\n${paper}\n\nBegin your review now, following your skill steps one by one.`;

  console.log(color(`  → ${label}`) + chalk.dim(' is reviewing...'));
  process.stdout.write(color(`\n  [${label}] `));

  let charCount = 0;

  try {
    const full = await chat({
      system,
      user,
      maxTokens: 2000,
      onChunk: (text) => {
        charCount += text.length;
        if (charCount > 80) {
          process.stdout.write(chalk.dim('.'));
          charCount = 0;
        }
      },
    });
    process.stdout.write(color(' done\n'));
    return full;
  } catch (err) {
    process.stdout.write(chalk.red(' error\n'));
    console.error(color(`  ✗ ${label}: `) + err.message);
    return `### ${label} — Review\n\n*Review failed: ${err.message}*`;
  }
}
