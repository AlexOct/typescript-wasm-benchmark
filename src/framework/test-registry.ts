/**
 * JS vs WASM Benchmark Framework - Test Registry
 * 测试注册中心
 */

import type { BenchmarkTest, TestModule } from './types';

/**
 * 测试注册器
 * 负责收集和管理所有的测试用例
 */
class TestRegistry {
  private tests: BenchmarkTest[] = [];
  private categories = new Set<string>();

  /**
   * 注册单个测试
   */
  registerTest(test: BenchmarkTest): void {
    this.tests.push(test);
    this.categories.add(test.category);
  }

  /**
   * 注册测试模块
   */
  registerModule(module: TestModule): void {
    module.tests.forEach(test => {
      this.registerTest({
        ...test,
        category: test.category || module.category,
      });
    });
  }

  /**
   * 批量注册测试模块
   */
  registerModules(modules: TestModule[]): void {
    modules.forEach(module => this.registerModule(module));
  }

  /**
   * 获取所有测试
   */
  getAllTests(): BenchmarkTest[] {
    return [...this.tests];
  }

  /**
   * 按分类获取测试
   */
  getTestsByCategory(category: string): BenchmarkTest[] {
    return this.tests.filter(test => test.category === category);
  }

  /**
   * 获取所有分类
   */
  getCategories(): string[] {
    return Array.from(this.categories);
  }

  /**
   * 清空所有测试
   */
  clear(): void {
    this.tests = [];
    this.categories.clear();
  }
}

// 导出单例
export const testRegistry = new TestRegistry();