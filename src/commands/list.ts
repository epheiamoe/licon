import fs from 'fs';
import path from 'path';
import { Config, getConfig } from '../config.js';
import { ensureSetup } from './setup.js';

export function listCommand(config: Config) {
  if (!config.repoPath) {
    if (!ensureSetup()) {
      return;
    }
  }
  
  const iconsDir = config.iconsDir || path.join(config.repoPath, 'icons');
  const jsonFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.json'));
  
  console.log(`Total icons: ${jsonFiles.length}\n`);
  
  const iconList = jsonFiles.map(f => {
    const name = f.replace('.json', '');
    const meta = JSON.parse(fs.readFileSync(path.join(iconsDir, f), 'utf-8'));
    const cats = meta.categories ? meta.categories.join(', ') : 'uncategorized';
    const tags = meta.tags ? meta.tags.join(', ') : '';
    return { name, cats, tags };
  });
  
  iconList.forEach(icon => {
    console.log(`${icon.name} [${icon.cats}]${icon.tags ? ` (tags: ${icon.tags})` : ''}`);
  });
}