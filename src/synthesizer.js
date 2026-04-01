import chalk from 'chalk';
import { chat } from './llm.js';

export async function synthesizeReport({
  agent, skill, paperTitle, rigorReport, factReport, clarityReport,
}) {
  const skillBody = skill.replace(/^---[\s\S]*?---\n/, '').trim();
  const now = new Date().toISOString();

  const system = [
    agent.soul,
    '## Your Hard Rules',
    agent.rules,
    '## Synthesis Skill',
    skillBody,
    'CRITICAL: Your report MUST contain the verdict on a line formatted EXACTLY as one of:',
    '**Verdict:** ACCEPT',
    '**Verdict:** MINOR REVISION',
    '**Verdict:** MAJOR REVISION',
    '**Verdict:** REJECT',
  ].join('\n\n');

  const user = `Synthesize the three reviewer reports below into a final ScholarMind editorial report.

Paper: ${paperTitle}
Date: ${now}

## Dr. Rigor's Report (Statistical Review)
${rigorReport}

## Prof. Factcheck's Report (Domain & Factual Review)
${factReport}

## Ms. Clarity's Report (Writing & Structure Review)
${clarityReport}

Now produce the complete final ScholarMind Review Report following your output template exactly.
Cross-reference findings, note any consensus (ââ) or two-reviewer agreement (â), determine the verdict using your decision tree, and write the Author Action List.`;

  console.log(chalk.dim('\n  Synthesizing...\n'));
  process.stdout.write(chalk.bold('  [ScholarMind] '));

  let charCount = 0;

  const full = await chat({
    system,
    user,
    maxTokens: 4000,
    onChunk: (text) => {
      charCount += text.length;
      if (charCount > 80) {
        process.stdout.write(chalk.dim('.'));
        charCount = 0;
      }
    },
  });

  process.stdout.write(chalk.green(' done\n'));

  // Extract verdict from report text
  const verdictMatch = full.match(/\*\*Verdict:\*\*\s*(ACCEPT|MINOR REVISION|MAJOR REVISION|REJECT)/i);
  const verdict = verdictMatch?.[1]?.toUpperCase()
    || (full.includes('REJECT')           ? 'REJECT'
      : full.includes('MAJOR REVISION')   ? 'MAJOR REVISION'
      : full.includes('MINOR REVISION')   ? 'MINOR REVISION'
      : 'MAJOR REVISION');

  return { report: full, verdict };
}
