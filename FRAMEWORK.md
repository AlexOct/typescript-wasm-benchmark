# JS vs WASM Benchmark Framework

一个简单易用的 JavaScript 与 WebAssembly 性能对比测试框架。

## 🚀 快速开始

### 1. 创建新测试（使用脚手架）

```bash
node tools/add-test.js my-algorithm
```

这会自动生成：
- `src/tests/my-algorithm.test.ts` - TypeScript 测试定义
- `src/cpp/my-algorithm.cpp` - C++ 实现模板
- `src/tests/my-algorithm.md` - 说明文档

### 2. 实现算法

#### TypeScript 实现 (`src/tests/my-algorithm.test.ts`)

```typescript
function myAlgorithmTS(arr: Uint32Array): number {
  let result = 0;
  for (let i = 0; i < arr.length; i++) {
    result += arr[i];  // 你的算法逻辑
  }
  return result;
}
```

#### C++ 实现 (`src/cpp/my-algorithm.cpp`)

```cpp
EMSCRIPTEN_KEEPALIVE
uint32_t myAlgorithm(const uint32_t *arr, uint32_t length)
{
    uint32_t result = 0;
    for (uint32_t i = 0; i < length; i++)
    {
        result += arr[i];  // 你的算法逻辑
    }
    return result;
}
```

### 3. 添加到导出列表

在 `build-wasm.js` 的 `EXPORTED_FUNCTIONS` 数组中添加：

```javascript
'_myAlgorithm',
'_myAlgorithmSIMD'  // 如果有 SIMD 版本
```

### 4. 注册测试

在 `src/tests/index.ts` 中：

```typescript
import { myAlgorithmTests } from './my-algorithm.test';

export function registerAllTests() {
  testRegistry.registerModule(myAlgorithmTests);
}
```

### 5. 编译和运行

```bash
# 编译 WASM
node build-wasm.js

# 运行开发服务器
pnpm run dev
```

## 📁 项目结构

```
js-vs-wasm/
├── src/
│   ├── framework/           # 框架核心
│   │   ├── types.ts         # 类型定义
│   │   ├── test-registry.ts # 测试注册器
│   │   ├── wasm-bridge.ts   # WASM 桥接层
│   │   ├── benchmark-runner.ts # Benchmark 引擎
│   │   └── index.ts         # 框架入口
│   │
│   ├── tests/               # 测试模块目录
│   │   ├── index.ts         # 测试注册中心
│   │   ├── array-sum.test.ts
│   │   └── ...
│   │
│   ├── cpp/                 # C++ 实现
│   │   ├── array_processor.cpp
│   │   └── ...
│   │
│   └── main.ts              # 应用入口
│
├── tools/                   # 工具脚本
│   └── add-test.js          # 测试生成脚手架
│
└── build-wasm.js            # WASM 编译脚本
```

## 🎯 核心概念

### TestModule

一个测试模块可以包含多个相关的测试：

```typescript
export const myTests: TestModule = {
  category: 'My Category',
  tests: [
    {
      name: 'My Algorithm',
      nameChinese: '我的算法',
      category: 'My Category',

      // 准备测试数据
      prepare: (config) => generateTestData(config.arraySize),

      // TypeScript 实现
      tsImpl: (data) => myAlgorithmTS(data),

      // WASM 函数名
      wasmFuncName: 'myAlgorithm',

      // WASM 包装器（自动处理内存）
      wasmImpl: createWasmWrapper(
        'myAlgorithm',
        'uint32array',  // 输入类型
        'number'        // 输出类型
      ),
    },
  ],
};
```

### WASM 包装器

框架提供自动内存管理的 WASM 包装器：

```typescript
// 简单包装器
const wrapper = createWasmWrapper<Uint32Array, number>(
  'myFunction',      // WASM 函数名
  'uint32array',     // 输入类型: uint32array | float32array | number
  'number'           // 输出类型: void | number | array
);

// 高级包装器（多参数）
const advancedWrapper = createAdvancedWasmWrapper({
  funcName: 'myComplexFunction',
  args: [
    { type: 'uint32array', poolId: 'arr1' },
    { type: 'float32array', poolId: 'arr2' },
    { type: 'number' },
  ],
  returnType: 'number',
});
```

## 🔧 支持的数据类型

### Uint32Array
```typescript
{
  prepare: (config) => new Uint32Array(config.arraySize),
  wasmImpl: createWasmWrapper('func', 'uint32array', 'number'),
}
```

### Float32Array
```typescript
{
  prepare: (config) => new Float32Array(config.arraySize * 3),
  wasmImpl: createWasmWrapper('func', 'float32array', 'void'),
}
```

