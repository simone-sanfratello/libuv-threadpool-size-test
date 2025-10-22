# UV_THREADPOOL_SIZE Benchmark Suite

This project provides comprehensive benchmarks for testing the impact of Node.js's `UV_THREADPOOL_SIZE` environment variable on different types of operations that use the libuv threadpool.

## Overview

The libuv threadpool is used by Node.js for various asynchronous operations. By default, it has 4 threads, but this can be configured using the `UV_THREADPOOL_SIZE` environment variable. This benchmark suite tests four different operation types:

1. **File I/O** - Async file operations (write, read, delete)
2. **Crypto** - CPU-intensive crypto operations (pbkdf2)
3. **Zlib** - Compression/decompression (gzip/gunzip)
4. **DNS** - DNS lookups (dns.lookup)

## Test Configurations

Each operation type is benchmarked with three threadpool configurations:
- **Default (4 threads)** - The default libuv threadpool size
- **Double (8 threads)** - Double the default size
- **Optimal (CPU count)** - Set to the number of CPU cores on your system

## Project Structure

```
.
├── fileOperations.js           # File I/O operations (1000 ops)
├── cryptoOperations.js         # Crypto operations (100 ops)
├── zlibOperations.js           # Zlib operations (100 ops)
├── dnsOperations.js            # DNS operations (50 ops)
├── benchmark-*.js              # Individual benchmark scripts
├── run-file-benchmarks.js      # File I/O benchmark runner
├── run-crypto-benchmarks.js    # Crypto benchmark runner
├── run-zlib-benchmarks.js      # Zlib benchmark runner
├── run-dns-benchmarks.js       # DNS benchmark runner
└── README.md                   # This file
```

## Running the Benchmarks

### Run All Benchmarks for Each Type

```bash
# File I/O benchmarks (1000 operations)
npm run benchmark:file

# Crypto benchmarks (100 pbkdf2 operations)
npm run benchmark:crypto

# Zlib benchmarks (100 gzip/gunzip operations)
npm run benchmark:zlib

# DNS benchmarks (50 lookup operations)
npm run benchmark:dns
```

### Run Individual Configurations

```bash
# File I/O
npm run benchmark:file:default
npm run benchmark:file:double
npm run benchmark:file:optimal

# Crypto
npm run benchmark:crypto:default
npm run benchmark:crypto:double
npm run benchmark:crypto:optimal

# Zlib
npm run benchmark:zlib:default
npm run benchmark:zlib:double
npm run benchmark:zlib:optimal

# DNS
npm run benchmark:dns:default
npm run benchmark:dns:double
npm run benchmark:dns:optimal
```

## Benchmark Results

Results from a 12-core system (Linux, Node.js v22.19.0):

### 🔐 Crypto Operations (100 pbkdf2)
- **Default (4):** 1903.74 ms - BASELINE
- **Double (8):** 1493.63 ms - ✓ **21.54% faster** 🏆
- **Optimal (12):** 1541.72 ms - ✓ 19.02% faster

**Finding:** Crypto operations benefit significantly from larger threadpool (20%+ improvement).

---

### 📦 Zlib Operations (100 compression/decompression)
- **Default (4):** 173.56 ms - BASELINE
- **Double (8):** 141.99 ms - ✓ 18.19% faster
- **Optimal (12):** 136.05 ms - ✓ **21.61% faster** 🏆

**Finding:** Compression operations show strong improvement with CPU-count threadpool.

---

### 🌐 DNS Operations (50 lookups)
- **Default (4):** 409.35 ms - BASELINE
- **Double (8):** 174.21 ms - ✓ 57.44% faster
- **Optimal (12):** 156.59 ms - ✓ **61.75% faster** 🏆

**Finding:** DNS lookups benefit the MOST from larger threadpool (60%+ improvement!).

---

### 📁 File I/O Operations (1000 files - parallel phases)
- **Default (4):** 215.15 ms - **BASELINE** 🏆
- **Double (8):** 236.69 ms - ✗ 10.01% slower
- **Optimal (12):** 241.96 ms - ✗ 12.46% slower

**Finding:** File I/O with parallel phases (write all → read all → delete all) performs BEST with default threadpool due to lower overhead and filesystem saturation.

## Key Takeaways

### Workload-Dependent Performance

1. **CPU-Bound + I/O Operations (Crypto, Zlib, DNS)**
   - Show significant improvements (18-62%) with larger threadpool
   - DNS lookups benefit the most (61.75% improvement!)
   - More threads = better parallelization for these operations

2. **Pure I/O Operations (File)**
   - Actually slower with larger threadpool
   - Default size has lower overhead
   - Filesystem already saturated with 4 threads

### Recommendations

- **Mixed workload applications:** Set to CPU count for best overall performance
- **Heavy DNS/network applications:** Definitely increase threadpool (50-60% gain!)
- **Crypto-intensive applications:** Use 8+ threads (20% gain)
- **File I/O only applications:** Keep default (4 threads)
- **Compression-heavy applications:** Use CPU count (20% gain)

## How Each Benchmark Works

### File I/O
Performs operations in three parallel phases:
1. Writes 100KB files in parallel
2. Reads all files back in parallel
3. Deletes all files in parallel

### Crypto
Performs pbkdf2 key derivation with high iteration count (100,000 iterations) using SHA-512.

### Zlib
Compresses 100KB of random data in parallel, then decompresses all results in parallel.

### DNS
Performs parallel dns.lookup operations on popular domains (google.com, github.com, etc.).

## Environment Variable

To set `UV_THREADPOOL_SIZE` for your application:

```bash
# Linux/macOS
export UV_THREADPOOL_SIZE=8
node your-app.js

# Windows
set UV_THREADPOOL_SIZE=8
node your-app.js

# Or inline
UV_THREADPOOL_SIZE=8 node your-app.js
```

## Important Notes

- The optimal threadpool size depends heavily on your specific workload
- These benchmarks should be run on your target hardware for accurate results
- Network conditions can significantly affect DNS benchmark results
- File system performance varies by hardware (SSD vs HDD)

## References

- [Node.js CLI Documentation - UV_THREADPOOL_SIZE](https://nodejs.org/api/cli.html#uv_threadpool_sizesize)
- [libuv Documentation](https://docs.libuv.org/en/v1.x/threadpool.html)
- [Understanding the Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
