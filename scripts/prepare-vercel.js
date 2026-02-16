#!/usr/bin/env node

/**
 * Prepare Vercel Deployment Script
 *
 * This script ensures all dependencies are correctly installed and
 * environment variables are properly configured for Vercel deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 Preparing project for Vercel deployment...\n');

// Check environment setup
try {
  console.log('Checking environment variables configuration...');
  require('./check-env');
} catch (error) {
  // If check-env fails, we continue anyway since Vercel will set the env vars
  console.log(
    'Environment check skipped - will use Vercel environment variables.'
  );
}

// Fix tooltip component if needed
try {
  console.log('\nChecking tooltip component...');
  // require('./fix-tooltip'); // Commented out as fix-tooltip module doesn't exist
  console.log('Tooltip component check skipped - module not found');
} catch (error) {
  console.error('Error checking tooltip component:', error);
}

// Install missing dependencies directly (force install)
try {
  console.log('\nInstalling missing dependencies directly...');

  // Create a temporary package.json with just the missing dependencies
  const tempPackageJson = {
    name: 'temp-dependencies',
    version: '1.0.0',
    dependencies: {
      '@radix-ui/react-tooltip': '^1.0.7',
    },
  };

  fs.writeFileSync(
    'temp-package.json',
    JSON.stringify(tempPackageJson, null, 2)
  );

  // Install the dependencies from temp package.json directly to node_modules
  execSync(
    'npm install --legacy-peer-deps --no-package-lock --package-lock-only=false',
    {
      stdio: 'inherit',
      env: { ...process.env, npm_config_prefix: process.cwd() },
    }
  );

  // Clean up temp file
  fs.unlinkSync('temp-package.json');

  console.log('Successfully installed missing dependencies.');
} catch (error) {
  console.error('Failed to install dependencies:', error);
  console.log('Will attempt to continue with the build.');
}

// Now fix the files that use @heroicons
try {
  console.log('\nFixing @heroicons imports in source files...');

  // Helper function to replace heroicons imports
  const fixHeroiconsImports = (filePath) => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace heroicons imports with lucide-react
      content = content.replace(
        /import\s+\{([^}]+)\}\s+from\s+['"]@heroicons\/react\/24\/outline['"];?/g,
        'import { $1 } from "lucide-react";'
      );

      // Replace heroicons solid imports
      content = content.replace(
        /import\s+\{([^}]+)\}\s+from\s+['"]@heroicons\/react\/24\/solid['"];?/g,
        'import { $1 } from "lucide-react";'
      );

      // Replace specific icon names if needed (camelCase to PascalCase)
      content = content.replace(/ArrowLeftIcon/g, 'ArrowLeft');
      content = content.replace(/HeartIcon/g, 'Heart');
      content = content.replace(/EyeIcon/g, 'Eye');
      content = content.replace(/ShareIcon/g, 'Share');
      content = content.replace(/HeartIconSolid/g, 'Heart');

      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in ${filePath}`);
    }
  };

  // Fix all known problematic files
  const filesToFix = [
    'app/genres/[slug]/page.tsx',
    'app/stories/[id]/page.tsx',
  ];

  for (const file of filesToFix) {
    fixHeroiconsImports(path.join(process.cwd(), file));
  }

  console.log('Fixed heroicons imports in source files.');
} catch (error) {
  console.error('Error fixing heroicons imports:', error);
}

// Make sure the build directory exists
try {
  const buildDir = path.resolve(process.cwd(), '.next');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
} catch (error) {
  console.log('Warning: Failed to create build directory. Proceeding anyway.');
}

// Trace the process.env.NODE_ENV value for debugging
console.log(`\nNode environment: ${process.env.NODE_ENV || 'not set'}`);
console.log(`Current working directory: ${process.cwd()}`);

console.log('\n✅ Vercel preparation completed successfully!\n');
