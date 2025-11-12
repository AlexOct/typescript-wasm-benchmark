/**
 * JS vs WASM Benchmark Framework
 * 库的主入口文件 - 作为 npm 包使用
 */

// 导出所有框架功能
export * from './framework';

// 导出 TypeScript 算法实现（可选）
export * as tsAlgorithms from './ts-algorithms';

// 导出测试注册
export { registerAllTests, testRegistry } from './tests';
