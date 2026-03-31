#!/usr/bin/env node
/**
 * src/validate.js
 * Validates the ScholarMind gitagent repo structure.
 * Run with: npm run validate
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const REQUIRED = [
  ['agent.yaml',                              'Root manifest'],
  ['SOUL.md',                                 'Orchestrator identity'],
  ['RULES.md',                                'Orchestrator rules'],
  ['agents/dr-rigor/agent.yaml',              'Dr. Rigor manifest'],
  ['agents/dr-rigor/SOUL.md',                 'Dr. Rigor identity'],
  ['agents/dr-rigor/RULES.md',                'Dr. Rigor rules'],
  ['agents/prof-factcheck/agent.yaml',        'Prof. Factcheck manifest'],
  ['agents/prof-factcheck/SOUL.md',           'Prof. Factcheck identity'],
  ['agents/prof-factcheck/RULES.md',          'Prof. Factcheck rules'],
  ['agents/ms-clarity/agent.yaml',            'Ms. Clarity manifest'],
  ['agents/ms-clarity/SOUL.md',               'Ms. Clarity identity'],
  ['agents/ms-clarity/RULES.md',              'Ms. Clarity rules'],
  ['skills/statistical-review/SKILL.md',      'Statistical review skill'],
  ['skills/fact-check/SKILL.md',              'Fact-check skill'],
  ['skills/writing-review/SKILL.md',          'Writing review skill'],
  ['skills/synthesize-report/SKILL.md',       'Synthesize report skill'],
  ['knowledge/review-standards.md',           'Knowledge base'],
  ['memory/patterns.md',                      'Memory system'],
  ['hooks/bootstrap.md',                      'Bootstrap hook'],
  ['hooks/teardown.md',                       'Teardown hook'],
  ['src/index.js',                            'Main entry point'],
  ['src/llm.js',                              'LLM client'],
  ['src/loader.js',                           'Agent loader'],
  ['src/reviewer.js',                         'Reviewer runtime'],
  ['src/synthesizer.js',                      'Synthesizer runtime'],
  ['src/memory.js',                           'Memory runtime'],
  ['src/utils.js',                            'Utilities'],
  ['package.json',                            'Node.js manifest'],
];

async function validate() {
  console.log(chalk.bold('\nScholarMind — Validation\n'));
  let passed = 0, failed = 0;

  for (const [filePath, label] of REQUIRED) {
    const exists = await fs.pathExists(path.join(ROOT, filePath));
    if (exists) {
      console.log(chalk.green('  ✓ ') + chalk.dim(filePath.padEnd(42)) + label);
      passed++;
    } else {
      console.log(chalk.red('  ✗ ') + filePath.padEnd(42) + chalk.red(label + ' — MISSING'));
      failed++;
    }
  }

  // Check env / API key
  const provider = process.env.SCHOLAR_PROVIDER || 'gemini';
  const keyMap = { gemini: 'GEMINI_API_KEY', groq: 'GROQ_API_KEY', anthropic: 'ANTHROPIC_API_KEY', ollama: null };
  const keyName = keyMap[provider];
  const hasKey = !keyName || !!process.env[keyName];

  console.log('\n' + chalk.bold('  Environment:'));
  console.log(chalk.dim('  Provider: ') + chalk.cyan(provider));
  console.log((hasKey ? chalk.green('  ✓ ') : chalk.yellow('  ⚠ ')) +
    (keyName ? keyName : 'No key needed (Ollama)') +
    (hasKey ? ' is set' : ' not set — add to .env before running'));

  console.log('\n  ' + '─'.repeat(44));
  if (failed === 0) {
    console.log(chalk.green.bold(`  ✓ All ${passed} checks passed. ScholarMind is ready.\n`));
    console.log('  Run: ' + chalk.cyan('npm run review') + ' (with paper.md in root)\n');
  } else {
    console.log(chalk.red(`  ✗ ${failed} file(s) missing. Add them and re-run.\n`));
    process.exit(1);
  }
}

validate().catch(err => {
  console.error(chalk.red('Error: ') + err.message);
  process.exit(1);
});
