# AI Agent 集成

licon 在设计之初就将 **AI Agent** 作为与人类开发者并列的头等用户。`package.json` 的描述明确写道："CLI tool for fetching Lucide icons - designed for AI agents and developers"[来源](package.json#L4-L4)。整个工具的输出格式、命令结构和技能定义文件，都围绕一个核心目标构建：**让 Agent 能用最少的步骤、最确定的输出，获取正确的图标**。

---

## 为什么 Agent 需要专用工具

AI Agent（如 Claude、GPT、Copilot 等）在生成代码或 UI 时经常需要图标。在没有 licon 之前，Agent 通常有两种糟糕的选择：

**使用 emoji** – 简单但不可靠。不同平台渲染不同，在 Web UI、桌面应用或文档中风格不统一，无法作为功能性图标使用。

**直接读取 SVG 文件** – 这要求 Agent 知道 lucide 仓库在本地的确切路径。但这个路径由用户自行配置，写入 `~/.licon.json`[来源](src/config.ts#L4-L4)，Agent 无从知晓。更糟的是，某些运行时环境会弹出文件系统权限提示，导致工作流中断。`SKILL.md` 将此列为**关键规则**："Never read SVG files directly (breaks workflow, permission prompts)"[来源](skills/always-use-svg/SKILL.md#L23-L23)。

licon 解决了这两个问题：它为 Agent 提供了一个**确定的入口**（`licon get <name>`），封装了路径解析、文件读取和元数据附加的全部逻辑。

---

## SKILL.md：Agent 的技能定义文件

`skills/always-use-svg/SKILL.md` 是一个为 AI Agent 设计的**结构化技能文档**。它采用 YAML frontmatter + Markdown 的格式，使 Agent 能够快速解析该技能的名称、描述和使用规则。

### 文件结构

```yaml
---
name: lucide-icons-always-svg
description: Use Lucide SVG icons instead of emoji for all icon needs in code, UI, and documentation.
---
```

frontmatter 中的 `name` 和 `description` 是 Agent 的**技能标识**。当 Agent 的 system prompt 中包含了这项技能，它就知道：凡是需要图标的地方，都应该调用 licon 而非 emoji[来源](skills/always-use-svg/SKILL.md#L1-L4)。

### 关键规则（Critical Rule）

SKILL.md 定义了三条不可违背的规则[来源](skills/always-use-svg/SKILL.md#L21-L24)：

| 规则 | 原因 |
|---|---|
| **Never use emoji as icons** | 风格不一致，渲染不可控 |
| **Never read SVG files directly** | 路径不可知，权限提示破坏自动化 |
| **Never use `npx` to run licon** | `npx` 按需下载导致延迟，Windows 上可能失败 |

第三条规则值得特别说明。SKILL.md 开头就强调 "Pre-configured, `licon` is in PATH"[来源](skills/always-use-svg/SKILL.md#L6-L6)，意味着环境已确保 `licon` 可通过裸命令调用。使用 `npx` 每次都会检查 npm registry，在 Agent 高速迭代的场景下会成为瓶颈。

### 命令速查

SKILL.md 为 Agent 提供了三条子命令的模板[来源](skills/always-use-svg/SKILL.md#L8-L20)：

- **`licon search <query>`** – 搜索图标名，支持 `-v` 查看分类标签、`-n` 限制结果数
- **`licon get <name>`** – 获取 SVG，默认输出带注释格式，支持 `-f json`
- **`licon save` / `licon convert` / `licon upgrade`** – 文件存储、格式转换、仓库更新

---

## Agent System Prompt 模板

`README.md` 包含一个可直接嵌入 Agent system prompt 的简短段落[来源](README.md#L172-L181)：

```text
ICON RULE: When you need an icon in code, UI, or documentation, ALWAYS use licon.

1. Search: licon search <keywords>
2. Get SVG: licon get <icon-name>
3. Embed the SVG directly in your code

Multiple icons: licon get icon1 icon2 icon3
JSON output: licon get <name> --format json

NEVER use emoji as icons.
```

这个模板比 SKILL.md 更精炼，专为**嵌入 Agent 的系统级指令**而设计。它没有解释原理，只有「做什么」和「不做什么」——这正是 system prompt 应有的风格：命令式、无歧义。

`README.md` 还展示了两个典型工作流[来源](README.md#L136-L155)：

**Agent 知道图标名：**
```
Agent: I need an arrow-right icon
Action: licon get arrow-right
Result: SVG output with header comment
```

**Agent 不知道图标名：**
```
Action: licon search arrow
Result: List of matching icon names
Action: licon get arrow-right
Result: SVG output
```

这种「search → get」的两步模式是 Agent 获取图标的标准路径。

---

## 输出格式：为机器解析而优化

`get` 命令提供了两种输出格式，分别适应不同的消费场景[来源](src/commands/get.ts#L21-L27)。

### 默认格式：带注释的 SVG

```svg
<!-- settings [account] -->
<svg xmlns="..." width="24" height="24" viewBox="0 0 24 24" ...>
  <path d="..."/>
</svg>
```

第一行的 HTML 注释包含了**图标名**和**分类**：`<!-- <name> [<categories>] -->`。这对 Agent 意味着：

- **图标名**让 Agent 确认获取的是正确图标
- **分类**提供了语义上下文，Agent 可以据此判断图标是否适合当前场景
- **注释行**和 **SVG 代码**分行输出，Agent 可以按行解析，无需了解 SVG 结构

多个图标时用 `---` 分隔[来源](README.md#L52-L57)：

```svg
<!-- settings [account] -->
<svg>...</svg>
---
<!-- search [text, social] -->
<svg>...</svg>
```

### JSON 格式

```json
{"name":"settings","svg":"<svg ..."}
```

JSON 格式更适合需要**程序化处理**的场景。Agent 可以直接 `JSON.parse()` 输出结果，用 `name` 字段做校验，用 `svg` 字段做嵌入。`get.ts` 中两者共用同一个 `outputIcon` 函数，根据 `format` 参数决定输出方式[来源](src/commands/get.ts#L18-L27)。

### 多图标批量处理

当传入多个图标名时，`getCommand` 会逐个处理、逐个输出。如果某个图标不存在，会输出错误信息但**不会中止后续处理**[来源](src/commands/get.ts#L39-L50]：

```
Icon "nonexistent" not found.
```

这种容错设计对 Agent 很重要——在批量获取时，一个失败不应阻塞整个工作流。

---

## 两级缓存：避免重复 I/O

`get.ts` 实现了一个**两级缓存机制**[来源](src/commands/get.ts#L8-L16)：

1. **元数据缓存** (`cachedIconMeta`) – 存储已查询图标的分类和标签信息
2. **文件系统读取** – 只在缓存未命中时读取 `.json` 元数据文件

第一级是 `Map<string, { cats, tags }>`，以图标名为键。当 Agent 在同一个会话中多次查询同一图标时，可以避免重复的文件 I/O。`clearGetCache()` 函数提供了清除缓存的出口，用于测试或仓库更新后的状态重置[来源](src/commands/get.ts#L55-L57)。

搜索引擎也有类似的缓存机制：`cachedIconList` 缓存全量图标列表，避免每次搜索都重新扫描 `icons/` 目录[来源](src/commands/search.ts#L7-L9)。

---

## 配置系统：路径问题的完整解决方案

Agent 不直接读文件的核心原因是**它不知道文件在哪**。licon 通过配置系统解决了这个问题：

1. **`licon setup`** 引导用户输入 lucide 仓库路径，验证路径有效性后写入 `~/.licon.json`[来源](src/commands/setup.ts#L8-L52)
2. **`getConfig()`** 读取配置，自动拼接 `iconsDir` 路径[来源](src/config.ts#L11-L18)
3. **`ensureSetup()`** 确保配置存在，未配置时提示用户先运行 `licon setup`[来源](src/commands/setup.ts#L55-L62)

这意味着 Agent 只需要执行 `licon get <name>`，路径解析、文件存在性检查、元数据读取全部由 licon 内部完成。`get.ts` 中的路径拼接逻辑[来源](src/commands/get.ts#L36-L37)：

```typescript
const iconsDir = config.iconsDir || path.join(config.repoPath, 'icons');
const iconPath = path.join(iconsDir, `${name}.svg`);
```

`config.iconsDir` 的 fallback 设计（如果配置中未显式设置，则从 `repoPath` 推导）确保了新旧配置格式的兼容性。

---

## 与搜索系统的协同

Agent 的典型工作流始于搜索。`search` 命令基于 `fuzzy` 库实现模糊匹配，搜索范围包括图标名、分类和标签[来源](src/commands/search.ts#L29-L32)。搜索结果默认只返回图标名（简洁、易于解析），`-v` 模式额外展示分类和标签[来源](src/commands/search.ts#L44-L53)。

搜索输出格式为：

```
[settings] 390 results:
settings
settings-2
calendar-cog
```

Agent 可以从输出中提取图标名列表，然后逐一或批量执行 `licon get`。两种输出格式的「可解析性」是设计重点：

- **搜索输出**：每行一个名称，前缀 `[keyword]` 标记查询分组
- **获取输出**：注释行 + SVG 代码，或完整 JSON 对象
- **多查询分隔**：`---` 作为统一的分隔符

---

## 推荐阅读

- [快速开始](快速开始.md) – 完成安装和初始化配置
- [获取 SVG](获取-svg.md) – get 命令的完整用法和参数说明
- [搜索图标](搜索图标.md) – 模糊搜索语法与多查询模式
- [配置系统](配置系统.md) – `~/.licon.json` 的结构和验证逻辑
- [SVG 读取与元数据缓存](svg-读取与元数据缓存.md) – 两级缓存的实现细节