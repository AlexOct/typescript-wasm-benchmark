/**
 * TypeScript Algorithm Implementations
 * Pure TypeScript versions of the C++ algorithms for performance comparison
 */

/**
 * Sum all elements in the array
 */
export function sumArray(arr: Uint32Array): bigint {
  let sum = 0n;
  for (let i = 0; i < arr.length; i++) {
    sum += BigInt(arr[i]);
  }
  return sum;
}

/**
 * Find maximum element
 */
export function findMax(arr: Uint32Array): number {
  if (arr.length === 0) return 0;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}

/**
 * Find minimum element
 */
export function findMin(arr: Uint32Array): number {
  if (arr.length === 0) return 0;
  let min = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i];
    }
  }
  return min;
}

/**
 * Calculate average
 */
export function calculateAverage(arr: Uint32Array): number {
  if (arr.length === 0) return 0;
  const sum = sumArray(arr);
  return Number(sum) / arr.length;
}

/**
 * Multiply each element by a factor (in-place)
 */
export function multiplyArray(arr: Uint32Array, factor: number): Uint32Array {
  const result = new Uint32Array(arr);
  for (let i = 0; i < result.length; i++) {
    result[i] *= factor;
  }
  return result;
}

/**
 * Count elements greater than threshold
 */
export function countGreaterThan(arr: Uint32Array, threshold: number): number {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > threshold) {
      count++;
    }
  }
  return count;
}

/**
 * Helper function for quicksort - partition
 */
function partition(arr: Uint32Array, low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      // Swap
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }

  // Swap pivot
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;

  return i + 1;
}

/**
 * Quick sort (in-place) - Iterative version to avoid stack overflow
 */
export function quickSort(arr: Uint32Array): Uint32Array {
  if (arr.length <= 1) return new Uint32Array(arr);
  const result = new Uint32Array(arr);

  // Create an auxiliary stack for iterative quicksort
  const stack: number[] = [];

  // Push initial values of low and high to stack
  stack.push(0);
  stack.push(result.length - 1);

  // Keep popping from stack while it's not empty
  while (stack.length > 0) {
    // Pop high and low
    const high = stack.pop()!;
    const low = stack.pop()!;

    // Set pivot element at its correct position
    const pi = partition(result, low, high);

    // If there are elements on left side of pivot, push left side to stack
    if (pi - 1 > low) {
      stack.push(low);
      stack.push(pi - 1);
    }

    // If there are elements on right side of pivot, push right side to stack
    if (pi + 1 < high) {
      stack.push(pi + 1);
      stack.push(high);
    }
  }

  return result;
}

/**
 * Reverse array (in-place)
 */
export function reverseArray(arr: Uint32Array): Uint32Array {
  const result = new Uint32Array(arr);
  for (let i = 0; i < Math.floor(result.length / 2); i++) {
    const temp = result[i];
    result[i] = result[result.length - 1 - i];
    result[result.length - 1 - i] = temp;
  }
  return result;
}

/**
 * Calculate variance
 */
export function calculateVariance(arr: Uint32Array): number {
  if (arr.length === 0) return 0;

  const mean = calculateAverage(arr);
  let variance = 0;

  for (let i = 0; i < arr.length; i++) {
    const diff = arr[i] - mean;
    variance += diff * diff;
  }

  return variance / arr.length;
}

/**
 * Binary search (assumes sorted array)
 */
export function binarySearch(arr: Uint32Array, target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

/**
 * Add value to each element (in-place)
 */
export function addToArray(arr: Uint32Array, value: number): Uint32Array {
  const result = new Uint32Array(arr);
  for (let i = 0; i < result.length; i++) {
    result[i] += value;
  }
  return result;
}

/**
 * Count unique values
 */
export function countUnique(arr: Uint32Array): number {
  if (arr.length === 0) return 0;

  // Create a copy and sort it
  const sorted = quickSort(arr);

  let unique = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1]) {
      unique++;
    }
  }

  return unique;
}

export interface NaryTreeData {
  values: Uint32Array;
  childOffsets: Uint32Array;
  children: Uint32Array;
}

export function sumBinaryTreeDfs(values: Uint32Array): number {
  if (values.length === 0) return 0;

  let sum = 0;
  const stack = new Uint32Array(values.length);
  let stackSize = 0;
  stack[stackSize++] = 0;

  while (stackSize > 0) {
    const nodeIndex = stack[--stackSize];
    sum += values[nodeIndex];

    const rightChild = nodeIndex * 2 + 2;
    const leftChild = nodeIndex * 2 + 1;

    if (rightChild < values.length) {
      stack[stackSize++] = rightChild;
    }
    if (leftChild < values.length) {
      stack[stackSize++] = leftChild;
    }
  }

  return sum;
}

export function sumBinaryTreeBfs(values: Uint32Array): number {
  if (values.length === 0) return 0;

  let sum = 0;
  const queue = new Uint32Array(values.length);
  let head = 0;
  let tail = 0;
  queue[tail++] = 0;

  while (head < tail) {
    const nodeIndex = queue[head++];
    sum += values[nodeIndex];

    const leftChild = nodeIndex * 2 + 1;
    const rightChild = nodeIndex * 2 + 2;

    if (leftChild < values.length) {
      queue[tail++] = leftChild;
    }
    if (rightChild < values.length) {
      queue[tail++] = rightChild;
    }
  }

  return sum;
}

