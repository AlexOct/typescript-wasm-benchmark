# 作为 npm 包使用

这个框架现在可以作为 npm 包被其他项目使用了！

## 📦 安装

```bash
npm install js-wasm-benchmark
# 或
pnpm add js-wasm-benchmark
```

## 🚀 基本使用

### 1. 导入框架

```typescript
import {
  initWasmModule,
  testRegistry,
  runBenchmarks,
  generateSummary,
  createWasmWrapper,
  type TestConfig,
  type TestModule,
} from 'js-wasm-benchmark';
```

### 2. 初始化 WASM

```typescript
// 在应用启动时初始化一次
await initWasmModule();
```

### 3. 定义你的测试

```typescript
// my-tests.ts
import {
  testRegistry,
  createWasmWrapper,
  type TestModule,
} from 'js-wasm-benchmark';

// TypeScript 实现
function myAlgorithmTS(arr: Uint32Array): number {
  let result = 0;
  for (let i = 0; i < arr.length; i++) {
    result += arr[i];
  }
  return result;
}

// 注册测试
export const myTests: TestModule = {
  category: 'My Algorithms',
  tests: [
    {
      name: 'My Algorithm',
      nameChinese: '我的算法',
      category: 'My Algorithms',

      // 准备测试数据
      prepare: (config) => {
        const arr = new Uint32Array(config.arraySize);
        for (let i = 0; i < config.arraySize; i++) {
          arr[i] = Math.floor(Math.random() * 1000000);
        }
        return arr;
      },

      // TypeScript 实现
      tsImpl: myAlgorithmTS,

      // WASM 函数名
      wasmFuncName: 'myAlgorithm',

      // WASM 包装器（自动处理内存）
      wasmImpl: createWasmWrapper(
        'myAlgorithm',
        'uint32array',
        'number'
      ),
    },
  ],
};

// 注册到全局注册表
testRegistry.registerModule(myTests);
```

### 4. 编写 C++ 实现

```cpp
// my-algorithm.cpp
#include <emscripten.h>
#include <cstdint>

extern "C"
{
    EMSCRIPTEN_KEEPALIVE
    uint32_t myAlgorithm(const uint32_t *arr, uint32_t length)
    {
        uint32_t result = 0;
        for (uint32_t i = 0; i < length; i++)
        {
            result += arr[i];
        }
        return result;
    }
}
```

### 5. 编译你的 C++ 代码

```bash
# 将你的 C++ 函数添加到 WASM 模块中
emcc my-algorithm.cpp -o my-wasm.js \\
  -s WASM=1 \\
  -s EXPORTED_FUNCTIONS=['_myAlgorithm'] \\
  -s EXPORT_ES6=1 \\
  -s MODULARIZE=1
```

### 6. 运行测试

```typescript
import { myTests } from './my-tests';
import {
  initWasmModule,
  runBenchmarks,
  generateSummary,
  type TestConfig,
} from 'js-wasm-benchmark';

async function runMyTests() {
  // 1. 初始化 WASM
  await initWasmModule();

  // 2. 配置测试
  const config: TestConfig = {
    arraySize: 1000000,
    iterations: 10,
    warmupIterations: 2,
  };

  // 3. 运行测试
  const results = await runBenchmarks(
    testRegistry.getAllTests(),
    config,
    (current, total, name) => {
      console.log(`Progress: ${current}/${total} - ${name}`);
    }
  );

  // 4. 生成摘要
  const summary = generateSummary(results);

  console.log('📊 Test Summary:');
  console.log(`  Total Tests: ${summary.totalTests}`);
  console.log(`  WASM Wins: ${summary.wasmWins}`);
  console.log(`  TypeScript Wins: ${summary.tsWins}`);
  console.log(`  Average Speedup: ${summary.avgSpeedup.toFixed(2)}x`);

  // 5. 查看详细结果
  results.forEach(result => {
    console.log(`\\n${result.testName}:`);
    console.log(`  TS:   ${result.tsAvg.toFixed(2)}ms`);
    console.log(`  WASM: ${result.wasmAvg.toFixed(2)}ms`);
    console.log(`  Winner: ${result.winner} (${result.speedup.toFixed(2)}x)`);
  });
}

runMyTests();
```

