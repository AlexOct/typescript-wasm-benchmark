// Simple test to verify WASM module loads and works correctly
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function test() {
  console.log('🧪 Testing WASM module...\n');

  try {
    // Load the WASM module
    const wasmCode = readFileSync(join(__dirname, 'public', 'array_processor.wasm'));
    const wasmModule = await WebAssembly.instantiate(wasmCode, {
      a: {
        a: () => { throw new Error('abort called'); },
        b: () => false
      }
    });

    const exports = wasmModule.instance.exports;

    // Test basic functionality
    const testSize = 10;
    const ptr = exports.q(testSize * 4); // malloc

    if (!ptr) {
      throw new Error('Failed to allocate memory');
    }

    console.log('✅ Memory allocation works');

    // Create a test array in WASM memory
    const memory = new Uint32Array(exports.c.buffer);
    const offset = ptr / 4;
    const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    memory.set(testData, offset);

    console.log('✅ Memory write works');

    // Test sumArray
    const sum = exports.e(ptr, testSize);
    const expectedSum = testData.reduce((a, b) => a + b, 0);

    console.log(`Sum result: ${sum} (type: ${typeof sum})`);
    console.log(`Expected: ${expectedSum} (type: ${typeof expectedSum})`);
    console.log(`Are equal: ${sum == expectedSum}`);
    console.log(`Are strictly equal: ${sum === expectedSum}`);

    if (sum == expectedSum) {
      console.log(`✅ sumArray works: ${sum} == ${expectedSum}`);
    } else {
      throw new Error(`sumArray failed: ${sum} != ${expectedSum}`);
    }

    // Test findMax
    const max = exports.f(ptr, testSize);
    const expectedMax = Math.max(...testData);

    if (max === expectedMax) {
      console.log(`✅ findMax works: ${max} === ${expectedMax}`);
    } else {
      throw new Error(`findMax failed: ${max} !== ${expectedMax}`);
    }

    // Test findMin
    const min = exports.g(ptr, testSize);
    const expectedMin = Math.min(...testData);

    if (min === expectedMin) {
      console.log(`✅ findMin works: ${min} === ${expectedMin}`);
    } else {
      throw new Error(`findMin failed: ${min} !== ${expectedMin}`);
    }

    // Free memory
    exports.r(ptr);
    console.log('✅ Memory deallocation works');

    console.log('\n🎉 All WASM tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

test().then(success => {
  process.exit(success ? 0 : 1);
});
