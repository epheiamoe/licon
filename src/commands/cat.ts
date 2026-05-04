import fs from 'fs';
import path from 'path';
import { Config, getConfig } from '../config.js';
import { ensureSetup } from './setup.js';

export function catCommand(category: string, config: Config) {
  if (!config.repoPath) {
    if (!ensureSetup()) {
      return;
    }
  }
  
  const iconsDir = config.iconsDir || path.join(config.repoPath, 'icons');
  const jsonFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.json'));
  
  const matchingIcons: string[] = [];
  
  for (const file of jsonFiles) {
    const meta = JSON.parse(fs.readFileSync(path.join(iconsDir, file), 'utf-8'));
    if (meta.categories && meta.categories.includes(category)) {
      matchingIcons.push(file.replace('.json', ''));
    }
  }
  
  if (matchingIcons.length === 0) {
    console.log(`No icons found in category "${category}"`);
    console.log('Use "licon categories" to see available categories.');
    return;
  }
  
  console.log(`Category "${category}" (${matchingIcons.length} icons):\n`);
  console.log(matchingIcons.join(', '));
}