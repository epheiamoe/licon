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

async function writeIcon(name: string, config: Config, format: string, outputDir: string) {
  const iconsDir = config.iconsDir || path.join(config.repoPath, 'icons');
  const iconPath = path.join(iconsDir, `${name}.svg`);

  if (!fs.existsSync(iconPath)) {
    console.error(`Icon "${name}" not found.`);
    return;
  }

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
    console.log(`⚠️  sharp not installed. Cannot convert ${name} to ${format}.`);
    console.log('   Install with: npm install sharp');
    return;
  }

  const svgBuffer = fs.readFileSync(iconPath);
  const destPath = path.join(outputDir, `${name}.${format}`);

  try {
    let buffer: Buffer;
    if (format === 'png') {
      buffer = await sharp(svgBuffer).png().toBuffer();
    } else if (format === 'webp') {
      buffer = await sharp(svgBuffer).webp().toBuffer();
    } else {
      console.error(`Unsupported format: ${format}`);
      return;
    }
    fs.writeFileSync(destPath, buffer);
    console.log(`Saved: ${destPath}`);
  } catch (err: any) {
    console.error(`Failed to convert ${name}: ${err.message}`);
  }
}

export async function saveCommand(names: string[], options: { output?: string; format?: string }, config: Config) {
  if (!config.repoPath) {
    if (!ensureSetup()) {
      return;
    }
  }

  if (names.length === 1 && (names[0].includes(' ') || names[0].includes(','))) {
    names = names[0].split(/[ ,]+/).filter(n => n);
  }

  const format = options.format || 'svg';
  const outputDir = options.output || process.cwd();

  for (const name of names) {
    await writeIcon(name, config, format, outputDir);
  }
}