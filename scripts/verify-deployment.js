#!/usr/bin/env node

/**
 * GroqTales Deployment Verification Script
 *
 * Comprehensive verification of build, deployment readiness, and system health
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 GroqTales Deployment Verification\n');

const checks = [];
let allPassed = true;

function addCheck(name, passed, message) {
  checks.push({ name, passed, message });
  console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
  if (!passed) allPassed = false;
}

// 1. Environment Configuration
console.log('📋 Checking Environment Configuration...');
const envExample = fs.existsSync('.env.example');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
addCheck(
  'Environment Template',
  envExample,
  envExample ? 'Found .env.example' : 'Missing .env.example'
);
addCheck(
  'Package.json Valid',
  !!packageJson.name,
  `Project: ${packageJson.name} v${packageJson.version}`
);

// 2. Dependencies
console.log('\n📦 Checking Dependencies...');
try {
  const nodeModules = fs.existsSync('node_modules');
  addCheck(
    'Dependencies Installed',
    nodeModules,
    nodeModules ? 'node_modules found' : 'Run npm install'
  );
} catch (error) {
  addCheck('Dependencies Check', false, error.message);
}

// 3. Build Verification
console.log('\n🔨 Verifying Build Process...');
try {
  console.log('Running build test...');
  const buildOutput = execSync('npm run build', {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  const buildSuccess =
    buildOutput.includes('Compiled successfully') ||
    buildOutput.includes('Compiled with warnings');
  addCheck(
    'Build Process',
    buildSuccess,
    buildSuccess ? 'Build completes successfully' : 'Build has errors'
  );
} catch (error) {
  addCheck(
    'Build Process',
    false,
    `Build failed: ${error.message.split('\n')[0]}`
  );
}

// 4. Critical Files
console.log('\n📁 Checking Critical Files...');
const criticalFiles = [
  'lib/groq-service.ts',
  'lib/transaction-components.ts',
  'components/providers/web3-provider.tsx',
  'app/api/groq/route.ts',
  'server/backend.js',
  'render.yaml',
  '.github/workflows/deployment.yml',
  '.github/dependabot.yml',
];

criticalFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  addCheck(`File: ${file}`, exists, exists ? 'Present' : 'Missing');
});

// 5. Documentation
console.log('\n📚 Checking Documentation...');
const docFiles = [
  'README.md',
  'docs/BACKEND_API.md',
  'docs/SDK_GUIDE.md',
  'docs/DEVELOPER_ONBOARDING.md',
];

docFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  addCheck(`Documentation: ${file}`, exists, exists ? 'Present' : 'Missing');
});

// 6. Deployment Configuration
console.log('\n🚀 Checking Deployment Configuration...');
const vercelConfig =
  fs.existsSync('vercel.json') || fs.existsSync('next.config.js');
const renderConfig = fs.existsSync('render.yaml');
const netlifyConfig = fs.existsSync('netlify.toml');

addCheck(
  'Frontend Deployment',
  vercelConfig || netlifyConfig,
  vercelConfig
    ? 'Vercel configured'
    : netlifyConfig
      ? 'Netlify configured'
      : 'No frontend deployment config'
);
addCheck(
  'Backend Deployment',
  renderConfig,
  renderConfig ? 'Render configured' : 'No backend deployment config'
);

// 7. Workflow Configuration
console.log('\n⚙️ Checking GitHub Workflows...');
const workflowFiles = [
  '.github/workflows/deployment.yml',
  '.github/workflows/pr-review.yml',
  '.github/workflows/license-compliance.yml',
];

workflowFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  addCheck(
    `Workflow: ${path.basename(file)}`,
    exists,
    exists ? 'Configured' : 'Missing'
  );
});

// 8. Code Quality
console.log('\n🔍 Checking Code Quality Setup...');
const eslintConfig =
  fs.existsSync('.eslintrc.js') || fs.existsSync('.eslintrc.json');
const prettierConfig =
  fs.existsSync('.prettierrc') || fs.existsSync('prettier.config.js');
const tsConfig = fs.existsSync('tsconfig.json');

addCheck(
  'ESLint Configuration',
  eslintConfig,
  eslintConfig ? 'Configured' : 'Missing'
);
addCheck(
  'Prettier Configuration',
  prettierConfig,
  prettierConfig ? 'Configured' : 'Missing'
);
addCheck(
  'TypeScript Configuration',
  tsConfig,
  tsConfig ? 'Configured' : 'Missing'
);

// 9. Security & Compliance
console.log('\n🔒 Checking Security & Compliance...');
const dependabot = fs.existsSync('.github/dependabot.yml');
const licenseCompliance = fs.existsSync(
  '.github/workflows/license-compliance.yml'
);

addCheck(
  'Dependabot Configuration',
  dependabot,
  dependabot ? 'Automated dependency updates' : 'Missing'
);
addCheck(
  'License Compliance',
  licenseCompliance,
  licenseCompliance ? 'License checking enabled' : 'Missing'
);

// Summary
console.log('\n📊 DEPLOYMENT VERIFICATION SUMMARY');
console.log('='.repeat(50));

const passed = checks.filter((c) => c.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`✅ Passed: ${passed}/${total} checks (${percentage}%)`);

if (allPassed) {
  console.log('\n🎉 ALL CHECKS PASSED!');
  console.log('✅ GroqTales is ready for production deployment');
  console.log('🚀 Frontend: Deploy to Vercel');
  console.log('🔧 Backend: Deploy to Render');
  console.log('📋 Workflows: GitHub Actions configured');
} else {
  console.log('\n⚠️  Some checks failed. Please address the issues above.');
  const failed = checks.filter((c) => !c.passed);
  console.log('\nFailed checks:');
  failed.forEach((check) => {
    console.log(`❌ ${check.name}: ${check.message}`);
  });
}

console.log('\n🔗 Next Steps:');
console.log('1. Fix any failed checks above');
console.log('2. Commit and push changes to trigger deployment');
console.log('3. Monitor deployment status in GitHub Actions');
console.log('4. Verify production deployment functionality');

process.exit(allPassed ? 0 : 1);