## 🎨 高级用法

### 自定义数据类型

```typescript
{
  name: 'Complex Algorithm',
  nameChinese: '复杂算法',
  category: 'Advanced',

  // 准备复杂数据
  prepare: (config) => ({
    arr1: new Uint32Array(config.arraySize),
    arr2: new Float32Array(config.arraySize),
    threshold: 500000,
  }),

  tsImpl: (data) => {
    // TypeScript 实现
    return data.arr1[0] + data.arr2[0];
  },

  wasmFuncName: 'complexAlgorithm',

  // 自定义 WASM 包装器
  wasmImpl: (data) => {
    const ptr1 = allocateUint32Array(data.arr1, 'arr1');
    const ptr2 = allocateFloat32Array(data.arr2, 'arr2');

    const module = getWasmModule();
    const result = module.ccall(
      'complexAlgorithm',
      'number',
      ['number', 'number', 'number', 'number', 'number'],
      [ptr1, data.arr1.length, ptr2, data.arr2.length, data.threshold]
    );

    return result;
  },
}
```

### 使用内置算法

```typescript
import {
  initWasmModule,
  tsAlgorithms,  // TypeScript 算法实现
} from 'js-wasm-benchmark';

// 直接使用框架提供的算法
const arr = new Uint32Array([1, 2, 3, 4, 5]);
const sum = tsAlgorithms.sumArray(arr);
console.log('Sum:', sum);
```

### 只导入框架核心

```typescript
// 只使用框架功能，不包含内置测试
import {
  testRegistry,
  runBenchmarks,
  createWasmWrapper,
} from 'js-wasm-benchmark/framework';
```

## 📝 完整示例项目

```typescript
// main.ts
import {
  initWasmModule,
  testRegistry,
  runBenchmarks,
  generateSummary,
  createWasmWrapper,
  type TestModule,
  type TestConfig,
} from 'js-wasm-benchmark';

// 定义测试
const fibonacciTests: TestModule = {
  category: 'Math',
  tests: [
    {
      name: 'Fibonacci',
      nameChinese: '斐波那契',
      category: 'Math',

      prepare: (config) => {
        const arr = new Uint32Array(config.arraySize);
        return arr;
      },

      tsImpl: (arr) => {
        if (arr.length < 2) return arr.length;
        arr[0] = 0;
        arr[1] = 1;
        for (let i = 2; i < arr.length; i++) {
          arr[i] = arr[i - 1] + arr[i - 2];
        }
        return arr[arr.length - 1];
      },

      wasmFuncName: 'fibonacci',
      wasmImpl: createWasmWrapper('fibonacci', 'uint32array', 'number'),
    },
  ],
};

async function main() {
  // 初始化
  await initWasmModule();

  // 注册测试
  testRegistry.registerModule(fibonacciTests);

  // 运行测试
  const config: TestConfig = {
    arraySize: 100,
    iterations: 1000,
    warmupIterations: 10,
  };

  const results = await runBenchmarks(testRegistry.getAllTests(), config);
  const summary = generateSummary(results);

  console.log('Results:', summary);
}

main();
```

## 🔧 TypeScript 配置

确保你的 `tsconfig.json` 包含：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

## 📦 打包配置

### Vite
```javascript
// vite.config.js
export default {
  optimizeDeps: {
    exclude: ['js-wasm-benchmark'],
  },
};
```

### Webpack
```javascript
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
};
```

## 🌟 特性

- ✅ 完整的 TypeScript 类型支持
- ✅ 自动内存管理（内存池）
- ✅ 支持 SIMD 优化
- ✅ 易于扩展
- ✅ 详细的性能统计
- ✅ Tree-shakeable

## 📚 API 文档

查看 [FRAMEWORK.md](./FRAMEWORK.md) 获取完整的 API 文档。

## 💡 提示

1. 记得在使用前调用 `initWasmModule()`
2. WASM 函数需要在编译时正确导出
3. 使用内存池可以显著提升性能
4. 对于大数据集，考虑使用 SIMD 优化

## 🤝 贡献

欢迎提交 Pull Request！

## 📄 许可证

MIT
