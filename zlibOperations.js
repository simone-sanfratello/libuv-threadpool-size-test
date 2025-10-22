const zlib = require('zlib');
const { promisify } = require('util');

const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

/**
 * Performs zlib compression/decompression operations in parallel
 * @param {number} numOperations - Number of zlib operations to perform
 */
async function performZlibOperations(numOperations) {
  // Generate test data to compress
  const testData = Buffer.alloc(1024 * 100); // 100KB of data
  for (let i = 0; i < testData.length; i++) {
    testData[i] = Math.floor(Math.random() * 256);
  }

  // PHASE 1: Compress all data in parallel
  const compressPromises = Array.from({ length: numOperations }, () =>
    gzipAsync(testData)
  );
  const compressedResults = await Promise.all(compressPromises);

  // PHASE 2: Decompress all data in parallel
  const decompressPromises = compressedResults.map(compressed =>
    gunzipAsync(compressed)
  );
  const decompressedResults = await Promise.all(decompressPromises);

  // Verify all operations completed successfully
  decompressedResults.forEach((result, index) => {
    if (result.length !== testData.length) {
      throw new Error(`Zlib operation ${index} failed: size mismatch`);
    }
  });

  return decompressedResults.length;
}

module.exports = { performZlibOperations };
