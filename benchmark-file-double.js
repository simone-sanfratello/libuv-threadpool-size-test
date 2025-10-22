const { performFileOperations } = require('./fileOperations');

// Set UV_THREADPOOL_SIZE to double the default (4 * 2 = 8)
process.env.UV_THREADPOOL_SIZE = '8';

const NUM_OPERATIONS = parseInt(process.env.NUM_OPERATIONS)

async function runBenchmark() {
  console.log('Running benchmark with DOUBLE threadpool size (8)...');
  console.log(`UV_THREADPOOL_SIZE: ${process.env.UV_THREADPOOL_SIZE}`);
  
  const startTime = process.hrtime.bigint();
  
  try {
    await performFileOperations(NUM_OPERATIONS);
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
    
    console.log(`Completed ${NUM_OPERATIONS} file operations in ${duration.toFixed(2)} ms`);
    console.log(`Average time per operation: ${(duration / NUM_OPERATIONS).toFixed(2)} ms\n`);
    
    return { config: 'double (8)', duration, avgPerOp: duration / NUM_OPERATIONS };
  } catch (error) {
    console.error('Benchmark failed:', error);
    throw error;
  }
}

if (require.main === module) {
  runBenchmark()
    .then(result => {
      console.log('Benchmark completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}

module.exports = { runBenchmark };
