import fs from 'fs';
import path from 'path';
import { Config, getConfig, isValidRepo } from '../config.js';
import { ensureSetup } from './setup.js';

export function getCommand(name: string, options: { format?: string }, config: Config) {
  if (!config.repoPath) {
    if (!ensureSetup()) {
      return;
    }
  }
  
  const iconsDir = config.iconsDir || path.join(config.repoPath, 'icons');
  const iconPath = path.join(iconsDir, `${name}.svg`);
  
  if (!fs.existsSync(iconPath)) {
    console.error(`Icon "${name}" not found. Use 'licon list' or 'licon search' to find icons.`);
    process.exit(1);
  }
  
  let svg = fs.readFileSync(iconPath, 'utf-8');
  
  if (options.format && options.format !== 'svg') {
    svg = convertFormat(svg, options.format);
  }
  
  console.log(svg);
}

function convertFormat(svg: string, format: string): string {
  return svg;
}