/**
 * JS vs WASM Benchmark Framework - WASM Bridge
 * WASM bridge layer - simplify WASM function calls
 */

import type { DataType } from './types';
import { getWasmModuleInstance, type WasmModuleInstance } from './wasm-loader';

/**
 * Get WASM module instance
 */
export function getWasmModule(): WasmModuleInstance {
  return getWasmModuleInstance();
}

/**
 * Memory pool - avoid frequent malloc/free
 */
const memoryPools: Map<string, Float32Array | Uint32Array> = new Map();

/**
 * Allocate Uint32Array memory (with cache)
 */
export function allocateUint32Array(arr: Uint32Array, poolId: string = 'default'): number {
  const module = getWasmModule();
  const byteSize = arr.length * 4;

  // Check memory pool
  let heap = memoryPools.get(poolId) as Uint32Array | undefined;
  if (!heap || heap.byteLength < byteSize) {
    const ptr = module._malloc(byteSize);
    heap = new Uint32Array(module.HEAPU32.buffer, ptr, arr.length);
    memoryPools.set(poolId, heap);
  }

  heap.set(arr);
  return heap.byteOffset;
}

/**
 * Allocate Float32Array memory (with cache)
 */
export function allocateFloat32Array(arr: Float32Array, poolId: string = 'default'): number {
  const module = getWasmModule();
  const byteSize = arr.length * 4;

  // Check memory pool
  let heap = memoryPools.get(poolId) as Float32Array | undefined;
  if (!heap || heap.byteLength < byteSize) {
    const ptr = module._malloc(byteSize);
    heap = new Float32Array(module.HEAPF32.buffer, ptr, arr.length);
    memoryPools.set(poolId, heap);
  }

  heap.set(arr);
  return heap.byteOffset;
}

/**
 * Read Uint32Array
 */
export function readUint32Array(ptr: number, length: number): Uint32Array {
  const module = getWasmModule();
  const heap = new Uint32Array(module.HEAPU32.buffer, ptr, length);
  return new Uint32Array(heap);
}

/**
 * Read Float32Array
 */
export function readFloat32Array(ptr: number, length: number): Float32Array {
  const module = getWasmModule();
  const heap = new Float32Array(module.HEAPF32.buffer, ptr, length);
  return new Float32Array(heap);
}

/**
 * Clear memory pool
 */
export function clearMemoryPools(): void {
  const module = getWasmModule();
  memoryPools.forEach((heap) => {
    module._free(heap.byteOffset);
  });
  memoryPools.clear();
}

/**
 * WASM function wrapper generator
 * Automatically handle memory allocation and data conversion
 */
export function createWasmWrapper<TInput, TOutput>(
  funcName: string,
  inputType: DataType,
  outputType: 'void' | 'number' | 'array'
): (input: TInput) => TOutput {
  const module = getWasmModule();

  return (input: TInput): TOutput => {
    let ptr: number;
    let length: number = 0;

    // Handle input
    if (inputType === 'uint32array' && input instanceof Uint32Array) {
      length = input.length;
      ptr = allocateUint32Array(input, `${funcName}_input`);
    } else if (inputType === 'float32array' && input instanceof Float32Array) {
      length = input.length;
      ptr = allocateFloat32Array(input, `${funcName}_input`);
    } else {
      throw new Error(`Unsupported input type: ${inputType}`);
    }

    // Call WASM function
    let result: any;
    try {
      if (outputType === 'void') {
        module.ccall(funcName, null, ['number', 'number'], [ptr, length]);

        // 如果是 in-place 操作，读取修改后的数据
        if (inputType === 'uint32array') {
          result = readUint32Array(ptr, length) as TOutput;
        } else if (inputType === 'float32array') {
          result = readFloat32Array(ptr, length) as TOutput;
        }
      } else if (outputType === 'number') {
        result = module.ccall(funcName, 'number', ['number', 'number'], [ptr, length]) as TOutput;
      } else if (outputType === 'array') {
        module.ccall(funcName, null, ['number', 'number'], [ptr, length]);
        if (inputType === 'uint32array') {
          result = readUint32Array(ptr, length) as TOutput;
        } else if (inputType === 'float32array') {
          result = readFloat32Array(ptr, length) as TOutput;
        }
      }
    } catch (error) {
      console.error(`WASM function ${funcName} failed:`, error);
      throw error;
    }

    return result;
  };
}

/**
 * Advanced wrapper: support multiple parameters
 */
export interface WasmFuncConfig {
  funcName: string;
  args: Array<{
    type: 'uint32array' | 'float32array' | 'number';
    poolId?: string;
  }>;
  returnType: 'void' | 'number' | 'bigint';
}

export function createAdvancedWasmWrapper(config: WasmFuncConfig): (...args: any[]) => any {
  const module = getWasmModule();

  return (...args: any[]): any => {
    const ptrs: number[] = [];
    const argTypes: string[] = [];
    const argValues: any[] = [];

    try {
      // Process all parameters
      args.forEach((arg, index) => {
        const argConfig = config.args[index];

        if (argConfig.type === 'uint32array' && arg instanceof Uint32Array) {
          const ptr = allocateUint32Array(arg, argConfig.poolId || `arg${index}`);
          ptrs.push(ptr);
          argTypes.push('number', 'number');
          argValues.push(ptr, arg.length);
        } else if (argConfig.type === 'float32array' && arg instanceof Float32Array) {
          const ptr = allocateFloat32Array(arg, argConfig.poolId || `arg${index}`);
          ptrs.push(ptr);
          argTypes.push('number', 'number');
          argValues.push(ptr, arg.length);
        } else if (argConfig.type === 'number') {
          argTypes.push('number');
          argValues.push(arg);
        }
      });

      // Call function
      const returnTypeStr = config.returnType === 'void' ? null : 'number';
      const result = module.ccall(config.funcName, returnTypeStr, argTypes, argValues);

      // Handle return value
      if (config.returnType === 'bigint' && typeof result === 'number') {
        return BigInt(result);
      }
      return result;
    } catch (error) {
      console.error(`WASM function ${config.funcName} failed:`, error);
      throw error;
    }
  };
}
