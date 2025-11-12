# 🚀 5分钟快速上手

## 目标
在5分钟内添加一个新的性能对比测试

## 步骤

### 1️⃣ 生成测试模板（10秒）

```bash
node tools/add-test.js fibonacci
```

输出：
```
✅ Created: src/tests/fibonacci.test.ts
✅ Created: src/cpp/fibonacci.cpp
✅ Created: src/tests/fibonacci.md
```

### 2️⃣ 实现 TypeScript 版本（1分钟）

打开 `src/tests/fibonacci.test.ts`，找到并修改：

```typescript
function fibonacciTS(arr: Uint32Array): number {
  // 把模板中的求和改成斐波那契
  if (arr.length < 2) return arr.length;

  arr[0] = 0;
  arr[1] = 1;

  for (let i = 2; i < arr.length; i++) {
    arr[i] = arr[i - 1] + arr[i - 2];
  }

  return arr[arr.length - 1];
}
```

### 3️⃣ 实现 C++ 版本（1分钟）

打开 `src/cpp/fibonacci.cpp`，找到并修改：

```cpp
EMSCRIPTEN_KEEPALIVE
uint32_t fibonacci(uint32_t *arr, uint32_t length)
{
    if (length < 2) return length;

    arr[0] = 0;
    arr[1] = 1;

    for (uint32_t i = 2; i < length; i++)
    {
        arr[i] = arr[i - 1] + arr[i - 2];
    }

    return arr[length - 1];
}
```

### 4️⃣ 添加函数到导出列表（30秒）

打开 `build-wasm.js`，在 `EXPORTED_FUNCTIONS` 数组末尾添加：

```javascript
const emccCommand = `emcc src/cpp/array_processor.cpp -o public/array_processor.js ` +
    // ... 其他配置 ...
    `-s EXPORTED_FUNCTIONS=['_malloc','_free', /* ... */ '_fibonacci'] ` +
    // 在末尾添加 '_fibonacci' ↑
```

**注意**：不要忘记在 `_fibonacci` 前面加逗号！

### 5️⃣ 复制 C++ 代码到主文件（30秒）

打开 `src/cpp/array_processor.cpp`，在文件末尾（`} // extern "C"` 之前）粘贴 `fibonacci.cpp` 的内容。

### 6️⃣ 注册测试（30秒）

打开 `src/tests/index.ts`，添加：

```typescript
import { fibonacciTests } from './fibonacci.test';

export function registerAllTests() {
  testRegistry.registerModule(arraySumTests);
  testRegistry.registerModule(fibonacciTests);  // ← 添加这行
}
```

### 7️⃣ 编译和运行（1分钟）

```bash
# 编译 WASM
node build-wasm.js

# 启动开发服务器
pnpm run dev
```

### 8️⃣ 查看结果 🎉

打开浏览器 http://localhost:5173，点击 "Run Benchmark"，你会看到：

```
Fibonacci
TypeScript: 2.45ms
WASM: 1.23ms
Speedup: 1.99x ⚡
```

## 🎯 完成！

你刚刚在5分钟内：
- ✅ 创建了新的测试模块
- ✅ 实现了 TypeScript 版本
- ✅ 实现了 WASM 版本
- ✅ 运行了性能对比
- ✅ 看到了可视化结果

## 🚄 添加 SIMD 优化版本（额外3分钟）

如果你想让 WASM 更快，添加 SIMD 优化：

### 1. C++ SIMD 实现

在 `fibonacci.cpp` 添加：

```cpp
EMSCRIPTEN_KEEPALIVE
uint32_t fibonacciSIMD(uint32_t *arr, uint32_t length)
{
    if (length < 2) return length;

    arr[0] = 0;
    arr[1] = 1;

    uint32_t i = 2;

    // SIMD: 4个元素一组
    for (; i + 4 <= length; i += 4)
    {
        // 手动计算4个斐波那契数
        for (uint32_t j = 0; j < 4; j++)
        {
            arr[i + j] = arr[i + j - 1] + arr[i + j - 2];
        }
    }

    // 处理剩余元素
    for (; i < length; i++)
    {
        arr[i] = arr[i - 1] + arr[i - 2];
    }

    return arr[length - 1];
}
```

### 2. 注册 SIMD 测试

在 `fibonacci.test.ts` 中取消注释 SIMD 部分，并修改名称：

```typescript
{
  name: 'Fibonacci (SIMD)',
  nameChinese: '斐波那契 (SIMD)',
  category: 'Fibonacci',

  prepare: prepareTestData,
  tsImpl: fibonacciTS,
  wasmFuncName: 'fibonacciSIMD',

  wasmImpl: createWasmWrapper<Uint32Array, number>(
    'fibonacciSIMD',
    'uint32array',
    'number'
  ),
},
```

### 3. 导出 SIMD 函数

在 `build-wasm.js` 添加 `'_fibonacciSIMD'`

### 4. 重新编译

```bash
node build-wasm.js
```

### 5. 对比结果

现在你可以看到三个版本的对比：
- TypeScript
- WASM
- WASM (SIMD)

## 💡 更多示例

查看 `src/tests/array-sum.test.ts` 了解更多高级用法。

## 📚 完整文档

阅读 `FRAMEWORK.md` 了解框架的所有功能。
