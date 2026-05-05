# licon

CLI tool for fetching Lucide icons - designed for AI agents and human developers.

## Installation

```bash
npm install -g @epheiamoe/licon
```

Or install locally and link:

```bash
cd /path/to/licon
npm install
npm link
```

## Setup

On first run, you'll be prompted to configure your local lucide repository path:

```bash
licon setup
```

Or simply run any command - it will guide you through setup if not configured.

## Commands

### Search icons
```bash
licon search <query>              # Default: 5 results, names only
licon search <query> -v           # Show category and tags
licon search <query> -n 10         # Custom result limit
licon search <query>,             # Multiple queries (comma-separated)
```

**Query syntax:**
- `licon search settings` - Single keyword
- `licon search settings,gear` - Separate searches, outputs marked with [keyword]
- `licon search settings gear` - AND search (icons matching all terms)

**Output:**
```
[settings] 390 results:
settings
settings-2
calendar-cog
wrench
columns-3-cog
```

### Get SVG for embedding
```bash
licon get <name>                  # Single icon
licon get <name1> <name2>        # Multiple icons
licon get <name> --format json   # JSON output
```

**Output (default):**
```svg
<!-- settings [account] -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="..."/>
</svg>
```

**Output (JSON):**
```json
{"name":"settings","svg":"<svg ..."}
```

**Multiple icons:**
```svg
<!-- settings [account] -->
<svg>...</svg>
---
<!-- search [text, social] -->
<svg>...</svg>
```

### Save SVG to file
```bash
licon save <name> --output ./icons/
```
Output: `Saved: ./icons/<name>.svg`

### Convert to different format (PNG, WebP, SVG)
```bash
licon convert <name> --format png --output ./icons/
licon convert <name> --format webp --output ./icons/
```
Requires `sharp` npm package for PNG/WebP conversion.

### List all icons
```bash
licon list
```

### Browse by category
```bash
licon cat <category>    # List icons in category
licon categories        # List all categories
```

### Update local lucide repository
```bash
licon upgrade          # git pull in lucide directory
```

## Interactive Mode (Human Use)

Simply run `licon` without arguments:
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

### Agent knows the icon name
```
Agent: I need an arrow-right icon
Action: licon get arrow-right
Result: SVG output with header comment
```

### Agent doesn't know the icon name
```
Action: licon search arrow
Result: List of matching icon names
Action: licon get arrow-right
Result: SVG output
```

### Multiple icons
```
Action: licon get settings search user
Result: SVG for each icon, separated by ---
```

### Multiple searches
```
Action: licon search settings,gear
Result:
[settings] 390 results:
settings
settings-2
...
---
[gear] 815 results:
gear
cog
...
```

## Agent System Prompt

```
ICON RULE: When you need an icon in code, UI, or documentation, ALWAYS use licon.

1. Search: licon search <keywords>
2. Get SVG: licon get <icon-name>
3. Embed the SVG directly in your code

Multiple icons: licon get icon1 icon2 icon3
JSON output: licon get <name> --format json

NEVER use emoji as icons.
```