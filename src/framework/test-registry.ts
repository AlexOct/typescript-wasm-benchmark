/**
 * JS vs WASM Benchmark Framework - Test Registry
 * Test registry
 */

import type { BenchmarkTest, TestModule } from './types';

/**
 * Test registry class
 * Responsible for collecting and managing all test cases
 */
class TestRegistry {
  private tests: BenchmarkTest[] = [];
  private categories = new Set<string>();

  /**
   * Register a single test
   */
  registerTest(test: BenchmarkTest): void {
    this.tests.push(test);
    this.categories.add(test.category);
  }

  /**
   * Register test module
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
   * 批量Register test module
   */
  registerModules(modules: TestModule[]): void {
    modules.forEach(module => this.registerModule(module));
  }

  /**
   * Get all tests
   */
  getAllTests(): BenchmarkTest[] {
    return [...this.tests];
  }

  /**
   * Get tests by category
   */
  getTestsByCategory(category: string): BenchmarkTest[] {
    return this.tests.filter(test => test.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(this.categories);
  }

  /**
   * Clear all tests
   */
  clear(): void {
    this.tests = [];
    this.categories.clear();
  }
}

// Export singleton
export const testRegistry = new TestRegistry();