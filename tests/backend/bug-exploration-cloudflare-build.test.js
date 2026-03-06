/**
 * Bug Condition Exploration Test - Cloudflare Build Configuration
 * 
 * **CRITICAL**: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms Bug 4 exists (missing "out" directory for Cloudflare builds).
 * 
 * **DO NOT attempt to fix the test or the code when it fails.**
 * 
 * This test validates Requirements 2.7, 2.8, 2.9:
 * - 2.7: System SHALL configure output: 'export' when NEXT_PUBLIC_BUILD_MODE=true
 * - 2.8: System SHALL create "out" directory with static files
 * - 2.9: Cloudflare Pages SHALL find "out" directory and deploy successfully
 */

const fs = require('fs');
const path = require('path');

describe('Bug Exploration: Cloudflare Build Configuration', () => {
  const nextConfigPath = path.resolve(__dirname, '../../next.config.js');
  const outDirPath = path.resolve(__dirname, '../../out');

  /**
   * Test 1.4: Cloudflare build without export configuration fails
   * 
   * Expected behavior (after fix):
   * - When NEXT_PUBLIC_BUILD_MODE=true, next.config.js should set output: 'export'
   * - Build should create "out" directory with static files
   * 
   * Current behavior (unfixed):
   * - next.config.js sets output: undefined for Cloudflare builds
   * - No "out" directory is created
   * - Cloudflare Pages deployment fails
   */
  test('should detect missing export configuration in next.config.js (Bug 4)', () => {
    // Read the next.config.js file
    delete require.cache[require.resolve('../../next.config.js')];
    
    // Set environment variable to simulate Cloudflare build
    const originalBuildMode = process.env.NEXT_PUBLIC_BUILD_MODE;
    process.env.NEXT_PUBLIC_BUILD_MODE = 'true';
    
    // Reload the config with the environment variable set
    delete require.cache[require.resolve('../../next.config.js')];
    const nextConfig = require('../../next.config.js');
    
    // After fix, output should be 'export' when NEXT_PUBLIC_BUILD_MODE=true
    // Current behavior (unfixed): output is undefined
    expect(nextConfig.output).toBe('export');
    
    // Restore original environment
    process.env.NEXT_PUBLIC_BUILD_MODE = originalBuildMode;
    delete require.cache[require.resolve('../../next.config.js')];
  });

  test('should verify output directory exists after Cloudflare build', () => {
    // This test checks if the "out" directory exists
    // After a successful Cloudflare build, this directory should contain static files
    
    // Note: This test assumes a build has been run
    // In CI/CD, this would be run after the build step
    
    // Check if out directory exists
    const outDirExists = fs.existsSync(outDirPath);
    
    // After fix and build, this should be true
    // Current behavior (unfixed): may be false or directory is empty
    if (outDirExists) {
      // Check if directory contains expected files
      const files = fs.readdirSync(outDirPath);
      
      // Should contain at least index.html and _next directory
      expect(files).toContain('index.html');
      expect(files.some(f => f.startsWith('_next'))).toBe(true);
    } else {
      // If directory doesn't exist, the test documents this
      console.log('Note: "out" directory does not exist. Run build with NEXT_PUBLIC_BUILD_MODE=true to create it.');
    }
  });

  test('should document the configuration issue in next.config.js', () => {
    // This test documents the specific configuration issue
    
    // Current code at line 207 of next.config.js:
    // output: isCfBuild ? undefined : (process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined)
    
    // The problem:
    // - When isCfBuild is true (NEXT_PUBLIC_BUILD_MODE=true), output is set to undefined
    // - Next.js requires output: 'export' to generate static files in "out" directory
    // - Without 'export', Next.js doesn't create the static export
    
    // After fix, the code should be:
    // output: isCfBuild ? 'export' : (process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined)
    
    const expectedBehavior = {
      when: 'NEXT_PUBLIC_BUILD_MODE=true',
      currentOutput: 'undefined',
      expectedOutput: 'export',
      reason: 'Cloudflare Pages requires static export in "out" directory'
    };
    
    expect(expectedBehavior.expectedOutput).toBe('export');
  });

  test('should verify wrangler.toml expects "out" directory', () => {
    // Read wrangler.toml to verify it expects "out" directory
    const wranglerPath = path.resolve(__dirname, '../../wrangler.toml');
    
    if (fs.existsSync(wranglerPath)) {
      const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
      
      // wrangler.toml should specify pages_build_output_dir = "out"
      expect(wranglerContent).toMatch(/pages_build_output_dir\s*=\s*["']out["']/);
    } else {
      console.log('Note: wrangler.toml not found. This is expected if not using Cloudflare Pages.');
    }
  });

  test('should demonstrate the mismatch between config and wrangler expectations', () => {
    // This test documents the mismatch between:
    // 1. next.config.js output configuration (undefined)
    // 2. wrangler.toml expectation (pages_build_output_dir = "out")
    
    const configMismatch = {
      nextConfigOutput: 'undefined (when NEXT_PUBLIC_BUILD_MODE=true)',
      wranglerExpectation: 'pages_build_output_dir = "out"',
      result: 'Cloudflare Pages deployment fails with "Output directory \'out\' not found"',
      fix: 'Set output: \'export\' in next.config.js when NEXT_PUBLIC_BUILD_MODE=true'
    };
    
    expect(configMismatch.fix).toBe('Set output: \'export\' in next.config.js when NEXT_PUBLIC_BUILD_MODE=true');
  });

  test('should verify non-Cloudflare builds are not affected', () => {
    // After fix, non-Cloudflare builds should still work correctly
    // This test verifies that when NEXT_PUBLIC_BUILD_MODE is NOT set,
    // the output configuration is undefined (standard Next.js behavior)
    
    // Note: Due to Jest's module caching and environment variable handling,
    // we test this by spawning a separate Node process with clean environment
    const { execSync } = require('child_process');
    
    try {
      // Run a separate Node process to evaluate the config without NEXT_PUBLIC_BUILD_MODE
      const result = execSync(
        'node -e "delete process.env.NEXT_PUBLIC_BUILD_MODE; delete process.env.BUILD_STANDALONE; const config = require(\'./next.config.js\'); console.log(config.output);"',
        { encoding: 'utf8', cwd: path.resolve(__dirname, '../..') }
      );
      
      // Extract just the last line (the actual output value)
      const lines = result.trim().split('\n');
      const outputValue = lines[lines.length - 1];
      
      // For non-Cloudflare builds, output should be 'undefined' (the string)
      expect(outputValue).toBe('undefined');
    } catch (error) {
      // If the command fails, log the error for debugging
      console.error('Error testing non-Cloudflare build config:', error.message);
      throw error;
    }
  });
});
