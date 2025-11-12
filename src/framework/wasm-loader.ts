/**
 * WASM Module Loader - Vite 标准加载方式
 * 使用 ES Module import，可以作为三方库使用
 */

// 导入 WASM 模块（由 Emscripten 生成的 ES6 模块）
import createWasmModule from '../wasm/array_processor.js';

export interface WasmModuleInstance {
  _malloc(size: number): number;
  _free(ptr: number): void;
  getValue(ptr: number, type: string): number;
  setValue(ptr: number, value: number, type: string): void;
  ccall(
    funcName: string,
    returnType: string | null,
    argTypes: string[],
    args: any[]
  ): any;
  cwrap(
    funcName: string,
    returnType: string | null,
    argTypes: string[]
  ): (...args: any[]) => any;
  HEAPF32: Float32Array;
  HEAP32: Int32Array;
  HEAPU32: Uint32Array;
}

let wasmModuleInstance: WasmModuleInstance | null = null;

/**
 * 初始化 WASM 模块
 */
export async function initWasmModule(): Promise<WasmModuleInstance> {
  if (wasmModuleInstance) {
    return wasmModuleInstance;
  }

  console.log('🔄 Loading WASM module...');

  try {
    // 调用 Emscripten 生成的工厂函数
    wasmModuleInstance = await createWasmModule();

    console.log('✅ WASM module loaded successfully');

    return wasmModuleInstance;
  } catch (error) {
    console.error('❌ Failed to load WASM module:', error);
    throw new Error('Failed to initialize WebAssembly module');
  }
}

/**
 * 获取已加载的 WASM 模块
 */
export function getWasmModuleInstance(): WasmModuleInstance {
  if (!wasmModuleInstance) {
    throw new Error('WASM module not initialized. Call initWasmModule() first.');
  }
  return wasmModuleInstance;
}

/**
 * 导出给外部使用的接口
 */
export const WasmLoader = {
  init: initWasmModule,
  getInstance: getWasmModuleInstance,
};
