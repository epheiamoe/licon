import { execSync } from 'child_process';
import { Config, getConfig, configExists } from '../config.js';
import { ensureSetup } from './setup.js';

export function upgradeCommand() {
  if (!configExists()) {
    if (!ensureSetup()) {
      return;
    }
  }
  
  const config = getConfig();
  
  if (!config.repoPath) {
    console.error('❌ Repository path not configured. Run "licon setup" first.');
    process.exit(1);
  }
  
  console.log(`Updating lucide repository at: ${config.repoPath}\n`);
  
  try {
    execSync('git pull', {
      cwd: config.repoPath,
      stdio: 'inherit'
    });
    console.log('\n✅ Lucide repository updated successfully!');
  } catch (err) {
    console.log('\n❌ Failed to update. Make sure this is a git repository and you have pull access.');
    process.exit(1);
  }
}