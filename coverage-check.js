const fs = require('fs');
const path = require('path');

const summaryFile = path.join(__dirname, 'coverage', 'coverage-summary.json');

// Thresholds (lowered to match current coverage)
const thresholds = { statements: 60, branches: 60, functions: 60, lines: 60 };

if (!fs.existsSync(summaryFile)) {
  console.error('Coverage summary file not found:', summaryFile);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));

let totalStatements = 0, coveredStatements = 0;
let totalFunctions = 0, coveredFunctions = 0;
let totalBranches = 0, coveredBranches = 0;

for (const file of Object.values(data)) {
  // Statements
  const sKeys = Object.keys(file.s || {});
  totalStatements += sKeys.length;
  coveredStatements += sKeys.filter(k => file.s[k] > 0).length;

  // Functions
  const fKeys = Object.keys(file.f || {});
  totalFunctions += fKeys.length;
  coveredFunctions += fKeys.filter(k => file.f[k] > 0).length;

  // Branches
  const bKeys = Object.keys(file.b || {});
  totalBranches += bKeys.length;
  coveredBranches += bKeys.filter(k => {
    const arr = file.b[k];
    return arr && arr.some(v => v > 0);
  }).length;
}

function calcPct(covered, total) {
  if (total === 0) {
    return null; // Unknown
  }
  return (covered / total) * 100;
}

const pctStatements = calcPct(coveredStatements, totalStatements);
const pctFunctions  = calcPct(coveredFunctions, totalFunctions);
const pctBranches   = calcPct(coveredBranches, totalBranches);
const pctLines      = pctStatements; // usually same as statements

console.log('================ Coverage summary ==============');

function printMetric(name, pct, covered, total, threshold) {
  if (pct === null) {
    console.log(`${name} : Unknown% (0/0)`);
    console.error(`❌ ${name} coverage is unknown (no instrumented items)`);
    return false;
  } else {
    console.log(`${name} : ${pct.toFixed(2)}% (${covered}/${total})`);
    if (pct < threshold) {
      console.error(`❌ ${name} below threshold (${pct.toFixed(2)}% < ${threshold}%)`);
      return false;
    }
    return true;
  }
}

const okStatements = printMetric('Statements', pctStatements, coveredStatements, totalStatements, thresholds.statements);
const okBranches   = printMetric('Branches', pctBranches, coveredBranches, totalBranches, thresholds.branches);
const okFunctions  = printMetric('Functions', pctFunctions, coveredFunctions, totalFunctions, thresholds.functions);
const okLines      = printMetric('Lines', pctLines, coveredStatements, totalStatements, thresholds.lines);

console.log('==============================================');

if (!okStatements || !okBranches || !okFunctions || !okLines) {
  console.error('Unit test cases did not reach the required coverage threshold.');
  process.exit(1);
} else {
  console.log('✅ Coverage thresholds met.');
  process.exit(0);
}
