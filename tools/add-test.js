#!/usr/bin/env node

/**
 * 测试生成脚手架工具
 * 使用方法: node tools/add-test.js <test-name>
 * 例如: node tools/add-test.js my-feature
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// 获取测试名称
const testName = process.argv[2];
if (!testName) {
  console.error('❌ Please provide a test name');
  console.error('Usage: node tools/add-test.js <test-name>');
  console.error('Example: node tools/add-test.js my-feature');
  process.exit(1);
}

// 转换为不同的命名格式
const kebabCase = testName.toLowerCase().replace(/\s+/g, '-');
const camelCase = testName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
const chineseName = testName; // 用户自己修改

console.log(`📝 Creating test: ${testName}`);
console.log(`   kebab-case: ${kebabCase}`);
console.log(`   camelCase: ${camelCase}`);
console.log(`   PascalCase: ${pascalCase}`);

// TypeScript 测试文件模板
const tsTemplate = `/**
 * ${pascalCase} 测试
 */

import type { TestModule, TestConfig } from '../framework';
import { createWasmWrapper } from '../framework';

/**
 * 生成测试数据
 */
function prepareTestData(config: TestConfig): Uint32Array {
  const arr = new Uint32Array(config.arraySize);
  for (let i = 0; i < config.arraySize; i++) {
    arr[i] = Math.floor(Math.random() * 1000000);
  }
  return arr;
}

/**
 * TypeScript 实现
 */
function ${camelCase}TS(arr: Uint32Array): number {
  // TODO: 实现你的算法
  let result = 0;
  for (let i = 0; i < arr.length; i++) {
    result += arr[i];
  }
  return result;
}

/**
 * ${pascalCase} 测试模块
 */
export const ${camelCase}Tests: TestModule = {
  category: '${pascalCase}',

  tests: [
    {
      name: '${pascalCase}',
      nameChinese: '${chineseName}',
      category: '${pascalCase}',

      prepare: prepareTestData,

      tsImpl: ${camelCase}TS,

      wasmFuncName: '${camelCase}',

      wasmImpl: createWasmWrapper<Uint32Array, number>(
        '${camelCase}',
        'uint32array',
        'number'
      ),
    },

    // SIMD 版本（可选）
    // {
    //   name: '${pascalCase} (SIMD)',
    //   nameChinese: '${chineseName} (SIMD)',
    //   category: '${pascalCase}',
    //
    //   prepare: prepareTestData,
    //
    //   tsImpl: ${camelCase}TS,
    //
    //   wasmFuncName: '${camelCase}SIMD',
    //
    //   wasmImpl: createWasmWrapper<Uint32Array, number>(
    //     '${camelCase}SIMD',
    //     'uint32array',
    //     'number'
    //   ),
    // },
  ],
};
`;

// C++ 函数模板
const cppTemplate = `
/**
 * ${pascalCase} - ${chineseName}
 * @param arr Pointer to uint32_t array
 * @param length Array length
 * @return Result
 */
EMSCRIPTEN_KEEPALIVE
uint32_t ${camelCase}(const uint32_t *arr, uint32_t length)
{
    // TODO: 实现你的算法
    uint32_t result = 0;
    for (uint32_t i = 0; i < length; i++)
    {
        result += arr[i];
    }
    return result;
}

/**
 * SIMD 优化版本（可选）
 */
EMSCRIPTEN_KEEPALIVE
uint32_t ${camelCase}SIMD(const uint32_t *arr, uint32_t length)
{
    uint32_t result = 0;
    uint32_t i = 0;

    // SIMD 处理 (4个元素一组)
    v128_t result_vec = wasm_i32x4_splat(0);

    for (; i + 4 <= length; i += 4)
    {
        v128_t data = wasm_v128_load(&arr[i]);
        result_vec = wasm_i32x4_add(result_vec, data);
    }

    // 提取 SIMD 结果
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
`;

// README 模板
const readmeTemplate = `# ${pascalCase} 测试

## 功能说明
${chineseName}

## 文件说明
- \`${kebabCase}.test.ts\` - TypeScript 测试定义和实现
- \`${kebabCase}.cpp\` - C++ WASM 实现

## 如何使用

### 1. 实现 TypeScript 版本
在 \`${kebabCase}.test.ts\` 中实现 \`${camelCase}TS\` 函数

### 2. 实现 C++ 版本
在 \`${kebabCase}.cpp\` 中实现 \`${camelCase}\` 函数

### 3. 添加到导出列表
在 \`build-wasm.js\` 的 \`EXPORTED_FUNCTIONS\` 中添加：
\`\`\`
'_${camelCase}',
'_${camelCase}SIMD'  // 如果有 SIMD 版本
\`\`\`

### 4. 注册测试
在 \`src/tests/index.ts\` 中导入并注册：
\`\`\`typescript
import { ${camelCase}Tests } from './${kebabCase}.test';
testRegistry.registerModule(${camelCase}Tests);
\`\`\`

### 5. 编译和运行
\`\`\`bash
node build-wasm.js
pnpm run dev
\`\`\`
`;

// 创建文件
const testsDir = join(projectRoot, 'src', 'tests');
const testFilePath = join(testsDir, `${kebabCase}.test.ts`);
const cppFilePath = join(projectRoot, 'src', 'cpp', `${kebabCase}.cpp`);
const readmeFilePath = join(testsDir, `${kebabCase}.md`);

// 确保目录存在
if (!existsSync(testsDir)) {
  mkdirSync(testsDir, { recursive: true });
}

// 写入文件
try {
  if (existsSync(testFilePath)) {
    console.error(`❌ Test file already exists: ${testFilePath}`);
    process.exit(1);
  }

  writeFileSync(testFilePath, tsTemplate);
  console.log(`✅ Created: ${testFilePath}`);

  writeFileSync(cppFilePath, cppTemplate);
  console.log(`✅ Created: ${cppFilePath}`);

  writeFileSync(readmeFilePath, readmeTemplate);
  console.log(`✅ Created: ${readmeFilePath}`);

  console.log('\\n📋 Next steps:');
  console.log(`1. Edit ${testFilePath} to implement TypeScript version`);
  console.log(`2. Edit ${cppFilePath} to implement C++ version`);
  console.log(`3. Add '_${camelCase}' to EXPORTED_FUNCTIONS in build-wasm.js`);
  console.log(`4. Register the test in src/tests/index.ts`);
  console.log(`5. Run: node build-wasm.js && pnpm run dev`);
} catch (error) {
  console.error('❌ Failed to create files:', error);
  process.exit(1);
}
