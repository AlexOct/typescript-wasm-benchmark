/**
 * 示例测试：数组求和
 * 展示如何使用 Benchmark Framework 添加新测试
 */

import type { TestModule, TestConfig } from '../framework';
import { createWasmWrapper } from '../framework';
import * as tsAlgorithms from '../ts-algorithms';

/**
 * 生成测试数据
 */
function generateRandomArray(size: number): Uint32Array {
  const arr = new Uint32Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = Math.floor(Math.random() * 1000000);
  }
  return arr;
}

/**
 * 数组求和测试模块
 */
export const arraySumTests: TestModule = {
  category: 'Array Operations',

  tests: [
    {
      name: 'Sum Array',
      nameChinese: '数组求和',
      category: 'Array Operations',

      // 准备测试数据
      prepare: (config: TestConfig) => generateRandomArray(config.arraySize),

      // TypeScript 实现
      tsImpl: (arr: Uint32Array) => tsAlgorithms.sumArray(arr),

      // WASM 函数名
      wasmFuncName: 'sumArray',

      // WASM 实现（自动生成包装器）
      wasmImpl: createWasmWrapper<Uint32Array, bigint>(
        'sumArray',
        'uint32array',
        'number'
      ),
    },

    {
      name: 'Sum Array (SIMD)',
      nameChinese: '数组求和 (SIMD)',
      category: 'Array Operations',

      prepare: (config: TestConfig) => generateRandomArray(config.arraySize),

      tsImpl: (arr: Uint32Array) => tsAlgorithms.sumArray(arr),

      wasmFuncName: 'sumArraySIMD',

      wasmImpl: createWasmWrapper<Uint32Array, bigint>(
        'sumArraySIMD',
        'uint32array',
        'number'
      ),
    },
  ],
};
