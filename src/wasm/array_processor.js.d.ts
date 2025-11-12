/**
 * Type definitions for Emscripten-generated WASM module
 * This file provides types for the ES6 module output from Emscripten
 */

export interface WasmModule {
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

declare function createWasmModule(): Promise<WasmModule>;
export default createWasmModule;
