import { execSync } from 'child_process';
import { platform } from 'os';

console.log('🔨 Building WebAssembly module...');
console.log(`Platform: ${platform()}`);

// Check if emcc is available in PATH
try {
  execSync('emcc --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Emscripten compiler (emcc) not found in PATH');
  console.error('');
  console.error('Please install Emscripten and activate the environment:');
  console.error('  1. Download from: https://emscripten.org/docs/getting_started/downloads.html');
  console.error('  2. Install: ./emsdk install latest');
  console.error('  3. Activate: ./emsdk activate latest');
  console.error('  4. Set PATH: source ./emsdk_env.sh (Linux/Mac) or emsdk_env.bat (Windows)');
  console.error('');
  console.error('Or set the EMSDK environment variable to your Emscripten SDK path');
  process.exit(1);
}

// Emscripten compiler command with SIMD support
// Output as ES6 module for direct Vite import
const emccCommand = `emcc src/cpp/array_processor.cpp -o src/wasm/array_processor.js ` +
    `-s WASM=1 ` +
    `-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAP8','HEAPU8','HEAP32','HEAPF32','HEAPU32','HEAPF64'] ` +
    `-s EXPORTED_FUNCTIONS=['_malloc','_free','_sumArray','_findMax','_findMin','_calculateAverage','_multiplyArray','_countGreaterThan','_quickSort','_reverseArray','_calculateVariance','_binarySearch','_addToArray','_countUnique','_sumArraySIMD','_findMaxSIMD','_findMinSIMD','_calculateAverageSIMD','_multiplyArraySIMD','_addToArraySIMD','_countGreaterThanSIMD','_transformVectors','_transformVectorsSIMD','_createTransformMatrix'] ` +
    `-s ALLOW_MEMORY_GROWTH=1 ` +
    `-s INITIAL_MEMORY=33554432 ` +
    `-s MAXIMUM_MEMORY=2147483648 ` +
    `-s MODULARIZE=1 ` +
    `-s EXPORT_NAME="createWasmModule" ` +
    `-s EXPORT_ES6=1 ` +
    `-s ENVIRONMENT=web ` +
    `-msimd128 ` +
    `-O3 ` +
    `--no-entry`;

try {
  console.log('Compiling C++ to WebAssembly...');
  execSync(emccCommand, { stdio: 'inherit' });

  console.log('✅ WebAssembly module built successfully!');
  console.log('📦 Output files:');
  console.log('   - src/wasm/array_processor.js (ES6 Module)');
  console.log('   - src/wasm/array_processor.wasm');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
