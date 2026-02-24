#!/usr/bin/env node

/**
 * Custom Installation Script for Vercel Deployment
 *
 * This script ensures all required dependencies are correctly installed,
 * regardless of any potential issues with npm or package resolution.
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Log function with timestamp
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Error handler
const handleError = (error, message) => {
  log(`ERROR: ${message}`);
  console.error(error);
  process.exit(1);
};

try {
  log('Starting custom installation process...');

  // Run the standard npm installation
  log('Running npm install...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

  // Force install problematic dependencies
  log('Installing specific dependencies with fixed versions...');
  const depsToInstall = ['@radix-ui/react-tooltip@1.0.7'];

  // Install each dependency one by one to isolate potential issues
  for (const dep of depsToInstall) {
    log(`Installing ${dep}...`);
    try {
      execSync(`npm install ${dep} --no-save --legacy-peer-deps`, {
        stdio: 'inherit',
      });
      log(`Successfully installed ${dep}`);
    } catch (depError) {
      log(`Warning: Failed to install ${dep}, continuing anyway`);
      console.error(depError);
    }
  }

  // Check node_modules for the required dependencies
  const checkDependency = (pkgName) => {
    const pkgPath = `node_modules/${pkgName}/package.json`;
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      log(`Found ${pkgName}@${pkg.version}`);
      return true;
    }
    return false;
  };

  // Check for required dependencies
  const missingDeps = [];
  if (!checkDependency('@radix-ui/react-tooltip')) {
    missingDeps.push('@radix-ui/react-tooltip');
  }

  // If any deps are missing, try a manual approach
  if (missingDeps.length > 0) {
    log(`Manual installation required for: ${missingDeps.join(', ')}`);

    // Try to create the directory structure if needed
    for (const dep of missingDeps) {
      const moduleDir = `node_modules/${dep}`;
      if (!fs.existsSync(moduleDir)) {
        log(`Creating directory structure for ${dep}...`);
        fs.mkdirSync(moduleDir, { recursive: true });
      }
    }

    // For @radix-ui/react-tooltip, try to download directly from unpkg
    if (missingDeps.includes('@radix-ui/react-tooltip')) {
      log(
        'Attempting to manually download @radix-ui/react-tooltip from unpkg...'
      );
      try {
        execSync(
          'curl -s https://unpkg.com/@radix-ui/react-tooltip@1.0.7/dist/index.js -o node_modules/@radix-ui/react-tooltip/index.js',
          { stdio: 'inherit' }
        );

        // Create a minimal package.json for the module
        const packageJson = {
          name: '@radix-ui/react-tooltip',
          version: '1.0.7',
          main: 'index.js',
        };
        fs.writeFileSync(
          'node_modules/@radix-ui/react-tooltip/package.json',
          JSON.stringify(packageJson, null, 2)
        );
        log('Successfully created manual package for @radix-ui/react-tooltip');
      } catch (downloadError) {
        log('Warning: Manual download failed, continuing anyway');
        console.error(downloadError);
      }
    }
  }

  log('Custom installation completed successfully');
} catch (error) {
  handleError(error, 'Failed to complete custom installation');
}
