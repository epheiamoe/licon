import fs from 'fs';
import path from 'path';
import { Config, getConfig } from '../config.js';
import { ensureSetup } from './setup.js';

let cachedIconMeta: Map<string, { cats: string; tags: string }> | null = null;

function getIconMeta(name: string, config: Config): { cats: string; tags: string } {
  if (!cachedIconMeta) {
    cachedIconMeta = new Map();
  }
  
  if (cachedIconMeta.has(name)) {
    return cachedIconMeta.get(name)!;
  }
  
  const iconsDir = config.iconsDir || path.join(config.repoPath, 'icons');
  const jsonPath = path.join(iconsDir, `${name}.json`);
  
  if (!fs.existsSync(jsonPath)) {
    return { cats: '', tags: '' };
  }
  
  const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const cats = meta.categories ? meta.categories.join(', ') : '';
  const tags = meta.tags ? meta.tags.join(', ') : '';
  
  cachedIconMeta.set(name, { cats, tags });
  return { cats, tags };
}

function outputIcon(name: string, svg: string, meta: { cats: string; tags: string }, format: string) {
  if (format === 'json') {
    const jsonOutput = JSON.stringify({ name, svg: svg.trim() });
    console.log(jsonOutput);
  } else {
    console.log(`<!-- ${name} [${meta.cats}] -->`);
    console.log(svg);
  }
}

export function getCommand(names: string[], options: { format?: string }, config: Config) {
  if (!config.repoPath) {
    if (!ensureSetup()) {
      return;
    }
  }
  
  const format = options.format || 'svg';
  const iconsDir = config.iconsDir || path.join(config.repoPath, 'icons');
  
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const iconPath = path.join(iconsDir, `${name}.svg`);
    
    if (!fs.existsSync(iconPath)) {
      console.error(`Icon "${name}" not found.`);
      continue;
    }
    
    const svg = fs.readFileSync(iconPath, 'utf-8');
    const meta = getIconMeta(name, config);
    outputIcon(name, svg, meta, format);
    
    if (i < names.length - 1) {
      console.log('---');
    }
  }
}

export function clearGetCache() {
  cachedIconMeta = null;
}