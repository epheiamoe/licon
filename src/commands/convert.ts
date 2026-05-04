import fs from 'fs';
import path from 'path';
import { Config, getConfig } from '../config.js';
import { ensureSetup } from './setup.js';

let sharp: any = null;

try {
  sharp = require('sharp');
} catch (e) {
  // sharp not available
}

export async function convertCommand(name: string, options: { format?: string; output?: string }, config: Config) {
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
  
  const format = options.format || 'svg';
  const outputDir = options.output || process.cwd();
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  if (format === 'svg') {
    const svg = fs.readFileSync(iconPath, 'utf-8');
    const destPath = path.join(outputDir, `${name}.svg`);
    fs.writeFileSync(destPath, svg);
    console.log(`Saved: ${destPath}`);
    return;
  }
  
  if (!sharp) {
    console.log('⚠️  sharp is not installed. Cannot convert to PNG/WebP.');
    console.log('   Install with: npm install sharp');
    console.log('   Or use SVG output instead: --format svg');
    process.exit(1);
  }
  
  const svg = fs.readFileSync(iconPath);
  const destPath = path.join(outputDir, `${name}.${format}`);
  
  try {
    let buffer: Buffer;
    
    if (format === 'png') {
      buffer = await sharp(svg).png().toBuffer();
    } else if (format === 'webp') {
      buffer = await sharp(svg).webp().toBuffer();
    } else {
      console.error(`Unsupported format: ${format}`);
      console.log('Supported formats: svg, png, webp');
      process.exit(1);
    }
    
    fs.writeFileSync(destPath, buffer);
    console.log(`Saved: ${destPath}`);
  } catch (err: any) {
    console.error(`Failed to convert: ${err.message}`);
    process.exit(1);
  }
}