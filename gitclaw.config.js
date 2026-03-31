

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  // gitagent spec
  spec_version: '0.1.0',
  name: 'scholar-mind',
  version: '1.0.0',

  // Entry point for gitclaw runtime
  entry: './src/index.js',

  // Model defaults
  model: {
    preferred: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
  },

  // Sub-agents
  agents: [
    { name: 'dr-rigor',       path: './agents/dr-rigor' },
    { name: 'prof-factcheck', path: './agents/prof-factcheck' },
    { name: 'ms-clarity',     path: './agents/ms-clarity' },
  ],

  // Skills
  skills: [
    { name: 'statistical-review', path: './skills/statistical-review/SKILL.md' },
    { name: 'fact-check',         path: './skills/fact-check/SKILL.md' },
    { name: 'writing-review',     path: './skills/writing-review/SKILL.md' },
    { name: 'synthesize-report',  path: './skills/synthesize-report/SKILL.md' },
  ],

  // Hooks
  hooks: {
    bootstrap: './hooks/bootstrap.md',
    teardown:  './hooks/teardown.md',
  },
};

// If run directly: node gitclaw.config.js
// This proxies to the actual entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const child = spawn('node', [path.join(__dirname, 'src', 'index.js')], {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', code => process.exit(code ?? 0));
}
