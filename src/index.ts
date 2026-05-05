#!/usr/bin/env node
import { Command } from 'commander';
import { getCommand } from './commands/get.js';
import { saveCommand } from './commands/save.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { catCommand } from './commands/cat.js';
import { convertCommand } from './commands/convert.js';
import { upgradeCommand } from './commands/upgrade.js';
import { interactiveCommand } from './commands/interactive.js';
import { setupCommand } from './commands/setup.js';
import { getConfig, configExists } from './config.js';

const program = new Command();

program
  .name('licon')
  .description('CLI tool for fetching Lucide icons - designed for AI agents and developers')
  .version('1.0.0');

program
  .command('setup')
  .description('Setup or reconfigure lucide repository path')
  .action(() => setupCommand());

program
  .command('get <names...>')
  .description('Get SVG text for icon(s) (for AI embedding)')
  .option('-f, --format <type>', 'Output format: svg (default), json')
  .action((names, options) => {
    const config = getConfig();
    getCommand(names, options, config);
  });

program
  .command('save <name>')
  .description('Save icon SVG to a file')
  .option('-o, --output <path>', 'Output directory (default: current directory)')
  .action((name, options) => {
    const config = getConfig();
    saveCommand(name, options, config);
  });

program
  .command('list')
  .description('List all available icons')
  .action(() => {
    const config = getConfig();
    listCommand(config);
  });

program
  .command('search <query>')
  .description('Search icons by name, tags, or category')
  .option('-n, --limit <num>', 'Number of results to show (default: 5)', '5')
  .option('-v, --verbose', 'Show category and tags')
  .action((query, options) => {
    const config = getConfig();
    searchCommand(query, options, config);
  });

program
  .command('cat <category>')
  .description('List icons in a specific category')
  .action((category) => {
    const config = getConfig();
    catCommand(category, config);
  });

program
  .command('convert <name>')
  .description('Convert icon to different format (png, webp, svg)')
  .option('-f, --format <format>', 'Output format: png, webp, svg (default: svg)')
  .option('-o, --output <path>', 'Output directory (default: current directory)')
  .action(async (name, options) => {
    const config = getConfig();
    await convertCommand(name, options, config);
  });

program
  .command('upgrade')
  .description('Update local lucide repository via git pull')
  .action(() => {
    upgradeCommand();
  });

program
  .command('interactive')
  .description('Interactive icon picker (for human use only)')
  .action(async () => {
    const config = getConfig();
    await interactiveCommand(config);
  });

program
  .command('categories')
  .description('List all available categories')
  .action(() => {
    const config = getConfig();
    if (!config.repoPath) {
      console.log('❌ Not configured. Run "licon setup" first.');
      return;
    }
    const categoriesPath = path.join(config.repoPath, 'categories');
    if (!fs.existsSync(categoriesPath)) {
      console.log('❌ Categories directory not found.');
      return;
    }
    const files = fs.readdirSync(categoriesPath).filter(f => f.endsWith('.json'));
    console.log('Available categories:');
    files.forEach(f => console.log(`  - ${f.replace('.json', '')}`));
  });

import fs from 'fs';
import path from 'path';

if (process.argv.length === 2) {
  const config = getConfig();
  if (!configExists()) {
    console.log('🔧 First time setup required.\n');
    setupCommand();
  } else {
    interactiveCommand(config);
  }
} else {
  program.parse(process.argv);
}