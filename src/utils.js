import fs from 'fs-extra';
import path from 'path';


export async function findPaper(repoRoot) {
  const candidates = ['paper.md', 'paper.txt', 'manuscript.md', 'manuscript.txt'];
  for (const name of candidates) {
    const p = path.join(repoRoot, name);
    if (await fs.pathExists(p)) return p;
  }
  return null;
}

export function extractTitle(content, filePath) {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  const first = content.split('\n').find(l => l.trim().length > 10);
  if (first) return first.trim().slice(0, 80);
  return path.basename(filePath, path.extname(filePath));
}
