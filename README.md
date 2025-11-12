# JS vs WASM Performance Benchmark Framework

一个简单易用的 JavaScript 与 WebAssembly 性能对比测试框架。

## ✨ 特性

- 🚀 **快速上手** - 5分钟添加新测试
- 📦 **模块化** - 测试独立，易于管理
- 🔧 **自动化** - 自动内存管理，自动编译
- 📊 **可视化** - 实时查看性能对比
- 🎯 **类型安全** - 完整的 TypeScript 支持
- ⚡ **SIMD 支持** - 轻松添加 SIMD 优化版本

## 🎬 演示

![Demo Screenshot](docs/demo.png)

## 📦 安装

```bash
# 克隆项目
git clone <your-repo>
cd js-vs-wasm

# 安装依赖
pnpm install

# 编译 WASM
node build-wasm.js

# 启动开发服务器
pnpm run dev
```

## 🚀 5分钟快速开始

### 1. 生成测试

```bash
node tools/add-test.js my-algorithm
```

### 2. 实现算法

编辑生成的文件：
- `src/tests/my-algorithm.test.ts` - TypeScript 实现
- `src/cpp/my-algorithm.cpp` - C++ 实现

### 3. 编译运行

```bash
node build-wasm.js
pnpm run dev
```

查看详细步骤：[QUICKSTART.md](QUICKSTART.md)

## 📖 文档

- [快速开始](QUICKSTART.md) - 5分钟上手指南
- [框架文档](FRAMEWORK.md) - 完整的 API 文档
- [示例测试](src/tests/array-sum.test.ts) - 参考示例

## 🏗️ 项目结构

```
js-vs-wasm/
├── src/
│   ├── framework/           # 框架核心
│   │   ├── types.ts
│   │   ├── test-registry.ts
│   │   ├── wasm-bridge.ts
│   │   └── benchmark-runner.ts
│   │
│   ├── tests/               # 测试模块
│   │   ├── index.ts
│   │   └── *.test.ts
│   │
│   └── cpp/                 # C++ 实现
│
├── tools/
│   └── add-test.js          # 测试生成工具
│
└── build-wasm.js            # WASM 编译脚本
```

## 🎯 使用场景

这个框架适用于：

- ✅ 算法性能对比
- ✅ 数组操作性能测试
- ✅ SIMD 优化效果验证
- ✅ WebAssembly 学习实践
- ✅ 性能优化研究

## 📊 当前测试

- 数组求和 (Sum Array)
- 数组求和 SIMD (Sum Array SIMD)
- 查找最大值 (Find Max)
- 查找最大值 SIMD (Find Max SIMD)
- 矩阵变换 (Matrix Transform)
- 矩阵变换 SIMD (Matrix Transform SIMD)
- ...更多测试

## 🛠️ 技术栈

- **Frontend**: TypeScript + Vite
- **Backend**: C++ + Emscripten + WebAssembly
- **SIMD**: WASM SIMD128
- **Build**: Node.js + Emscripten

## 🤝 贡献

欢迎贡献新的测试用例！

1. Fork 项目
2. 使用 `node tools/add-test.js your-test` 创建测试
3. 实现算法
4. 提交 Pull Request

## 📄 许可证

MIT

## 🙏 致谢

- [Emscripten](https://emscripten.org/) - WebAssembly 工具链
- [WebAssembly SIMD](https://github.com/WebAssembly/simd) - SIMD 支持

---

**开始你的第一个测试吧！** 👉 [QUICKSTART.md](QUICKSTART.md)
