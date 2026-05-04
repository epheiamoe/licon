import fs from 'fs';
import path from 'path';
import { Config, getConfig } from '../config.js';
import { ensureSetup } from './setup.js';

export function saveCommand(name: string, options: { output?: string }, config: Config) {
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
  
  const outputDir = options.output || process.cwd();
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const svg = fs.readFileSync(iconPath, 'utf-8');
  const destPath = path.join(outputDir, `${name}.svg`);
  
  fs.writeFileSync(destPath, svg);
  
  console.log(`Saved: ${destPath}`);
}