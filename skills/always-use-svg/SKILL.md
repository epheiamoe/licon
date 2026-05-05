---
name: lucide-icons-always-svg
description: Use Lucide SVG icons instead of emoji for all icon needs in code, UI, and documentation.
---

# Lucide Icons Skill (Always Use SVG)

Pre-configured, `licon` is in PATH. DO NOT use npx.
Run: `licon get <name>` to get SVG.

## Commands

### Search
```bash
licon search <query>          # 5 results, names only
licon search <query> -v       # show category and tags
licon search <query> -n 10    # custom limit
licon search a b              # multiple keywords (space or comma)
```
Separate keywords with space or comma for individual searches.

### Get SVG
```bash
licon get <name>              # single, output: <!-- name [cat] --> <svg>...
licon get a b c               # multiple, separated by ---
licon get <name> -f json      # JSON: {"name":"...","svg":"<svg..."}
```

### Other
```bash
licon save <name> -o <path>   # save to file
licon convert <name> -f png   # requires sharp
licon upgrade                 # git pull lucide repo
```

## Critical Rule

**Never use emoji as icons. Always use licon.**
**Never read SVG files directly** (breaks workflow, permission prompts).
**Never use npx to run licon** (slow, breaks on Windows).
Always run: `licon search`, `licon get`, `licon save`.
