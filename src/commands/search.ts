import fs from 'fs';
import path from 'path';
import { Config, getConfig } from '../config.js';
import { ensureSetup } from './setup.js';
import fuzzy from 'fuzzy';

let cachedIconList: any[] | null = null;

function getIconList(config: Config): any[] {
  if (cachedIconList) {
    return cachedIconList;
  }
  
  const iconsDir = config.iconsDir || path.join(config.repoPath, 'icons');
  const jsonFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.json'));
  
  cachedIconList = jsonFiles.map(f => {
    const name = f.replace('.json', '');
    const meta = JSON.parse(fs.readFileSync(path.join(iconsDir, f), 'utf-8'));
    const cats = meta.categories ? meta.categories.join(', ') : '';
    const tags = meta.tags ? meta.tags.join(', ') : '';
    return { name, cats, tags, searchText: `${name} ${cats} ${tags}` };
  });
  
  return cachedIconList;
}

export function searchCommand(query: string, options: { limit?: number; verbose?: boolean }, config: Config) {
  if (!config.repoPath) {
    if (!ensureSetup()) {
      return;
    }
  }
  
  const limit = options.limit || 5;
  const verbose = options.verbose || false;
  const iconList = getIconList(config);
  
  if (query.includes(',')) {
    const keywords = query.split(',').map(k => k.trim()).filter(k => k);
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const results = fuzzy.filter(keyword, iconList, {
        extract: (item) => item.searchText
      }) as any[];
      
      console.log(`[${keyword}] ${results.length} results:`);
      results.slice(0, limit).forEach((result: any) => {
        const icon = result.original;
        if (verbose) {
          console.log(`${icon.name} [${icon.cats}]${icon.tags ? ` (${icon.tags})` : ''}`);
        } else {
          console.log(icon.name);
        }
      });
      if (i < keywords.length - 1) {
        console.log('---');
      }
    }
    return;
  }
  
  if (query.includes(' ')) {
    const keywords = query.split(' ').filter(k => k);
    const results = fuzzy.filter(query, iconList, {
      extract: (item) => item.searchText
    }) as any[];
    
    console.log(`[AND: ${keywords.join(' ')}] ${results.length} results:\n`);
    results.slice(0, limit).forEach((result: any) => {
      const icon = result.original;
      if (verbose) {
        console.log(`${icon.name} [${icon.cats}]${icon.tags ? ` (${icon.tags})` : ''}`);
      } else {
        console.log(icon.name);
      }
    });
    return;
  }
  
  const results = fuzzy.filter(query, iconList, {
    extract: (item) => item.searchText
  }) as any[];

  if (results.length === 0) {
    console.log(`No icons found matching "${query}"`);
    return;
  }
  
  console.log(`[${query}] ${results.length} results:\n`);
  
  results.slice(0, limit).forEach((result: any) => {
    const icon = result.original;
    if (verbose) {
      console.log(`${icon.name} [${icon.cats}]${icon.tags ? ` (${icon.tags})` : ''}`);
    } else {
      console.log(icon.name);
    }
  });
}

export function clearSearchCache() {
  cachedIconList = null;
}