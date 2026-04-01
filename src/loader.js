import fs from 'fs-extra';
import path from 'path';

function parseYaml(str) {
  const obj = {};
  let currentKey = null;
  let currentObj = null;
  for (const line of str.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    if (line.match(/^\s+-\s/) && currentKey) {
      if (!Array.isArray(obj[currentKey])) obj[currentKey] = [];
      obj[currentKey].push(line.trim().slice(2));
      continue;
    }
    if (line.startsWith('  ') && currentObj) {
      const m = line.trim().match(/^([\w-]+):\s*(.*)$/);
      if (m) currentObj[m[1]] = m[2].replace(/^["']|["']$/g, '');
      continue;
    }
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) {
      const val = m[2].replace(/^["']|["']$/g, '').trim();
      if (!val || val === '|' || val === '>') {
        currentKey = m[1]; currentObj = {}; obj[m[1]] = currentObj;
      } else {
        currentKey = m[1]; currentObj = null; obj[m[1]] = val;
      }
    }
  }
  return obj;
}

export async function loadAgentConfig(agentDir) {
  const config = { dir: agentDir };

  const yamlPath = path.join(agentDir, 'agent.yaml');
  if (await fs.pathExists(yamlPath)) {
    Object.assign(config, parseYaml(await fs.readFile(yamlPath, 'utf8')));
  }

  const soulPath = path.join(agentDir, 'SOUL.md');
  if (await fs.pathExists(soulPath)) {
    config.soul = await fs.readFile(soulPath, 'utf8');
  }

  const rulesPath = path.join(agentDir, 'RULES.md');
  if (await fs.pathExists(rulesPath)) {
    config.rules = await fs.readFile(rulesPath, 'utf8');
  }

  return config;
}