export function sumNaryTreeDfs(tree: NaryTreeData): number {
  const { values, childOffsets, children } = tree;
  if (values.length === 0) return 0;

  let sum = 0;
  const stack = new Uint32Array(values.length);
  let stackSize = 0;
  stack[stackSize++] = 0;

  while (stackSize > 0) {
    const nodeIndex = stack[--stackSize];
    sum += values[nodeIndex];

    const start = childOffsets[nodeIndex];
    const end = childOffsets[nodeIndex + 1];
    for (let childCursor = end; childCursor > start; childCursor--) {
      stack[stackSize++] = children[childCursor - 1];
    }
  }

  return sum;
}

export function sumNaryTreeBfs(tree: NaryTreeData): number {
  const { values, childOffsets, children } = tree;
  if (values.length === 0) return 0;

  let sum = 0;
  const queue = new Uint32Array(values.length);
  let head = 0;
  let tail = 0;
  queue[tail++] = 0;

  while (head < tail) {
    const nodeIndex = queue[head++];
    sum += values[nodeIndex];

    const start = childOffsets[nodeIndex];
    const end = childOffsets[nodeIndex + 1];
    for (let childCursor = start; childCursor < end; childCursor++) {
      queue[tail++] = children[childCursor];
    }
  }

  return sum;
}

export interface StringMapData {
  keys: string[];
  values: Uint32Array;
}

export function createStringMap(data: StringMapData): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < data.keys.length; i++) {
    map.set(data.keys[i], data.values[i]);
  }
  return map;
}

export function insertStringMapEntries(data: StringMapData): number {
  return createStringMap(data).size;
}

export function lookupStringMapEntries(data: StringMapData, map: Map<string, number>): number {
  let checksum = 0;
  for (let i = 0; i < data.keys.length; i++) {
    checksum += map.get(data.keys[i]) ?? 0;
  }
  return checksum;
}

export function deleteStringMapEntries(data: StringMapData, map: Map<string, number>): number {
  for (let i = 0; i < data.keys.length; i++) {
    map.delete(data.keys[i]);
  }
  return map.size;
}

export interface NumberMapData {
  keys: Uint32Array;
  values: Uint32Array;
}

export function createNumberMap(data: NumberMapData): Map<number, number> {
  const map = new Map<number, number>();
  for (let i = 0; i < data.keys.length; i++) {
    map.set(data.keys[i], data.values[i]);
  }
  return map;
}

export function insertNumberMapEntries(data: NumberMapData): number {
  return createNumberMap(data).size;
}

export function lookupNumberMapEntries(data: NumberMapData, map: Map<number, number>): number {
  let checksum = 0;
  for (let i = 0; i < data.keys.length; i++) {
    checksum += map.get(data.keys[i]) ?? 0;
  }
  return checksum;
}

export function deleteNumberMapEntries(data: NumberMapData, map: Map<number, number>): number {
  for (let i = 0; i < data.keys.length; i++) {
    map.delete(data.keys[i]);
  }
  return map.size;
}

/**
 * Apply 4x4 transformation matrix to 3D vectors
 * Input format: [x1, y1, z1, x2, y2, z2, ...]
 * Matrix in column-major order
 */
export function transformVectors(vectors: Float32Array, matrix: Float32Array): Float32Array {
  const result = new Float32Array(vectors);
  const count = vectors.length / 3;

  for (let i = 0; i < count; i++) {
    const x = vectors[i * 3 + 0];
    const y = vectors[i * 3 + 1];
    const z = vectors[i * 3 + 2];

    // Apply transformation matrix (assuming w = 1)
    result[i * 3 + 0] = matrix[0] * x + matrix[4] * y + matrix[8]  * z + matrix[12];
    result[i * 3 + 1] = matrix[1] * x + matrix[5] * y + matrix[9]  * z + matrix[13];
    result[i * 3 + 2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
  }

  return result;
}

/**
 * Create transformation matrix (scale, rotate, translate)
 */
export function createTransformMatrix(
  scaleX: number, scaleY: number, scaleZ: number,
  angleDeg: number,
  transX: number, transY: number, transZ: number
): Float32Array {
  const matrix = new Float32Array(16);
  const angleRad = angleDeg * Math.PI / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  // Column-major 4x4 matrix
  // Column 0
  matrix[0] = scaleX * cosA;
  matrix[1] = scaleX * sinA;
  matrix[2] = 0;
  matrix[3] = 0;

  // Column 1
  matrix[4] = scaleY * -sinA;
  matrix[5] = scaleY * cosA;
  matrix[6] = 0;
  matrix[7] = 0;

  // Column 2
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = scaleZ;
  matrix[11] = 0;

  // Column 3 (translation)
  matrix[12] = transX;
  matrix[13] = transY;
  matrix[14] = transZ;
  matrix[15] = 1;

  return matrix;
}
