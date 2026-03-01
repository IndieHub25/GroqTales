// Pre-deployment check script for GroqTales

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running pre-deployment checks for GroqTales...');

// Check for required environment variables
function checkEnvVariables() {
  console.log('\nChecking environment variables...');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(
      'ERROR: .env.local file not found. Please create it with necessary variables.'
    );
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_GROQ_API_KEY',
    'NEXT_PUBLIC_UNSPLASH_API_KEY',
    'MONGODB_URI',
    'MONGODB_DB_NAME',
  ];

  requiredVars.forEach((varName) => {
    if (!envContent.includes(varName)) {
      console.warn(
        `WARNING: ${varName} not found in .env.local. This may cause issues in production.`
      );
    } else if (
      envContent.includes(`${varName}=your_`) ||
      envContent.includes(`${varName}=YOUR_`)
    ) {
      console.warn(
        `WARNING: ${varName} seems to be using a placeholder value. Replace with a production key.`
      );
    } else {
      console.log(`✓ ${varName} is set.`);
    }
  });
}

// Check build process
function checkBuild() {
  console.log('\nChecking build process...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✓ Build completed successfully.');
  } catch (error) {
    console.error(
      'ERROR: Build failed. Please fix build errors before deploying.'
    );
    process.exit(1);
  }
}

// Main function to run all checks
function runChecks() {
  checkEnvVariables();
  checkBuild();
  console.log(
    '\nAll pre-deployment checks passed! Your project is ready for deployment to Cloudflare Pages.'
  );
  console.log('To deploy, run:');
  console.log('  git push origin main');
  console.log('Or push to your connected branch to trigger an automatic Cloudflare Pages deploy.');
}

runChecks();
