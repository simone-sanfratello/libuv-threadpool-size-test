const { spawn } = require('child_process');
const OS = require('os');

const cpuCount = OS.cpus().length;

function runBenchmarkScript(scriptPath, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting: ${label}`);
    console.log('='.repeat(60));
    
    const startTime = process.hrtime.bigint();
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: { ...process.env }
    });

    child.on('close', (code) => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1_000_000;
      
      if (code === 0) {
        resolve({ label, duration, success: true });
      } else {
        reject(new Error(`${label} failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     UV_THREADPOOL_SIZE Zlib Benchmark Comparison          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`System Information:`);
  console.log(`  - CPU Cores: ${cpuCount}`);
  console.log(`  - Platform: ${OS.platform()}`);
  console.log(`  - Architecture: ${OS.arch()}`);
  console.log(`  - Node.js Version: ${process.version}`);
  console.log(`\nRunning 100 parallel zlib operations (gzip/gunzip) per benchmark...\n`);

  const results = [];

  try {
    const defaultResult = await runBenchmarkScript(
      './benchmark-zlib-default.js',
      'Default Threadpool Size (4)'
    );
    results.push(defaultResult);

    const doubleResult = await runBenchmarkScript(
      './benchmark-zlib-double.js',
      'Double Threadpool Size (8)'
    );
    results.push(doubleResult);

    const optimalResult = await runBenchmarkScript(
      './benchmark-zlib-optimal.js',
      `Optimal Threadpool Size (${cpuCount})`
    );
    results.push(optimalResult);

    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                 ZLIB BENCHMARK RESULTS                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('Configuration Comparison:');
    console.log('-'.repeat(60));
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.label}`);
      console.log(`   Total Time: ${result.duration.toFixed(2)} ms`);
    });

    console.log('\n' + '-'.repeat(60));
    
    const sortedResults = [...results].sort((a, b) => a.duration - b.duration);
    const fastest = sortedResults[0];
    const slowest = sortedResults[sortedResults.length - 1];

    console.log(`\n🏆 FASTEST: ${fastest.label}`);
    console.log(`   Time: ${fastest.duration.toFixed(2)} ms`);
    
    console.log(`\n🐌 SLOWEST: ${slowest.label}`);
    console.log(`   Time: ${slowest.duration.toFixed(2)} ms`);

    console.log('\n📊 Performance Comparison (relative to default):');
    console.log('-'.repeat(60));
    
    const baseline = results[0];
    results.forEach((result, index) => {
      if (index === 0) {
        console.log(`   ${result.label}: BASELINE`);
      } else {
        const improvement = ((baseline.duration - result.duration) / baseline.duration) * 100;
        const symbol = improvement > 0 ? '↑' : '↓';
        const color = improvement > 0 ? '✓' : '✗';
        console.log(`   ${result.label}: ${color} ${symbol} ${Math.abs(improvement).toFixed(2)}%`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('All zlib benchmarks completed successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

main();
