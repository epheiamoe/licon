以下是 **获取 SVG** 页面的完整内容：

---

# 获取 SVG

`licon get` 是整个工具最核心的命令。它的任务只有一个：给你图标——以最纯净、最直接的方式。

如果你是 AI Agent 编写者、文档作者或码代码时想快速插入一个图标，`get` 就是你的主力。

---

## 获取单个图标

最简单的用法——提供一个图标名称，拿到它的 SVG 代码：

```bash
licon get settings
```

输出长这样：

```svg
<!-- settings [account] -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  ...
</svg>
```

SVG 代码可以**直接嵌入** HTML、React 组件、Markdown 或任何支持 SVG 的地方。

在最底层，`getCommand` 函数（`src/commands/get.ts` 第 42 行）接收图标名称列表，然后遍历每个名称，从本地 Lucide 仓库的 `icons/` 目录读取同名 `.svg` 文件：

```typescript
const iconPath = path.join(iconsDir, `${name}.svg`);
const svg = fs.readFileSync(iconPath, 'utf-8');
```

[来源](src/commands/get.ts#L42-L70)

---

## 获取多个图标

一次取多个图标，用空格分隔：

```bash
licon get settings search user
```

输出依次排列，图标之间用 `---` 分隔：

```svg
<!-- settings [account] -->
<svg>...</svg>
---
<!-- search [text, social] -->
<svg>...</svg>
---
<!-- user [account] -->
<svg>...</svg>
```

这在需要批量获取图标时尤为实用，比如 AI Agent 要同时为一组 UI 控件准备图标。

代码中通过一个简单的循环实现：每输出一个图标后，如果不是最后一个，就插入分隔符 `---`：

```typescript
if (i < names.length - 1) {
  console.log('---');
}
```

[来源](src/commands/get.ts#L69-L71)

### 逗号分隔也支持

你还可以用逗号分隔多个图标名称：

```bash
licon get globe,lock,home
```

效果等同于空格分隔。代码中有一段自动检测逻辑：当只有一个参数且包含空格或逗号时，会按 `[ ,]+` 拆分：

```typescript
if (names.length === 1 && (names[0].includes(' ') || names[0].includes(','))) {
  names = names[0].split(/[ ,]+/).filter(n => n);
}
```

[来源](src/commands/get.ts#L48-L50)

---

## `--format json` 输出

如果你需要将图标数据直接交给程序处理（比如 AI Agent 要解析 JSON 来构造 API 请求），使用 `--format json`（或 `-f json`）：

```bash
licon get settings --format json
```

输出：

```json
{"name":"settings","svg":"<svg xmlns=\"http://www.w3.org/2000/svg\" ..."}
```

JSON 格式去掉了注释和分隔符，只保留机器可读的结构。这在以下场景非常有用：

- AI Agent 需要程序化地提取 SVG 字符串
- 将图标数据传递给另一个 API
- 批量处理多个图标的 JSON 结果

代码中，`outputIcon` 函数（第 18 行）根据 `format` 参数决定输出方式：

```typescript
function outputIcon(name: string, svg: string, meta, format: string) {
  if (format === 'json') {
    const jsonOutput = JSON.stringify({ name, svg: svg.trim() });
    console.log(jsonOutput);
  } else {
    console.log(`<!-- ${name} [${meta.cats}] -->`);
    console.log(svg);
  }
}
```

[来源](src/commands/get.ts#L18-L26)

---

## 输出注释：`<!-- name [category] -->`

默认输出（SVG 格式）中，每个 SVG 代码上方都有一行 HTML 注释：

```svg
<!-- settings [account] -->
```

这行注释包含两个信息：

| 部分 | 含义 | 示例 |
|------|------|------|
| `name` | 图标名称 | `settings` |
| `[category]` | 图标所属分类，英文逗号分隔 | `[account]` 或 `[text, social]` |

**注释的作用**：当你把 SVG 粘贴到 HTML 或代码文件中时，注释可以帮助你（或 AI Agent）快速识别这个 SVG 是什么图标、属于哪个分类。更重要的是，分类信息来自 Lucide 官方的元数据，而非猜测。

分类数据来源于同名 `.json` 元数据文件。`getIconMeta` 函数（第 8 行）负责从 `icons/<name>.json` 中读取 `categories` 和 `tags`：

```typescript
const jsonPath = path.join(iconsDir, `${name}.json`);
const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const cats = meta.categories ? meta.categories.join(', ') : '';
const tags = meta.tags ? meta.tags.join(', ') : '';
```

[来源](src/commands/get.ts#L8-L36)

---

## 缓存机制：避免重复文件读取

每次 `get` 一个图标都去磁盘读 `.json` 元数据会很慢——特别是 AI Agent 批量获取时。`getIconMeta` 使用了一个 **模块级缓存**：

```typescript
let cachedIconMeta: Map<string, { cats: string; tags: string }> | null = null;
```

缓存的生命周期：
1. 首次调用 `getIconMeta` 时，创建一个空的 `Map`
2. 每次查询元数据，先检查 `Map` 中是否有该图标的缓存
3. 有缓存 → 直接返回；没有缓存 → 读文件 → 存入 `Map` → 返回
4. 进程运行期间，每个图标只读磁盘一次

```typescript
if (cachedIconMeta.has(name)) {
  return cachedIconMeta.get(name)!;
}
// ... 读取文件、解析、存入缓存 ...
cachedIconMeta.set(name, { cats, tags });
```

如果因某种原因需要清空缓存，可调用 `clearGetCache()`（第 75 行），将 `cachedIconMeta` 重置为 `null`。

[来源](src/commands/get.ts#L6-L36)

详细的缓存设计分析，请参阅 [SVG 读取与元数据缓存](svg-读取与元数据缓存.md)。

---

## 专为 AI Agent 设计

`get` 命令从设计之初就是为了被 **AI Agent 调用** 的。这一点直接体现在它的描述中：

```typescript
.command('get <names...>')
.description('Get SVG text for icon(s) (for AI embedding)')
```

[来源](src/index.ts#L27-L28)

为什么说它专为 Agent 设计？

1. **简洁的输出格式**——SVG 直接打印到 stdout，Agent 可以捕获、解析、嵌入一气呵成
2. **JSON 模式**——Agent 不需要自己写正则解析 SVG
3. **无交互、无提示**——不会弹出选择器，不会问 "Are you sure？"
4. **批量获取**——一个命令拿多个图标，减少调用次数

在 `skills/always-use-svg/SKILL.md` 中定义了 Agent 使用 `get` 的规则：

> **Never use emoji as icons. Always use licon.**
> **Never read SVG files directly** (breaks workflow, permission prompts).

[来源](skills/always-use-svg/SKILL.md#L1-L5)

更多 Agent 集成细节请阅读 [AI Agent 集成](ai-agent-集成.md)。

---

## 与搜索命令配合使用

`get` 的最佳搭档是 `search`。典型的双步工作流：

```bash
# 1. 搜索
licon search arrow -n 3

# 2. 获取
licon get arrow-right arrow-left arrow-up
```

AI Agent 的策略通常是：不知道图标名 → `search` 找 → 确认名称 → `get` 取 SVG。详细的搜索用法请见 [搜索图标](搜索图标.md)。

---

## 错误处理

当指定的图标名称不存在时，`get` 不会中断整个流程——它只会打印一条错误信息，然后继续处理下一个：

```bash
$ licon get nonexistent star
Icon "nonexistent" not found.
<!-- star [shapes] -->
<svg>...</svg>
```

代码中通过 `fs.existsSync(iconPath)` 检查文件是否存在：

```typescript
if (!fs.existsSync(iconPath)) {
  console.error(`Icon "${name}" not found.`);
  continue;
}
```

[来源](src/commands/get.ts#L57-L60)

---

## 快速参考

| 用法 | 命令 | 输出格式 |
|------|------|----------|
| 单个图标 | `licon get home` | 注释 + SVG |
| 多个图标 | `licon get home user lock` | 注释 + SVG，`---` 分隔 |
| JSON 输出 | `licon get home --format json` | `{"name":"home","svg":"..."}` |
| 逗号分隔 | `licon get home,user,lock` | 等同空格分隔 |

---

## 下一步

- 不想手动复制粘贴？试试 [保存与转换](保存与转换.md)——直接用 `licon save` 把图标保存为 `.svg` 文件
- 想知道图标对应的 SVG 文件存放在哪里？阅读 [SVG 读取与元数据缓存](svg-读取与元数据缓存.md) 了解文件结构
- 想从头了解整个工具？回到 [概览](概览.md)