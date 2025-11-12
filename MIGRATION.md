# 迁移到新的 Vite 加载方式

## 🎯 改动说明

### 之前（旧方式）
```typescript
// 动态加载 script 标签（不标准）
import { initWasm } from './wasm-loader';

await initWasm(); // 从 /public 加载
```

### 现在（新方式）
```typescript
// ES Module import（标准方式）
import { initWasmModule } from './framework/wasm-loader';

await initWasmModule(); // 直接 import WASM 模块
```

## 📦 作为 npm 包使用

现在这个项目可以作为 npm 包使用了！

### 安装

```bash
npm install js-wasm-benchmark
# 或
pnpm add js-wasm-benchmark
```

### 使用

```typescript
import {
  initWasmModule,
  testRegistry,
  runBenchmarks,
  generateSummary,
  type TestConfig,
} from 'js-wasm-benchmark';

// 1. 初始化 WASM 模块
await initWasmModule();

// 2. 注册你的测试
testRegistry.registerModule({
  category: 'My Tests',
  tests: [
    {
      name: 'My Algorithm',
      nameChinese: '我的算法',
      category: 'My Tests',
      prepare: (config) => new Uint32Array(config.arraySize),
      tsImpl: (arr) => { /* TS 实现 */ },
      wasmFuncName: 'myAlgorithm',
      wasmImpl: createWasmWrapper('myAlgorithm', 'uint32array', 'number'),
    },
  ],
});

// 3. 运行测试
const config: TestConfig = {
  arraySize: 1000000,
  iterations: 10,
  warmupIterations: 2,
};

const results = await runBenchmarks(
  testRegistry.getAllTests(),
  config
);

// 4. 查看结果
const summary = generateSummary(results);
console.log('WASM Wins:', summary.wasmWins);
console.log('Avg Speedup:', summary.avgSpeedup);
```

## 🔧 主要改动

### 1. WASM 编译输出
- **之前**: `public/array_processor.js` (UMD 格式)
- **现在**: `src/wasm/array_processor.js` (ES6 Module)

### 2. 加载方式
- **之前**: 动态 `<script>` 标签 + `window.createWasmModule`
- **现在**: ES Module `import createWasmModule from './wasm/array_processor.js'`

### 3. 框架结构
```
src/
├── framework/              # 框架核心
│   ├── wasm-loader.ts     # 新的 ES Module 加载器
│   ├── wasm-bridge.ts     # WASM 桥接层
│   └── ...
├── wasm/                   # WASM 编译输出
│   ├── array_processor.js  # ES6 Module
│   └── array_processor.wasm
└── index.ts                # 库入口
```

### 4. build-wasm.js 配置
```javascript
// 关键改动
`-s EXPORT_ES6=1 ` +              // 输出 ES6 模块
`-o src/wasm/array_processor.js`  // 输出到 src 目录
```

## 🚀 优势

### 作为独立项目
✅ 标准的 ES Module 导入
✅ Vite 原生支持，无需特殊配置
✅ 更好的开发体验（HMR、类型提示）

### 作为 npm 包
✅ 可以被其他项目导入
✅ 支持 Tree Shaking
✅ 完整的 TypeScript 类型定义
✅ 标准的 package.json exports

## 📝 迁移步骤

如果你有现有代码需要迁移：

### 1. 更新导入
```diff
- import { initWasm } from './wasm-loader';
+ import { initWasmModule } from './framework/wasm-loader';
```

### 2. 更新初始化
```diff
- await initWasm();
+ await initWasmModule();
```

### 3. 更新 WASM 桥接（如果直接使用）
```diff
- import { setWasmModule, getWasmModule } from './wasm-loader';
- setWasmModule(module); // 不再需要
+ import { getWasmModule } from './framework/wasm-bridge';
```

### 4. 重新编译 WASM
```bash
node build-wasm.js
```

## ⚠️ 注意事项

1. **WASM 文件位置变化**
   - 不再放在 `public/`，现在在 `src/wasm/`
   - Vite 会自动处理 WASM 文件的加载

2. **不再需要 `public/array_processor.js`**
   - 可以删除 `public/` 目录中的旧文件

3. **ES Module 格式**
   - 使用 `import` 而不是全局 `window.createWasmModule`
   - 更符合现代 JavaScript 规范

4. **开发服务器**
   - Vite 自动处理 WASM 文件
   - 支持 HMR（热模块替换）

## 🎉 完成

现在你的项目：
- ✅ 使用标准的 ES Module 加载 WASM
- ✅ 可以作为 npm 包发布和使用
- ✅ 完全符合 Vite/现代前端工具链的最佳实践
- ✅ 保持了所有原有功能

试试运行：
```bash
pnpm run build:wasm  # 编译 WASM
pnpm run dev         # 启动开发服务器
```
