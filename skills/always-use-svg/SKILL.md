---
name: lucide-icons-always-svg
description: Use Lucide SVG icons instead of emoji for all icon needs in code, UI, and documentation.
---

# Lucide Icons Skill (Always Use SVG)

Pre-configured. Run `licon get <name>` to get SVG.

## Commands

### Search
```bash
licon search <query>          # 5 results, names only
licon search <query> -v       # show category and tags
licon search <query> -n 10    # custom limit
licon search a,b              # separate searches (comma)
licon search a b              # AND search (space)
```

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

## From Scratch

Not configured? Clone and setup:
```bash
git clone https://github.com/lucide-icons/lucide.git
npm install -g @epheiamoe/licon
licon setup                   # enter path to cloned lucide/
```