### 自定义数据
```typescript
{
  prepare: (config) => ({
    arr1: new Uint32Array(config.arraySize),
    arr2: new Float32Array(config.arraySize),
    threshold: 500000,
  }),

  wasmImpl: (data) => {
    const ptr1 = allocateUint32Array(data.arr1, 'arr1');
    const ptr2 = allocateFloat32Array(data.arr2, 'arr2');
    const result = getWasmModule().ccall(
      'myFunc',
      'number',
      ['number', 'number', 'number', 'number', 'number'],
      [ptr1, data.arr1.length, ptr2, data.arr2.length, data.threshold]
    );
    return result;
  },
}
```

## 🚄 SIMD 优化

添加 SIMD 版本非常简单：

### C++ SIMD 实现
```cpp
EMSCRIPTEN_KEEPALIVE
uint32_t myAlgorithmSIMD(const uint32_t *arr, uint32_t length)
{
    uint32_t result = 0;
    uint32_t i = 0;

    // SIMD: 4个元素一组
    v128_t result_vec = wasm_i32x4_splat(0);

    for (; i + 4 <= length; i += 4)
    {
        v128_t data = wasm_v128_load(&arr[i]);
        result_vec = wasm_i32x4_add(result_vec, data);
    }

    // 提取结果
    uint32_t lanes[4];
    wasm_v128_store(lanes, result_vec);
    for (int j = 0; j < 4; j++)
    {
        result += lanes[j];
    }

    // 处理剩余元素
    for (; i < length; i++)
    {
        result += arr[i];
    }

    return result;
}
```

### 注册 SIMD 测试
```typescript
{
  name: 'My Algorithm (SIMD)',
  nameChinese: '我的算法 (SIMD)',
  category: 'My Category',

  prepare: (config) => generateTestData(config.arraySize),

  tsImpl: (data) => myAlgorithmTS(data),  // 对比相同的 TS 实现

  wasmFuncName: 'myAlgorithmSIMD',

  wasmImpl: createWasmWrapper('myAlgorithmSIMD', 'uint32array', 'number'),
}
```

## 📊 自定义 UI

框架返回详细的测试结果，你可以自定义展示方式：

```typescript
import { runBenchmarks, generateSummary } from './framework';
import { testRegistry } from './tests';

// 运行测试
const results = await runBenchmarks(
  testRegistry.getAllTests(),
  config,
  (current, total, name) => {
    console.log(`Progress: ${current}/${total} - ${name}`);
  }
);

// 生成摘要
const summary = generateSummary(results);
console.log(`Total: ${summary.totalTests}`);
console.log(`WASM Wins: ${summary.wasmWins}`);
console.log(`Avg Speedup: ${summary.avgSpeedup.toFixed(2)}x`);

// 自定义展示
results.forEach(result => {
  console.log(`${result.testName}:`);
  console.log(`  TS: ${result.tsAvg.toFixed(2)}ms`);
  console.log(`  WASM: ${result.wasmAvg.toFixed(2)}ms`);
  console.log(`  Speedup: ${result.speedup.toFixed(2)}x`);
});
```

## 🎨 示例测试

查看 `src/tests/array-sum.test.ts` 获取完整示例。

## 🔍 调试技巧

### 1. 启用详细日志
```typescript
console.log('Calling WASM function:', funcName);
console.log('Input data:', data);
```

### 2. 检查内存
```typescript
import { getWasmModule } from './framework';
const module = getWasmModule();
console.log('HEAPF32:', module.HEAPF32.buffer.byteLength);
```

### 3. 验证结果
```typescript
const tsResult = test.tsImpl(data);
const wasmResult = test.wasmImpl(data);
console.assert(tsResult === wasmResult, 'Results mismatch!');
```

## 🚀 性能优化技巧

### 1. 使用内存池
框架自动管理内存池，避免频繁 malloc/free：

```typescript
const wrapper = createWasmWrapper('func', 'uint32array', 'number');
// 自动使用内存池 ✅
```

### 2. SIMD 并行处理
每次处理 4 个元素，显著提升性能：

```cpp
for (; i + 4 <= length; i += 4) {
    v128_t data = wasm_v128_load(&arr[i]);
    // 一次处理 4 个元素
}
```

### 3. 减少 JS/WASM 边界调用
批量操作而非单个元素：

```typescript
// ❌ 慢：每个元素都调用
for (let i = 0; i < arr.length; i++) {
  wasmFunc(arr[i]);
}

// ✅ 快：批量处理
wasmFunc(arr);
```

## 📝 最佳实践

1. **测试数据要有代表性** - 使用真实场景的数据规模
2. **预热 (Warmup)** - 框架自动进行预热，让 JIT 优化
3. **多次迭代** - 默认运行多次取平均值，减少误差
4. **对比公平性** - TS 和 WASM 实现相同的算法逻辑
5. **命名清晰** - 使用描述性的测试名称

## 🤝 贡献

添加新测试：
1. `node tools/add-test.js your-test`
2. 实现算法
3. 提交 Pull Request

## 📄 许可证

MIT
