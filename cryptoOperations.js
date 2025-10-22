const crypto = require('crypto');
const { promisify } = require('util');

const pbkdf2Async = promisify(crypto.pbkdf2);

/**
 * Performs CPU-intensive crypto operations in parallel
 * @param {number} numOperations - Number of crypto operations to perform
 */
async function performCryptoOperations(numOperations) {
  // Password and salt for pbkdf2
  const password = 'test-password-for-benchmarking';
  const salt = crypto.randomBytes(16);
  const iterations = 100000; // High iteration count to make it CPU-intensive
  const keylen = 64;
  const digest = 'sha512';

  // PHASE 1: Perform all pbkdf2 operations in parallel
  const cryptoPromises = Array.from({ length: numOperations }, () =>
    pbkdf2Async(password, salt, iterations, keylen, digest)
  );
  
  const results = await Promise.all(cryptoPromises);

  // Verify all operations completed successfully
  results.forEach((result, index) => {
    if (result.length !== keylen) {
      throw new Error(`Crypto operation ${index} failed: unexpected key length`);
    }
  });

  return results.length;
}

module.exports = { performCryptoOperations };
