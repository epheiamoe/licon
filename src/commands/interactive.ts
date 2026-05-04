import fs from 'fs';
import path from 'path';
import { Config, getConfig, configExists } from '../config.js';
import { ensureSetup } from './setup.js';
import readline from 'readline';
import fuzzy from 'fuzzy';

export async function interactiveCommand(config: Config) {
  if (!configExists()) {
    console.log('🔧 First time setup required.\n');
    const { setupCommand } = await import('./setup.js');
    await setupCommand();
  }
  
  const iconConfig = getConfig();
  const iconsDir = iconConfig.iconsDir || path.join(iconConfig.repoPath, 'icons');
  
  console.log('\n🎨 Lucide Icon Picker\n');
  
  const jsonFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.json'));
  const iconList = jsonFiles.map(f => {
    const name = f.replace('.json', '');
    const meta = JSON.parse(fs.readFileSync(path.join(iconsDir, f), 'utf-8'));
    const cats = meta.categories ? meta.categories.join(', ') : '';
    const tags = meta.tags ? meta.tags.join(', ') : '';
    return { name, cats, tags, searchText: `${name} ${cats} ${tags}` };
  });
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  };
  
  while (true) {
    console.log('\n🔍 Search icons (or type "list", "cat <category>", "quit"):');
    const query = await askQuestion('> ');
    
    if (query.toLowerCase() === 'quit' || query.toLowerCase() === 'exit') {
      console.log('Goodbye! 👋');
      rl.close();
      return;
    }
    
    if (query.toLowerCase() === 'list') {
      console.log(`\nShowing all ${iconList.length} icons:\n`);
      iconList.slice(0, 50).forEach(icon => {
        console.log(`  ${icon.name} [${icon.cats}]`);
      });
      if (iconList.length > 50) {
        console.log(`\n  ... and ${iconList.length - 50} more. Use search to narrow down.`);
      }
      continue;
    }
    
    if (query.toLowerCase().startsWith('cat ')) {
      const category = query.substring(4).trim();
      const matching = iconList.filter(icon => icon.cats.includes(category));
      if (matching.length === 0) {
        console.log(`No icons found in category "${category}"`);
      } else {
        console.log(`\nCategory "${category}" (${matching.length} icons):\n`);
        console.log(matching.map(i => i.name).join(', '));
      }
      continue;
    }
    
    if (!query) {
      continue;
    }
    
    const results = fuzzy.filter(query, iconList, {
      extract: (item) => item.searchText
    }) as any[];
    
    console.log(`\nFound ${results.length} matches:\n`);
    results.slice(0, 10).forEach((result: any, idx: number) => {
      console.log(`  ${idx + 1}. ${result.original.name} [${result.original.cats}]`);
    });
    
    if (results.length === 0) {
      continue;
    }
    
    console.log('\nEnter number to select, or any key to search again:');
    const selection = await askQuestion('> ');
    
    const num = parseInt(selection);
    if (num >= 1 && num <= results.length) {
      const selectedIcon = (results[num - 1] as any).original;
      const iconPath = path.join(iconsDir, `${selectedIcon.name}.svg`);
      const svg = fs.readFileSync(iconPath, 'utf-8');
      
      console.log('\n📋 SVG for embedding:');
      console.log(svg);
      console.log(`\n✅ Icon "${selectedIcon.name}" ready!`);
    }
  }
}