# licon

CLI tool for fetching Lucide icons - designed for AI agents and human developers.

## Installation

```bash
npm install -g licon
```

Or install locally and link:

```bash
cd E:\dev-ref\licon
npm install
npm link
```

## Setup

On first run, you'll be prompted to configure your local lucide repository path:

```bash
licon setup
```

Or simply run any command - it will guide you through setup if not configured.

## Commands for AI Agents

### Get SVG text (for embedding directly in code)
```bash
licon get arrow-right
```
Output: Raw SVG string that can be embedded directly.

### Save SVG to file
```bash
licon save arrow-right --output ./icons/
```
Output: `Saved: ./icons/arrow-right.svg`

### Search icons by name, tags, or category
```bash
licon search "arrow right"
```
Output:
```
Found 5 icons matching "arrow right":
arrow-right [navigation] (tags: next, forward, direction)
arrow-up-right [navigation] (tags: external, open, link)
...
```

### List all available icons
```bash
licon list
```
Output: `icon-name [category] (tags: tag1, tag2)`

### Browse icons by category
```bash
licon cat navigation
```
Output: Lists all icons in the "navigation" category.

### Convert to different format (PNG, WebP, SVG)
```bash
licon convert arrow-right --format png --output ./icons/
licon convert arrow-right --format webp --output ./icons/
```
Requires `sharp` npm package for PNG/WebP conversion.

### Update local lucide repository
```bash
licon upgrade
```
Runs `git pull` in the lucide repository directory.

## Interactive Mode (Human Use)

Simply run `licon` without arguments to enter interactive picker mode:
```bash
licon
```

Features:
- Fuzzy search for icons
- Browse by category
- Preview SVG before copying

## Configuration

Config stored at `~/.licon.json`:
```json
{
  "repoPath": "/path/to/lucide",
  "iconsDir": "/path/to/lucide/icons"
}
```

## Workflow Examples

### Scenario 1: Agent knows the icon name
```
Agent: I need an arrow-right icon
Action: licon get arrow-right
Result: SVG text output, embedded in code
```

### Scenario 2: Agent doesn't know the icon name
```
Agent: I need an icon for "settings"
Action: licon search settings
Result: List of matching icons with names/tags
Agent: picks "settings" from list
Action: licon get settings
Result: SVG text output, embedded in code
```

### Scenario 3: Save icon as file
```
Agent: Save the "settings" icon to ./src/icons/
Action: licon save settings --output ./src/icons/
Result: File saved at ./src/icons/settings.svg
```

### Scenario 4: Need PNG for display
```
Agent: Convert "settings" icon to PNG
Action: licon convert settings --format png --output ./public/icons/
Result: File saved at ./public/icons/settings.png
```

## Agent System Prompt

When setting up a coding agent, include this instruction:

**Version 1 - Always use SVG (strict):**
```
When you need to use an icon in code, ALWAYS use licon to get SVG icons instead of emoji.
1. Search icons: licon search <keywords>
2. Get SVG: licon get <icon-name>
3. Embed the SVG directly in your code

Never use emoji as icons.
```

**Version 2 - Use SVG when appropriate (flexible):**
```
When you need an icon, prefer using licon to get SVG icons:
1. Search icons: licon search <keywords>
2. Get SVG: licon get <icon-name>
3. Save to file: licon save <icon-name> --output <path>

Use SVG icons for:
- UI elements that need consistent styling
- Icons that need to match design system
- Cases where emoji would look inconsistent

You may use emoji for:
- Simple text communication
- Placeholder content
- When explicitly requested
```