#include <emscripten.h>
#include <cstdint>
#include <algorithm>
#include <cmath>
#include <wasm_simd128.h>
extern "C"
{

    /**
     * Sum all elements in the array
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Sum of all elements
     */
    EMSCRIPTEN_KEEPALIVE
    uint64_t sumArray(const uint32_t *arr, uint32_t length)
    {
        uint64_t sum = 0;
        for (uint32_t i = 0; i < length; i++)
        {
            sum += arr[i];
        }
        return sum;
    }

    /**
     * Find maximum element
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Maximum value
     */
    EMSCRIPTEN_KEEPALIVE
    uint32_t findMax(const uint32_t *arr, uint32_t length)
    {
        if (length == 0)
            return 0;
        uint32_t max = arr[0];
        for (uint32_t i = 1; i < length; i++)
        {

            if (arr[i] > max)
            {
                max = arr[i];
            }
        }
        return max;
    }

    /**
     * Find minimum element
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Minimum value
     */
    EMSCRIPTEN_KEEPALIVE
    uint32_t findMin(const uint32_t *arr, uint32_t length)
    {
        if (length == 0)
            return 0;
        uint32_t min = arr[0];
        for (uint32_t i = 1; i < length; i++)
        {
            if (arr[i] < min)
            {
                min = arr[i];
            }
        }
        return min;
    }

    /**
     * Calculate average
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Average value
     */
    EMSCRIPTEN_KEEPALIVE
    double calculateAverage(const uint32_t *arr, uint32_t length)
    {
        if (length == 0)
            return 0.0;
        uint64_t sum = sumArray(arr, length);
        return static_cast<double>(sum) / length;
    }

    /**
     * Multiply each element by a factor (in-place)
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @param factor Multiplication factor
     */
    EMSCRIPTEN_KEEPALIVE
    void multiplyArray(uint32_t *arr, uint32_t length, uint32_t factor)
    {
        for (uint32_t i = 0; i < length; i++)
        {
            arr[i] *= factor;
        }
    }

    /**
     * Count elements greater than threshold
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @param threshold Threshold value
     * @return Count of elements > threshold
     */
    EMSCRIPTEN_KEEPALIVE
    uint32_t countGreaterThan(const uint32_t *arr, uint32_t length, uint32_t threshold)
    {
        uint32_t count = 0;
        for (uint32_t i = 0; i < length; i++)
        {
            if (arr[i] > threshold)
            {
                count++;
            }
        }
        return count;
    }

    /**
     * Helper function for quicksort - partition
     */
    int partition(uint32_t *arr, int low, int high)
    {
        uint32_t pivot = arr[high];
        int i = low - 1;

        for (int j = low; j < high; j++)
        {
            if (arr[j] <= pivot)
            {
                i++;
                std::swap(arr[i], arr[j]);
            }
        }
        std::swap(arr[i + 1], arr[high]);
        return i + 1;
    }

    /**
     * Quick sort (in-place) - Iterative version to avoid stack overflow
     * @param arr Pointer to uint32_t array
     * @param length Array length
     */
    EMSCRIPTEN_KEEPALIVE
    void quickSort(uint32_t *arr, uint32_t length)
    {
        if (length <= 1)
            return;

        // Create an auxiliary stack for iterative quicksort
        int *stack = new int[length];
        int top = -1;

        // Push initial values of low and high to stack
        stack[++top] = 0;
        stack[++top] = length - 1;

        // Keep popping from stack while it's not empty
        while (top >= 0)
        {
            // Pop high and low
            int high = stack[top--];
            int low = stack[top--];

            // Set pivot element at its correct position
            int pi = partition(arr, low, high);

            // If there are elements on left side of pivot, push left side to stack
            if (pi - 1 > low)
            {
                stack[++top] = low;
                stack[++top] = pi - 1;
            }

            // If there are elements on right side of pivot, push right side to stack
            if (pi + 1 < high)
            {
                stack[++top] = pi + 1;
                stack[++top] = high;
            }
        }

        delete[] stack;
    }

    /**
     * Reverse array (in-place)
     * @param arr Pointer to uint32_t array
     * @param length Array length
     */
    EMSCRIPTEN_KEEPALIVE
    void reverseArray(uint32_t *arr, uint32_t length)
    {
        for (uint32_t i = 0; i < length / 2; i++)
        {
            std::swap(arr[i], arr[length - 1 - i]);
        }
    }

    /**
     * Calculate variance
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Variance
     */
    EMSCRIPTEN_KEEPALIVE
    double calculateVariance(const uint32_t *arr, uint32_t length)
    {
        if (length == 0)
            return 0.0;

        double mean = calculateAverage(arr, length);
        double variance = 0.0;

        for (uint32_t i = 0; i < length; i++)
        {
            double diff = arr[i] - mean;
            variance += diff * diff;
        }

        return variance / length;
    }

    /**
     * Binary search (assumes sorted array)
     * @param arr Pointer to sorted uint32_t array
     * @param length Array length
     * @param target Target value to find
     * @return Index of target, or -1 if not found
     */
    EMSCRIPTEN_KEEPALIVE
    int binarySearch(const uint32_t *arr, uint32_t length, uint32_t target)
    {
        int left = 0;
        int right = length - 1;

        while (left <= right)
        {
            int mid = left + (right - left) / 2;

            if (arr[mid] == target)
            {
                return mid;
            }
            else if (arr[mid] < target)
            {
                left = mid + 1;
            }
            else
            {
                right = mid - 1;
            }
        }

        return -1;
    }

    /**
     * Add value to each element (in-place)
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @param value Value to add
     */
    EMSCRIPTEN_KEEPALIVE
    void addToArray(uint32_t *arr, uint32_t length, uint32_t value)
    {
        for (uint32_t i = 0; i < length; i++)
        {
            arr[i] += value;
        }
    }

    /**
     * Count unique values
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Count of unique values
     */
    EMSCRIPTEN_KEEPALIVE
    uint32_t countUnique(uint32_t *arr, uint32_t length)
    {
        if (length == 0)
            return 0;

        // Create a copy and sort it
        uint32_t *temp = new uint32_t[length];
        for (uint32_t i = 0; i < length; i++)
        {
            temp[i] = arr[i];
        }

        quickSort(temp, length);

        uint32_t unique = 1;
        for (uint32_t i = 1; i < length; i++)
        {
            if (temp[i] != temp[i - 1])
            {
                unique++;
            }
        }

        delete[] temp;
        return unique;
    }

    // ========== SIMD OPTIMIZED VERSIONS ==========

    /**
     * SIMD Sum all elements using SIMD (processes 4 elements at once)
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Sum of all elements
     */
    EMSCRIPTEN_KEEPALIVE
    uint64_t sumArraySIMD(const uint32_t *arr, uint32_t length)
    {
        uint64_t sum = 0;
        uint32_t i = 0;

        // Process 4 elements at a time with SIMD
        v128_t sum_vec = wasm_i32x4_splat(0);

        for (; i + 4 <= length; i += 4)
        {
            v128_t data = wasm_v128_load(&arr[i]);
            sum_vec = wasm_i32x4_add(sum_vec, data);
        }

        // Extract and sum the 4 lanes
        uint32_t lanes[4];
        wasm_v128_store(lanes, sum_vec);
        for (int j = 0; j < 4; j++)
        {
            sum += lanes[j];
        }

        // Handle remaining elements
        for (; i < length; i++)
        {
            sum += arr[i];
        }

        return sum;
    }

    /**
     * SIMD Find maximum using SIMD
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Maximum value
     */
    EMSCRIPTEN_KEEPALIVE
    uint32_t findMaxSIMD(const uint32_t *arr, uint32_t length)
    {
        if (length == 0)
            return 0;

        uint32_t max = arr[0];
        uint32_t i = 0;

        if (length >= 4)
        {
            // Initialize with first 4 elements
            v128_t max_vec = wasm_v128_load(&arr[0]);
            i = 4;

            // Process 4 elements at a time
            for (; i + 4 <= length; i += 4)
            {
                v128_t data = wasm_v128_load(&arr[i]);
                max_vec = wasm_u32x4_max(max_vec, data);
            }

            // Extract maximum from 4 lanes
            uint32_t lanes[4];
            wasm_v128_store(lanes, max_vec);
            max = lanes[0];
            for (int j = 1; j < 4; j++)
            {
                if (lanes[j] > max)
                    max = lanes[j];
            }
        }

        // Handle remaining elements
        for (; i < length; i++)
        {
            if (arr[i] > max)
                max = arr[i];
        }

        return max;
    }

    /**
     * SIMD Find minimum using SIMD
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Minimum value
     */
    EMSCRIPTEN_KEEPALIVE
    uint32_t findMinSIMD(const uint32_t *arr, uint32_t length)
    {
        if (length == 0)
            return 0;

        uint32_t min = arr[0];
        uint32_t i = 0;

        if (length >= 4)
        {
            // Initialize with first 4 elements
            v128_t min_vec = wasm_v128_load(&arr[0]);
            i = 4;

            // Process 4 elements at a time
            for (; i + 4 <= length; i += 4)
            {
                v128_t data = wasm_v128_load(&arr[i]);
                min_vec = wasm_u32x4_min(min_vec, data);
            }

            // Extract minimum from 4 lanes
            uint32_t lanes[4];
            wasm_v128_store(lanes, min_vec);
            min = lanes[0];
            for (int j = 1; j < 4; j++)
            {
                if (lanes[j] < min)
                    min = lanes[j];
            }
        }

        // Handle remaining elements
        for (; i < length; i++)
        {
            if (arr[i] < min)
                min = arr[i];
        }

        return min;
    }

    /**
     * SIMD Multiply using SIMD
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @param factor Multiplication factor
     */
    EMSCRIPTEN_KEEPALIVE
    void multiplyArraySIMD(uint32_t *arr, uint32_t length, uint32_t factor)
    {
        uint32_t i = 0;

        // Create a vector with factor repeated 4 times
        v128_t factor_vec = wasm_i32x4_splat(factor);

        // Process 4 elements at a time
        for (; i + 4 <= length; i += 4)
        {
            v128_t data = wasm_v128_load(&arr[i]);
            v128_t result = wasm_i32x4_mul(data, factor_vec);
            wasm_v128_store(&arr[i], result);
        }

        // Handle remaining elements
        for (; i < length; i++)
        {
            arr[i] *= factor;
        }
    }

    /**
     * SIMD Add value using SIMD
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @param value Value to add
     */
    EMSCRIPTEN_KEEPALIVE
    void addToArraySIMD(uint32_t *arr, uint32_t length, uint32_t value)
    {
        uint32_t i = 0;

        // Create a vector with value repeated 4 times
        v128_t value_vec = wasm_i32x4_splat(value);

        // Process 4 elements at a time
        for (; i + 4 <= length; i += 4)
        {
            v128_t data = wasm_v128_load(&arr[i]);
            v128_t result = wasm_i32x4_add(data, value_vec);
            wasm_v128_store(&arr[i], result);
        }

        // Handle remaining elements
        for (; i < length; i++)
        {
            arr[i] += value;
        }
    }

    /**
     * SIMD Calculate average using SIMD sum
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @return Average value
     */
    EMSCRIPTEN_KEEPALIVE
    double calculateAverageSIMD(const uint32_t *arr, uint32_t length)
    {
        if (length == 0)
            return 0.0;
        uint64_t sum = sumArraySIMD(arr, length);
        return static_cast<double>(sum) / length;
    }

    /**
     * SIMD Count elements greater than threshold using SIMD
     * @param arr Pointer to uint32_t array
     * @param length Array length
     * @param threshold Threshold value
     * @return Count of elements > threshold
     */
    EMSCRIPTEN_KEEPALIVE
    uint32_t countGreaterThanSIMD(const uint32_t *arr, uint32_t length, uint32_t threshold)
    {
        uint32_t count = 0;
        uint32_t i = 0;

        // Create a vector with threshold repeated 4 times
        v128_t threshold_vec = wasm_i32x4_splat(threshold);

        // Process 4 elements at a time
        for (; i + 4 <= length; i += 4)
        {
            v128_t data = wasm_v128_load(&arr[i]);
            // Compare: gt returns -1 (all bits set) for true, 0 for false
            v128_t cmp = wasm_u32x4_gt(data, threshold_vec);

            // Count the number of true comparisons
            // Each true comparison is 0xFFFFFFFF, which is -1 as signed int
            uint32_t lanes[4];
            wasm_v128_store(lanes, cmp);
            for (int j = 0; j < 4; j++)
            {
                if (lanes[j] != 0)
                    count++;
            }
        }

        // Handle remaining elements
        for (; i < length; i++)
        {
            if (arr[i] > threshold)
                count++;
        }

        return count;
    }

    /**
     * Apply 4x4 transformation matrix to 3D vectors
     * Input format: [x1, y1, z1, x2, y2, z2, ...]
     * Matrix in column-major order
     * @param vectors Input array of 3D vectors (x,y,z repeated)
     * @param matrix 4x4 transformation matrix (16 elements)
     * @param count Number of vectors (length / 3)
     */
    EMSCRIPTEN_KEEPALIVE
    void transformVectors(float *vectors, const float *matrix, uint32_t count)
    {
        for (uint32_t i = 0; i < count; i++)
        {
            float x = vectors[i * 3 + 0];
            float y = vectors[i * 3 + 1];
            float z = vectors[i * 3 + 2];

            // Apply transformation matrix (assuming w = 1)
            vectors[i * 3 + 0] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
            vectors[i * 3 + 1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
            vectors[i * 3 + 2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
        }
    }

    /**
     * SIMD SIMD optimized transformation
     * Process 4 vectors at once using SIMD
     */
    EMSCRIPTEN_KEEPALIVE
    void transformVectorsSIMD(float *vectors, const float *matrix, uint32_t count)
    {
        // Extract matrix elements for SIMD operations
        v128_t m00 = wasm_f32x4_splat(matrix[0]);
        v128_t m10 = wasm_f32x4_splat(matrix[1]);
        v128_t m20 = wasm_f32x4_splat(matrix[2]);

        v128_t m01 = wasm_f32x4_splat(matrix[4]);
        v128_t m11 = wasm_f32x4_splat(matrix[5]);
        v128_t m21 = wasm_f32x4_splat(matrix[6]);

        v128_t m02 = wasm_f32x4_splat(matrix[8]);
        v128_t m12 = wasm_f32x4_splat(matrix[9]);
        v128_t m22 = wasm_f32x4_splat(matrix[10]);

        v128_t m03 = wasm_f32x4_splat(matrix[12]);
        v128_t m13 = wasm_f32x4_splat(matrix[13]);
        v128_t m23 = wasm_f32x4_splat(matrix[14]);

        uint32_t i = 0;

        // Process 4 vectors at a time
        for (; i + 4 <= count; i += 4)
        {
            // Extract x, y, z components for 4 vectors
            float xs[4] = {
                vectors[i * 3 + 0],
                vectors[(i + 1) * 3 + 0],
                vectors[(i + 2) * 3 + 0],
                vectors[(i + 3) * 3 + 0]};
            float ys[4] = {
                vectors[i * 3 + 1],
                vectors[(i + 1) * 3 + 1],
                vectors[(i + 2) * 3 + 1],
                vectors[(i + 3) * 3 + 1]};
            float zs[4] = {
                vectors[i * 3 + 2],
                vectors[(i + 1) * 3 + 2],
                vectors[(i + 2) * 3 + 2],
                vectors[(i + 3) * 3 + 2]};

            v128_t x = wasm_v128_load(xs);
            v128_t y = wasm_v128_load(ys);
            v128_t z = wasm_v128_load(zs);

            // Calculate new x: m00*x + m01*y + m02*z + m03
            v128_t nx = wasm_f32x4_add(
                wasm_f32x4_add(
                    wasm_f32x4_mul(x, m00),
                    wasm_f32x4_mul(y, m01)),
                wasm_f32x4_add(
                    wasm_f32x4_mul(z, m02),
                    m03));

            // Calculate new y: m10*x + m11*y + m12*z + m13
            v128_t ny = wasm_f32x4_add(
                wasm_f32x4_add(
                    wasm_f32x4_mul(x, m10),
                    wasm_f32x4_mul(y, m11)),
                wasm_f32x4_add(
                    wasm_f32x4_mul(z, m12),
                    m13));

            // Calculate new z: m20*x + m21*y + m22*z + m23
            v128_t nz = wasm_f32x4_add(
                wasm_f32x4_add(
                    wasm_f32x4_mul(x, m20),
                    wasm_f32x4_mul(y, m21)),
                wasm_f32x4_add(
                    wasm_f32x4_mul(z, m22),
                    m23));

            // Store results back
            float nxs[4], nys[4], nzs[4];
            wasm_v128_store(nxs, nx);
            wasm_v128_store(nys, ny);
            wasm_v128_store(nzs, nz);

            vectors[i * 3 + 0] = nxs[0];
            vectors[i * 3 + 1] = nys[0];
            vectors[i * 3 + 2] = nzs[0];

            vectors[(i + 1) * 3 + 0] = nxs[1];
            vectors[(i + 1) * 3 + 1] = nys[1];
            vectors[(i + 1) * 3 + 2] = nzs[1];

            vectors[(i + 2) * 3 + 0] = nxs[2];
            vectors[(i + 2) * 3 + 1] = nys[2];
            vectors[(i + 2) * 3 + 2] = nzs[2];

            vectors[(i + 3) * 3 + 0] = nxs[3];
            vectors[(i + 3) * 3 + 1] = nys[3];
            vectors[(i + 3) * 3 + 2] = nzs[3];
        }

        // Handle remaining vectors
        for (; i < count; i++)
        {
            float x = vectors[i * 3 + 0];
            float y = vectors[i * 3 + 1];
            float z = vectors[i * 3 + 2];

            vectors[i * 3 + 0] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
            vectors[i * 3 + 1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
            vectors[i * 3 + 2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
        }
    }

    /**
     * Create transformation matrix (scale, rotate, translate)
     * @param matrix Output 4x4 matrix (16 floats)
     * @param scale_x Scale factor X
     * @param scale_y Scale factor Y
     * @param scale_z Scale factor Z
     * @param angle_deg Rotation angle in degrees (around Z axis)
     * @param trans_x Translation X
     * @param trans_y Translation Y
     * @param trans_z Translation Z
     */
    EMSCRIPTEN_KEEPALIVE
    void createTransformMatrix(
        float *matrix,
        float scale_x, float scale_y, float scale_z,
        float angle_deg,
        float trans_x, float trans_y, float trans_z)
    {
        float angle_rad = angle_deg * 3.14159265359f / 180.0f;
        float cos_a = std::cos(angle_rad);
        float sin_a = std::sin(angle_rad);

        // Column-major 4x4 matrix: Scale * Rotation * Translation
        // Column 0
        matrix[0] = scale_x * cos_a;
        matrix[1] = scale_x * sin_a;
        matrix[2] = 0.0f;
        matrix[3] = 0.0f;

        // Column 1
        matrix[4] = scale_y * -sin_a;
        matrix[5] = scale_y * cos_a;
        matrix[6] = 0.0f;
        matrix[7] = 0.0f;

        // Column 2
        matrix[8] = 0.0f;
        matrix[9] = 0.0f;
        matrix[10] = scale_z;
        matrix[11] = 0.0f;

        // Column 3 (translation)
        matrix[12] = trans_x;
        matrix[13] = trans_y;
        matrix[14] = trans_z;
        matrix[15] = 1.0f;
    }

} // extern "C"
