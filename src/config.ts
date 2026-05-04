import os from 'os';
import path from 'path';
import fs from 'fs';

const CONFIG_PATH = path.join(os.homedir(), '.licon.json');

export interface Config {
  repoPath: string;
  iconsDir: string;
}

export function getConfig(): Config {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { repoPath: '', iconsDir: '' };
  }
  const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  return {
    repoPath: data.repoPath || '',
    iconsDir: data.iconsDir || path.join(data.repoPath, 'icons')
  };
}

export function saveConfig(repoPath: string): Config {
  const config = {
    repoPath,
    iconsDir: path.join(repoPath, 'icons')
  };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  return config;
}

export function configExists(): boolean {
  return fs.existsSync(CONFIG_PATH);
}

export function isValidRepo(repoPath: string): boolean {
  return fs.existsSync(path.join(repoPath, 'icons')) && fs.existsSync(path.join(repoPath, 'categories'));
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}