---
name: lucide-icons-always-svg
description: Use Lucide SVG icons instead of emoji for all icon needs in code, UI, and documentation.
---

# Lucide Icons Skill (Always Use SVG)

This skill ensures you always use Lucide SVG icons instead of emoji when adding visual elements to code, UI, or documentation.

## Setup

Install licon globally:
```bash
npm install -g licon
```

Or use directly without installation:
```bash
npx -y github:epheiamoe/licon get <icon-name>
```

Configure your local lucide repository:
```bash
licon setup
```

## Commands

### Search for icons

```bash
licon search <query>        # Default: 5 results, names only
licon search <query> -v     # Show category and tags
licon search <query> -n 10  # Custom result limit
licon search <query>,       # Multiple queries (comma-separated)
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
licon get <name>                    # Single icon
licon get <name1> <name2>           # Multiple icons
licon get <name> --format json     # JSON output
```

**Output (default):**
```svg
<!-- settings [account] -->
<svg xmlns="http://www.w3.org/2000/svg" ...>
```

**Output (JSON):**
```json
{"name":"settings","svg":"<svg ..."}
```

### Other useful commands

```bash
licon list                    # List all icons
licon cat <category>          # List icons in category
licon categories              # List all categories
licon upgrade                 # Update lucide repo
```

## Critical Rule

**NEVER use emoji as icons in code.** Always use licon to fetch SVG icons.

## Example System Prompt

```
ICON RULE: When you need an icon in code, UI, or documentation, ALWAYS use licon.

1. Search: licon search <keywords>
2. Get SVG: licon get <icon-name>
3. Embed the SVG directly in your code

Multiple icons: licon get icon1 icon2 icon3
JSON output: licon get <name> --format json

NEVER use emoji as icons.
```