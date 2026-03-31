/**
 * src/memory.js
 * Updates memory/patterns.md after every completed review.
 * Tracks recurring issue types so ScholarMind gets smarter over time.
 */

import fs from 'fs-extra';
import path from 'path';

export async function updateMemory(repoRoot, paperTitle, verdict, rigorReport, factReport, clarityReport) {
  const memoryPath = path.join(repoRoot, 'memory', 'patterns.md');
  if (!await fs.pathExists(memoryPath)) return;

  let memory = await fs.readFile(memoryPath, 'utf8');
  const allReports = [rigorReport, factReport, clarityReport].join('\n');
  const today = new Date().toISOString().split('T')[0];

  const patterns = [
    { key: 'Missing effect sizes',                      regex: /effect size/i },
    { key: 'Abstract lacks primary finding',            regex: /abstract.*finding|finding.*abstract/i },
    { key: 'No confidence intervals reported',          regex: /confidence interval/i },
    { key: 'Multiple comparisons uncorrected',          regex: /multiple comp/i },
    { key: 'Citation misrepresentation',                regex: /misrepresent|citation.*wrong|does not support/i },
    { key: 'Missing related work',                      regex: /missing.*literature|related work.*missing/i },
    { key: 'Results/discussion sections mixed',         regex: /results.*discussion.*mixed|discussion.*results/i },
    { key: 'Overclaiming in conclusion',                regex: /overclai|causal.*correlat/i },
    { key: 'No data availability statement',            regex: /data availability/i },
    { key: 'Underpowered study (no power analysis)',    regex: /power analysis|underpowered/i },
  ];

  for (const pattern of patterns) {
    if (!pattern.regex.test(allReports)) continue;
    // Increment counter
    memory = memory.replace(
      new RegExp(`(\\| ${esc(pattern.key)} \\| )(\\d+)( \\|)`),
      (_, pre, count, post) => `${pre}${parseInt(count) + 1}${post}`
    );
    // Update last-seen date
    memory = memory.replace(
      new RegExp(`(\\| ${esc(pattern.key)} \\| \\d+ \\| )([^|]+)(\\|)`),
      `$1${today} $3`
    );
  }

  // Add row to Review History table
  const flaw = extractFlaw(allReports);
  const row = `| ${today} | ${paperTitle.slice(0, 40)} | ${verdict} | ${flaw} |`;
  memory = memory.replace('| â | â | â | â |', row);

  // Add learned calibration if pattern hits â¥ 5
  for (const pattern of patterns) {
    const m = memory.match(new RegExp(`\\| ${esc(pattern.key)} \\| (\\d+) \\|`));
    if (m && parseInt(m[1]) >= 5) {
      const note = `- **${pattern.key}**: Recurring in this user's submissions. Prioritise on all future reviews.`;
      if (!memory.includes(note)) {
        memory = memory.replace('No patterns learned yet. Submit your first paper.', note);
      }
    }
  }

  await fs.writeFile(memoryPath, memory, 'utf8');
}

function extractFlaw(text) {
  const fatal = text.match(/\[FATAL\]\s*([^\n]{0,50})/);
  if (fatal) return fatal[1].trim().replace(/\|/g, '-');
  const major = text.match(/\[MAJOR\]\s*([^\n]{0,50})/);
  if (major) return major[1].trim().replace(/\|/g, '-');
  return 'See report';
}

function esc(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
