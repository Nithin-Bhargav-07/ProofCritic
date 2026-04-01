#!/usr/bin/env node


import 'dotenv/config';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { loadAgentConfig } from './loader.js';
import { runReviewer } from './reviewer.js';
import { synthesizeReport } from './synthesizer.js';
import { updateMemory } from './memory.js';
import { findPaper, extractTitle } from './utils.js';
import { chat, getProviderInfo, checkApiKey } from './llm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function main() {
  const provider = getProviderInfo();
  const { ok, keyName } = checkApiKey();

  console.log(chalk.bold('\n  ScholarMind v1.0.0'));
  console.log(chalk.bold('  AI Peer Review Panel · gitagent\n'));
  
  console.log(
    chalk.dim('  Provider : ') + chalk.cyan(provider.name) +
    (provider.free ? chalk.green(' (free)') : chalk.yellow(' (paid)')) +
    (provider.note ? chalk.dim(`  ·  ${provider.note}`) : '')
  );
  console.log(chalk.dim('  Model    : ') + chalk.cyan(provider.model) + '\n');

  if (!ok) {
    console.error(chalk.red(`✗  ${keyName} is not set.\n`));
    console.error('  Fix it by creating a .env file in your project root:');
    console.error(chalk.cyan(`\n  ${keyName}=your-key-here\n`));
    if (keyName === 'GEMINI_API_KEY') {
      console.error('  Get a free key at: ' + chalk.underline('https://aistudio.google.com/app/apikey'));
    } else if (keyName === 'GROQ_API_KEY') {
      console.error('  Get a free key at: ' + chalk.underline('https://console.groq.com'));
    }
    console.error('\n  Change provider: add  SCHOLAR_PROVIDER=gemini  to your .env\n');
    process.exit(1);
  }

  const paperPath = await findPaper(ROOT);
  if (!paperPath) {
    console.log(chalk.yellow('No paper found.\n'));
    console.log('  Add your manuscript as: ' + chalk.cyan('paper.md') + ' in the project root.');
    console.log('  Then run: ' + chalk.cyan('npm run review') + '\n');
    process.exit(0);
  }

  const paperContent = await fs.readFile(paperPath, 'utf8');
  const paperTitle   = extractTitle(paperContent, paperPath);
  console.log(chalk.green('✓  Paper : ') + chalk.bold(paperTitle) + '\n');

  const [orchestrator, drRigor, profFactcheck, msClarity] = await Promise.all([
    loadAgentConfig(ROOT),
    loadAgentConfig(path.join(ROOT, 'agents', 'dr-rigor')),
    loadAgentConfig(path.join(ROOT, 'agents', 'prof-factcheck')),
    loadAgentConfig(path.join(ROOT, 'agents', 'ms-clarity')),
  ]);

  const memory    = await fs.readFile(path.join(ROOT, 'memory', 'patterns.md'), 'utf8');
  const knowledge = await fs.readFile(path.join(ROOT, 'knowledge', 'review-standards.md'), 'utf8');

  console.log(chalk.bold('ScholarMind') + ' is briefing the panel...\n');
  const briefs = await writeBriefs(orchestrator, paperContent, paperTitle, memory);


  console.log('Dispatching reviewers in parallel:\n');

  const [rigorReport, factReport, clarityReport] = await Promise.all([
    runReviewer({
      agent: drRigor,
      skillPath: path.join(ROOT, 'skills', 'statistical-review', 'SKILL.md'),
      paper: paperContent, brief: briefs.drRigor, knowledge,
      label: 'Dr. Rigor', color: chalk.red,
    }),
    runReviewer({
      agent: profFactcheck,
      skillPath: path.join(ROOT, 'skills', 'fact-check', 'SKILL.md'),
      paper: paperContent, brief: briefs.profFactcheck, knowledge,
      label: 'Prof. Factcheck', color: chalk.blue,
    }),
    runReviewer({
      agent: msClarity,
      skillPath: path.join(ROOT, 'skills', 'writing-review', 'SKILL.md'),
      paper: paperContent, brief: briefs.msClarity, knowledge,
      label: 'Ms. Clarity', color: chalk.magenta,
    }),
  ]);

  console.log('\n' + chalk.bold('ScholarMind') + ' is synthesizing the final report...');
  const synthSkill = await fs.readFile(
    path.join(ROOT, 'skills', 'synthesize-report', 'SKILL.md'), 'utf8'
  );
  const { report, verdict } = await synthesizeReport({
    agent: orchestrator, skill: synthSkill,
    paperTitle, rigorReport, factReport, clarityReport,
  });

  await fs.ensureDir(path.join(ROOT, 'reviews'));
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(ROOT, 'reviews', `review-${ts}.md`);
  await fs.writeFile(reportPath, report, 'utf8');

  await updateMemory(ROOT, paperTitle, verdict, rigorReport, factReport, clarityReport);
  await fs.ensureDir(path.join(ROOT, 'memory', 'past-reviews'));
  await fs.copy(paperPath, path.join(ROOT, 'memory', 'past-reviews', `${ts}-paper.md`));

  const vc = { ACCEPT: chalk.green, 'MINOR REVISION': chalk.yellow, 'MAJOR REVISION': chalk.red, REJECT: chalk.bgRed.white }[verdict] || chalk.white;

  console.log(chalk.bold('\n  Review Complete'));
  console.log(chalk.green('✓  ScholarMind review complete.\n'));
  console.log('  Paper   : ' + chalk.bold(paperTitle));
  console.log('  Verdict : ' + vc.bold(verdict));
  console.log('  Report  : ' + chalk.cyan(reportPath));
  console.log('\n  Panel signed off:');
  console.log('    ' + chalk.green('✓') + '  Dr. Rigor');
  console.log('    ' + chalk.green('✓') + '  Prof. Factcheck');
  console.log('    ' + chalk.green('✓') + '  Ms. Clarity\n');
}

async function writeBriefs(orchestrator, paper, title, memory) {
  const system = `${orchestrator.soul}\n\nYou are briefing your three reviewers before they begin. Be specific to what you see in this paper.`;
  const user   = `Paper title: ${title}\n\nPaper preview (first 2000 chars):\n${paper.slice(0, 2000)}\n\nPast review patterns:\n${memory}\n\nWrite a 2-sentence brief for each reviewer telling them what to specifically watch for in THIS paper.\nRespond ONLY in this exact JSON — no other text:\n{"drRigor":"...","profFactcheck":"...","msClarity":"..."}`;

  try {
    const raw    = await chat({ system, user, maxTokens: 350 });
    const json   = raw.match(/\{[\s\S]*?\}/)?.[0];
    const briefs = JSON.parse(json);
    console.log(chalk.dim('  Dr. Rigor       : ') + briefs.drRigor);
    console.log(chalk.dim('  Prof. Factcheck : ') + briefs.profFactcheck);
    console.log(chalk.dim('  Ms. Clarity     : ') + briefs.msClarity + '\n');
    return briefs;
  } catch {
    
    return {
      drRigor:       'Focus on sample size, statistical tests, effect sizes, and confidence intervals.',
      profFactcheck: 'Focus on citation accuracy, missing literature, and logical gaps.',
      msClarity:     'Focus on abstract completeness, structure, paragraph discipline, and figure captions.',
    };
  }
}

main().catch(err => {
  console.error(chalk.red('\n✗  Error: ') + err.message);
  process.exit(1);
});
