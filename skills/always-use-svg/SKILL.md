---
name: lucide-icons-always-svg
description: Use Lucide SVG icons instead of emoji for all icon needs in code, UI, and documentation.
---

# Lucide Icons Skill (Always Use SVG)

This skill ensures you always use Lucide SVG icons instead of emoji when adding visual elements to code, UI, or documentation.

## Setup

First, configure the lucide repository path:

```bash
licon setup
```

If you haven't installed licon yet, install it globally:

```bash
npm install -g licon
```

Or use directly without installation:
```bash
npx -y github:epheiamoe/licon get <icon-name>
```

## Commands

### Getting SVG Icons (For Embedding in Code)

When you need an icon:

**1. Search for the icon name:**
```bash
licon search <keywords>
```

**2. Get the SVG text:**
```bash
licon get <icon-name>
```

This outputs raw SVG that you can embed directly in your code.

**3. List all available icons:**
```bash
licon list
```

## Critical Rule

**NEVER use emoji as icons in code.** When the user asks for an icon, or you need to add visual elements to UI, you MUST use Lucide SVG icons via licon.

## Example System Prompt

```
ICON RULE: When you need to use an icon in code, UI, or documentation, ALWAYS use licon to fetch SVG icons.

1. Search: licon search <keywords>
2. Get SVG: licon get <icon-name>
3. Embed the SVG directly in your code

NEVER use emoji as icons. Only use emoji in plain text communication.
```