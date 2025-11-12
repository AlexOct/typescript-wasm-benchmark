import { execSync } from 'child_process';
import { platform } from 'os';
import { existsSync } from 'fs';

const isWindows = platform() === 'win32';

// Get Emscripten SDK path from environment or use default
const emsdkPath = process.env.EMSDK || (isWindows ? 'E:\\wasmEm\\emsdk' : '~/emsdk');

console.log('🔨 Building WebAssembly module...');
console.log(`Platform: ${platform()}`);
console.log(`Emscripten SDK path: ${emsdkPath}`);

// Check if emsdk exists
if (!existsSync(emsdkPath)) {
    console.error(`❌ Emscripten SDK not found at: ${emsdkPath}`);
    console.error('Please install Emscripten or set EMSDK environment variable');
    console.error('Download from: https://emscripten.org/docs/getting_started/downloads.html');
    process.exit(1);
}

// Emscripten compiler command with SIMD support
// 输出为 ES6 模块，让 Vite 可以直接 import
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
    // Directly execute emcc (assumes it's in PATH)
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
