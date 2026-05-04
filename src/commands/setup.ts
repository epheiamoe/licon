import fs from 'fs';
import path from 'path';
import os from 'os';
import { Config, saveConfig, configExists, isValidRepo, getConfig } from '../config.js';
import readline from 'readline';

const CONFIG_PATH = path.join(os.homedir(), '.licon.json');

export async function setupCommand(): Promise<void> {
  console.log('🔧 Lucide CLI Setup\n');
  
  if (configExists()) {
    const config = getConfig();
    console.log(`Current repository: ${config.repoPath}`);
    console.log('You can reconfigure or continue with existing setup.\n');
  }
  
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
  
  console.log('Please enter the path to your local lucide repository.');
  console.log('(Leave empty to use default: ~/projects/lucide or clone fresh)\n');
  
  let repoPath = await askQuestion('Lucide repository path: ');
  
  if (!repoPath) {
    const defaultPath = path.join(os.homedir(), 'projects', 'lucide');
    if (fs.existsSync(defaultPath)) {
      repoPath = defaultPath;
    } else {
      console.log('\nNo default path found. Please enter the path manually.');
      repoPath = await askQuestion('Lucide repository path: ');
    }
  }
  
  if (!fs.existsSync(repoPath)) {
    console.log(`\n❌ Path does not exist: ${repoPath}`);
    console.log('Please clone lucide first or enter a valid path.');
    rl.close();
    process.exit(1);
  }
  
  if (!isValidRepo(repoPath)) {
    console.log(`\n❌ Invalid lucide repository. Missing 'icons/' or 'categories/' directories.`);
    console.log('Please ensure this is a valid lucide clone.');
    rl.close();
    process.exit(1);
  }
  
  saveConfig(repoPath);
  console.log(`\n✅ Configuration saved to: ${CONFIG_PATH}`);
  console.log(`   Repository: ${repoPath}`);
  
  rl.close();
}

export function ensureSetup(): boolean {
  if (configExists()) {
    return true;
  }
  
  console.log('❌ Configuration not found. Please run: licon setup');
  return false;
}