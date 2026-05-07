# SVG 读取与元数据缓存

`get` 命令的核心职责是从本地 Lucide 仓库的 `icons/` 目录中读取 `.svg` 文件及其配套的 `.json` 元数据，并以可嵌入的结构化格式输出。整个模块围绕 **按需缓存** 和 **输出格式化** 两个设计轴展开，代码量不足 80 行，但覆盖了文件 I/O、Map 缓存、智能参数分割和双格式序列化。 [来源](src/commands/get.ts#L1-L76)

---

## 智能参数分割

Commander.js 将 `licon get <names...>` 的变长参数解析为 `string[]`，但当 AI Agent 或脚本通过单字符串传递多个图标名时（例如 `licon get "home, search"`），数组长度始终为 1。`getCommand` 在进入主循环前执行一次探测：

```
if (names.length === 1 && (names[0].includes(' ') || names[0].includes(','))) {
  names = names[0].split(/[ ,]+/).filter(n => n);
}
```

正则 `/[ ,]+/` 同时兼容空格、逗号以及二者的混合（如 `"home, search user"`），`filter(n => n)` 剔除空串。这意味着调用方无需感知参数的底层传递方式——`licon get home,search` 和 `licon get home search` 行为一致。 [来源](src/commands/get.ts#L49-L51)

---

## 两级缓存架构

### 模块级惰性 Map

`cachedIconMeta` 是一个模块作用域的 `Map<string, { cats: string; tags: string }> | null`，初始值为 `null`。这一设计的意图是：**不初始化时零内存开销**。只有在首次调用 `getIconMeta` 时才创建 Map 实例：

```ts
if (!cachedIconMeta) {
  cachedIconMeta = new Map();
}
```

后续调用先查 Map 是否已命中键名，命中则直接返回，避免重复的文件读取和 `JSON.parse`。 [来源](src/commands/get.ts#L5-L20)

### 元数据解析策略

当缓存未命中时，`getIconMeta` 拼接路径 `{iconsDir}/{name}.json` 并尝试读取。**文件不存在不会报错**——返回 `{ cats: '', tags: '' }`，让调用方可以继续输出 SVG，只是注释部分显示空分类。这种容错设计源于 Lucide 仓库中部分图标可能缺少对应的 `.json` 元数据文件。

读取成功后，从 JSON 中提取 `categories` 和 `tags` 数组，以 `', '` 连接为字符串存入 Map。这意味着缓存中存储的是**已序列化的字符串**而非原始数组——后续输出时无需再次 join。 [来源](src/commands/get.ts#L22-L34)

### 缓存重置

`clearGetCache()` 将 `cachedIconMeta` 赋回 `null`。当前代码库中无任何模块导入此函数，它的存在是为了**外部消费方**（如测试框架、AI Agent 运行时或需要模拟"冷启动"场景的脚本）能够在不重启进程的情况下清空缓存。这种"导出但不使用"的模式在库设计中常见——为扩展点预留接口。 [来源](src/commands/get.ts#L75-L76)

---

## SVG 输出格式

`outputIcon` 根据 `format` 参数（默认 `'svg'`）决定输出风格。 [来源](src/commands/get.ts#L36-L41]

### SVG 模式

```
<!-- name [category1, category2] -->
<svg ...>...</svg>
```

第一行是 HTML/XML 注释，包含图标名称和分类信息。**注释行不可省略**，它承担了元数据标记功能，使 AI Agent 或后处理工具能直接从输出流中识别每个图标的身份。如果元数据文件缺失，输出为 `<!-- name [] -->`。

### JSON 模式

```json
{"name":"home","svg":"<svg ...>...</svg>"}
```

当使用 `-f json` 选项时，输出为单行 JSON——每图标一个独立对象。设计上**不**封装外层的 `[]` 数组，因为多图标输出在各对象之间用 `---` 分隔，保持了流式输出的一致性。AI Agent 可以逐行解析或按分隔符拆分。 [来源](src/commands/get.ts#L56-L68)

---

## 多图标分隔

当 `names` 数组包含多个图标时，每两个图标之间输出一行 `---`。分隔符在两种格式（SVG／JSON）下均生效，这为下游脚本提供了统一的解析边界。 [来源](src/commands/get.ts#L69-L72]

---

## 与命令注册层的协作

`src/index.ts` 将 `get` 命令定义为 `<names...>`（变长参数），并传递 `{ format?: string }` 选项。值得注意的是，注册层**不**处理智能分割逻辑——未经处理的 `names` 数组直接传给 `getCommand`，由后者内部完成分割。这种设计保持了 Commander 配置的简洁性，将"参数归一化"下沉到业务函数中。 [来源](src/index.ts#L23-L27)

---

## 推荐阅读

- [获取 SVG](获取-svg.md) —— `get` 命令的用户视角文档，包含使用示例和输出效果
- [搜索引擎实现](搜索引擎实现.md) —— `search` 命令使用同源的 `.json` 元数据文件，可对比其缓存（图标列表）与 `get` 的缓存（图标元数据）在策略上的异同
- [AI Agent 集成](ai-agent-集成.md) —— SKILL.md 中定义的 `licon get` 使用规则，解释了为何严格的输出格式对 Agent 工作流至关重要