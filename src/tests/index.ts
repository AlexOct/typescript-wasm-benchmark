/**
 * 测试模块索引
 * 在这里导入和注册所有测试模块
 */

import { testRegistry } from '../framework';

// 导入测试模块
import { arraySumTests } from './array-sum.test';
// import { yourNewTest } from './your-new-test.test';

/**
 * 注册所有测试
 */
export function registerAllTests() {
  // 注册测试模块
  testRegistry.registerModule(arraySumTests);
  // testRegistry.registerModule(yourNewTest);

  console.log(`✅ Registered ${testRegistry.getAllTests().length} tests`);
  console.log(`📦 Categories: ${testRegistry.getCategories().join(', ')}`);
}

// 导出 testRegistry 供外部使用
export { testRegistry };
