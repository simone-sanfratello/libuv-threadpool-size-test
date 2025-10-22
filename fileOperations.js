const fs = require('fs').promises;
const path = require('path');

/**
 * Creates test files and performs async read/write operations in parallel phases
 * @param {number} numOperations - Number of file operations to perform
 * @param {string} testDir - Directory to perform operations in
 */
async function performFileOperations(numOperations, testDir = './test_files') {
  // Create test directory
  try {
    await fs.mkdir(testDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  // Generate random data for writing
  const testData = Buffer.allocUnsafe(1024 * 100); // 100KB per file

  // Generate file paths
  const filePaths = Array.from({ length: numOperations }, (_, i) => 
    path.join(testDir, `test_${i}.bin`)
  );

  // PHASE 1: Write all files in parallel
  const writePromises = filePaths.map(filePath => 
    fs.writeFile(filePath, testData)
  );
  await Promise.all(writePromises);

  // PHASE 2: Read all files in parallel
  const readPromises = filePaths.map(filePath => 
    fs.readFile(filePath)
  );
  const readResults = await Promise.all(readPromises);

  // Verify data integrity for all files
  readResults.forEach((readData, index) => {
    if (readData.length !== testData.length) {
      throw new Error(`Data mismatch for file ${index}`);
    }
  });

  // PHASE 3: Delete all files in parallel
  const deletePromises = filePaths.map(filePath => 
    fs.unlink(filePath)
  );
  await Promise.all(deletePromises);

  // Cleanup test directory
  try {
    await fs.rmdir(testDir);
  } catch (err) {
    // Directory might not be empty or already deleted
  }
}

module.exports = { performFileOperations };
