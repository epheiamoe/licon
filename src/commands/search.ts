import fs from 'fs';
import path from 'path';
import { Config, getConfig } from '../config.js';
import { ensureSetup } from './setup.js';
import fuzzy from 'fuzzy';

export function searchCommand(query: string, config: Config) {
  if (!config.repoPath) {
    if (!ensureSetup()) {
      return;
    }
  }
  
  const iconsDir = config.iconsDir || path.join(config.repoPath, 'icons');
  const jsonFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.json'));
  
  const iconList = jsonFiles.map(f => {
    const name = f.replace('.json', '');
    const meta = JSON.parse(fs.readFileSync(path.join(iconsDir, f), 'utf-8'));
    const cats = meta.categories ? meta.categories.join(', ') : '';
    const tags = meta.tags ? meta.tags.join(', ') : '';
    return { name, cats, tags, searchText: `${name} ${cats} ${tags}` };
  });
  
  const results = fuzzy.filter(query, iconList, {
    extract: (item) => item.searchText
  }) as any[];

  if (results.length === 0) {
    console.log(`No icons found matching "${query}"`);
    return;
  }
  
  console.log(`Found ${results.length} icons matching "${query}":\n`);
  
  results.slice(0, 20).forEach((result: any) => {
    const icon = result.original;
    console.log(`${icon.name} [${icon.cats}]${icon.tags ? ` (tags: ${icon.tags})` : ''}`);
  });
  
  if (results.length > 20) {
    console.log(`\n... and ${results.length - 20} more. Use more specific search.`);
  }
}