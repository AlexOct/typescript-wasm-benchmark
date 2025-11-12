/**
 * Main Application Entry Point
 * Handles UI rendering, user interaction, and benchmark execution
 */

import './style.css';
import { initWasmModule } from './framework/wasm-loader';
import { runAllBenchmarks, formatTime, type BenchmarkResult, type TestConfig } from './benchmark';

// DOM Elements
let resultsContainer: HTMLDivElement;
let runButton: HTMLButtonElement;
let arraySizeSelect: HTMLSelectElement;
let iterationsSelect: HTMLSelectElement;
let progressDiv: HTMLDivElement;
let statusDiv: HTMLDivElement;

/**
 * Initialize the application
 */
async function init() {
  console.log('🚀 Initializing application...');

  // Get DOM elements
  resultsContainer = document.getElementById('results') as HTMLDivElement;
  runButton = document.getElementById('runButton') as HTMLButtonElement;
  arraySizeSelect = document.getElementById('arraySize') as HTMLSelectElement;
  iterationsSelect = document.getElementById('iterations') as HTMLSelectElement;
  progressDiv = document.getElementById('progress') as HTMLDivElement;
  statusDiv = document.getElementById('status') as HTMLDivElement;

  // Show loading status
  updateStatus('正在加载 WebAssembly 模块...', 'loading');

  try {
    // Initialize WASM module (使用新的 ES Module 加载方式)
    await initWasmModule();
    updateStatus('✅ WebAssembly 模块加载成功！准备开始测试。', 'success');

    // Enable run button
    runButton.disabled = false;
    runButton.addEventListener('click', runTests);
  } catch (error) {
    console.error('Failed to initialize:', error);
    updateStatus('❌ 初始化失败: ' + (error as Error).message, 'error');
  }
}

/**
 * Update status message
 */
function updateStatus(message: string, type: 'loading' | 'success' | 'error' | 'info') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

/**
 * Update progress during benchmark
 */
function updateProgress(current: number, total: number, testName: string) {
  const percentage = (current / total) * 100;
  progressDiv.innerHTML = `
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${percentage}%"></div>
    </div>
    <div class="progress-text">测试进度: ${current}/${total} - ${testName}</div>
  `;
}

/**
 * Run all benchmark tests
 */
async function runTests() {
  // Disable button during test
  runButton.disabled = true;
  resultsContainer.innerHTML = '';
  progressDiv.style.display = 'block';

  // Get configuration
  const config: TestConfig = {
    arraySize: parseInt(arraySizeSelect.value),
    iterations: parseInt(iterationsSelect.value),
    warmupIterations: 2,
  };

  updateStatus(
    `开始测试... 数组大小: ${config.arraySize.toLocaleString()}, 迭代次数: ${config.iterations}`,
    'info'
  );

  try {
    // Run benchmarks
    const results = await runAllBenchmarks(config, updateProgress);

    // Hide progress
    progressDiv.style.display = 'none';

    // Display results
    displayResults(results);

    updateStatus('✅ 测试完成！', 'success');
  } catch (error) {
    console.error('Test failed:', error);
    updateStatus('❌ 测试失败: ' + (error as Error).message, 'error');
    progressDiv.style.display = 'none';
  } finally {
    // Re-enable button
    runButton.disabled = false;
  }
}

/**
 * Display benchmark results
 */
function displayResults(results: BenchmarkResult[]) {
  // Calculate summary statistics
  const wasmWins = results.filter(r => r.winner === 'WASM').length;
  const tsWins = results.filter(r => r.winner === 'TypeScript').length;
  const avgSpeedup = results.reduce((sum, r) => sum + r.speedup, 0) / results.length;

  // Create summary card
  const summaryHTML = `
    <div class="summary-card">
      <h2>📊 测试总结</h2>
      <div class="summary-stats">
        <div class="stat">
          <div class="stat-label">总测试数</div>
          <div class="stat-value">${results.length}</div>
        </div>
        <div class="stat">
          <div class="stat-label">WASM 胜利</div>
          <div class="stat-value wasm-color">${wasmWins}</div>
        </div>
        <div class="stat">
          <div class="stat-label">TypeScript 胜利</div>
          <div class="stat-value ts-color">${tsWins}</div>
        </div>
        <div class="stat">
          <div class="stat-label">平均加速比</div>
          <div class="stat-value">${avgSpeedup.toFixed(2)}x</div>
        </div>
      </div>
    </div>
  `;

  resultsContainer.innerHTML = summaryHTML;

  // Create result cards
  results.forEach(result => {
    const card = createResultCard(result);
    resultsContainer.appendChild(card);
  });
}

/**
 * Convert test name to function name
 * Example: "Sum Array" -> "sumArray", "Find Max" -> "findMax"
 */
function convertToFuncName(testName: string): string {
  // Remove special chars and convert to camelCase
  return testName
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, index) => {
      word = word.toLowerCase();
      if (index === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
}

/**
 * Create a result card for a single test
 */
function createResultCard(result: BenchmarkResult): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'result-card';

  const winnerClass = result.winner === 'WASM' ? 'wasm-winner' : 'ts-winner';
  const speedupText =
    result.speedup >= 1
      ? `WASM 快 ${result.speedup.toFixed(2)}x`
      : `TypeScript 快 ${(1 / result.speedup).toFixed(2)}x`;

  // Extract function names from testName
  let tsFuncName = '';
  let wasmFuncName = '';

  // Determine function names based on test name
  if (result.testName.includes('SIMD')) {
    // SIMD test
    const baseName = result.testName.replace(' (SIMD)', '');
    tsFuncName = convertToFuncName(baseName);
    wasmFuncName = convertToFuncName(baseName) + 'SIMD';
  } else {
    // Regular test
    const funcName = convertToFuncName(result.testName);
    tsFuncName = funcName;
    wasmFuncName = funcName;
  }

  card.innerHTML = `
    <div class="result-header">
      <h3>${result.testNameChinese} (${result.testName})</h3>
      <span class="winner-badge ${winnerClass}">${speedupText}</span>
    </div>
    <div class="result-body">
      <div class="result-row">
        <div class="result-label">TypeScript</div>
        <div class="result-times">
          <div class="func-name">tsAlgorithms.${tsFuncName}()</div>
          <span class="time-avg">${formatTime(result.tsAvg)}</span>
          <span class="time-detail">min: ${formatTime(result.tsMin)} | max: ${formatTime(result.tsMax)} | median: ${formatTime(result.tsMedian)}</span>
        </div>
      </div>
      <div class="result-row">
        <div class="result-label">WASM</div>
        <div class="result-times">
          <div class="func-name">wasmAlgorithms.${wasmFuncName}()</div>
          <span class="time-avg">${formatTime(result.wasmAvg)}</span>
          <span class="time-detail">min: ${formatTime(result.wasmMin)} | max: ${formatTime(result.wasmMax)} | median: ${formatTime(result.wasmMedian)}</span>
        </div>
      </div>
      <div class="performance-bars">
        <div class="performance-bar ts-bar" style="width: ${Math.min(100, (result.tsAvg / Math.max(result.tsAvg, result.wasmAvg)) * 100)}%">
          <span class="bar-label">TS</span>
        </div>
        <div class="performance-bar wasm-bar" style="width: ${Math.min(100, (result.wasmAvg / Math.max(result.tsAvg, result.wasmAvg)) * 100)}%">
          <span class="bar-label">WASM</span>
        </div>
      </div>
    </div>
  `;

  return card;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
