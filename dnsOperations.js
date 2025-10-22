const dns = require('dns');
const { promisify } = require('util');

const lookupAsync = promisify(dns.lookup);

/**
 * Performs DNS lookup operations in parallel
 * @param {number} numOperations - Number of DNS lookup operations to perform
 */
async function performDnsOperations(numOperations) {
  // List of popular domains to lookup
  const domains = [
    'google.com',
    'github.com',
    'npmjs.com',
    'nodejs.org',
    'microsoft.com',
    'amazon.com',
    'facebook.com',
    'twitter.com',
    'wikipedia.org',
    'stackoverflow.com'
  ];

  // Perform all DNS lookups in parallel
  const lookupPromises = Array.from({ length: numOperations }, (_, i) => {
    const domain = domains[i % domains.length];
    return lookupAsync(domain);
  });

  const results = await Promise.all(lookupPromises);

  // Verify all operations completed successfully
  results.forEach((result, index) => {
    if (!result || !result.address) {
      throw new Error(`DNS lookup ${index} failed: no address returned`);
    }
  });

  return results.length;
}

module.exports = { performDnsOperations };
