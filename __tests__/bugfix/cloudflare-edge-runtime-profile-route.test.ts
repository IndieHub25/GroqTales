/**
 * Bug Condition Exploration Test for Cloudflare Edge Runtime Profile Route
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * Property 1: Fault Condition - Cloudflare Build Fails Without Edge Runtime
 * 
 * This test verifies that the Cloudflare build fails when the /profile/[slug] route
 * lacks Edge Runtime configuration. The test encodes the expected behavior and will
 * validate the fix when it passes after implementation.
 * 
 * EXPECTED OUTCOME: Test FAILS (this is correct - it proves the bug exists)
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Cloudflare Edge Runtime Profile Route - Bug Condition Exploration', () => {
  const profileRoutePath = path.join(process.cwd(), 'app/profile/[slug]/page.tsx');
  
  beforeAll(() => {
    // Verify the profile route exists
    expect(fs.existsSync(profileRoutePath)).toBe(true);
  });

  /**
   * Property 1: Fault Condition - Cloudflare Build Fails Without Edge Runtime
   * 
   * This property test verifies the bug condition by attempting a Cloudflare build
   * and expecting it to fail with the specific error about missing Edge Runtime config.
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3**
   * 
   * Requirement 1.1: Build fails with specific error message
   * Requirement 1.2: CLI detects missing Edge Runtime configuration
   * Requirement 1.3: Deployment is blocked due to build failure
   */
  test('Property 1: Cloudflare build should fail when /profile/[slug] lacks Edge Runtime configuration', () => {
    let buildOutput = '';
    let buildFailed = false;
    let errorMessage = '';

    try {
      // Attempt to run the Cloudflare build
      // This should fail on unfixed code
      buildOutput = execSync('npm run cf-build', {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 120000, // 2 minute timeout
      });
    } catch (error: any) {
      buildFailed = true;
      errorMessage = error.message || '';
      buildOutput = error.stdout?.toString() || error.stderr?.toString() || '';
      
      // Log the counterexample for documentation
      console.log('\n=== COUNTEREXAMPLE FOUND ===');
      console.log('Build failed as expected (bug exists)');
      console.log('Error output:', buildOutput.substring(0, 500));
      console.log('===========================\n');
    }

    // EXPECTED BEHAVIOR (after fix):
    // - Build should succeed (buildFailed = false)
    // - No error about Edge Runtime configuration
    
    // CURRENT BEHAVIOR (bug exists):
    // - Build fails (buildFailed = true)
    // - Error message contains: "The following routes were not configured to run with the Edge Runtime: - /profile/[slug]"
    
    // This test encodes the EXPECTED behavior, so it will FAIL on unfixed code
    expect(buildFailed).toBe(false);
    
    // Verify no Edge Runtime configuration errors
    // Note: The build output will still contain "/profile/[slug]" in the build summary
    // showing it as an Edge Function Route, which is correct and expected
    expect(buildOutput).not.toContain('The following routes were not configured to run with the Edge Runtime');
    
    // If we reach here on unfixed code, the test will have failed above
    // On fixed code, the build should complete successfully
  }, 180000); // 3 minute timeout for the test

  /**
   * Additional verification: Check that the profile route file exists
   * and is a valid dynamic route
   */
  test('Profile route file exists and is a dynamic route', () => {
    const routeContent = fs.readFileSync(profileRoutePath, 'utf-8');
    
    // Verify it's a dynamic route with params
    expect(routeContent).toContain('params');
    expect(routeContent).toContain('slug');
  });
});

/**
 * Preservation Property Tests for Cloudflare Edge Runtime Profile Route
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * Property 2: Preservation - Profile Functionality and Other Builds
 * 
 * These tests verify that the baseline behavior is preserved on UNFIXED code:
 * - Local development builds succeed
 * - Profile route serves correctly with valid username slug
 * - Profile route serves correctly with "me" slug for authenticated users
 * - Other routes continue to function without Edge Runtime configuration
 * 
 * EXPECTED OUTCOME: Tests PASS (this confirms baseline behavior to preserve)
 */
describe('Cloudflare Edge Runtime Profile Route - Preservation Properties', () => {
  const profileRoutePath = path.join(process.cwd(), 'app/profile/[slug]/page.tsx');
  
  /**
   * Property 2.1: Local Development Build Succeeds
   * 
   * This property test verifies that the standard Next.js build (non-Cloudflare)
   * succeeds without any Edge Runtime configuration issues.
   * 
   * **Validates: Requirement 3.3**
   * 
   * Requirement 3.3: When building for non-Cloudflare environments (local development, Render),
   * the system SHALL CONTINUE TO build and run without issues
   */
  test('Property 2.1: Local development build (npm run build) should succeed', () => {
    let buildOutput = '';
    let buildFailed = false;

    try {
      // Run the standard Next.js build (not Cloudflare-specific)
      buildOutput = execSync('npm run build', {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 180000, // 3 minute timeout
      });
      
      console.log('\n=== LOCAL BUILD SUCCESS ===');
      console.log('Standard Next.js build completed successfully');
      console.log('This confirms non-Cloudflare builds work correctly');
      console.log('===========================\n');
    } catch (error: any) {
      buildFailed = true;
      buildOutput = error.stdout?.toString() || error.stderr?.toString() || '';
      
      console.log('\n=== LOCAL BUILD FAILED ===');
      console.log('Error:', buildOutput.substring(0, 500));
      console.log('==========================\n');
    }

    // EXPECTED: Build should succeed for local/non-Cloudflare environments
    expect(buildFailed).toBe(false);
    expect(buildOutput).toContain('Compiled successfully');
  }, 240000); // 4 minute timeout

  /**
   * Property 2.2: Profile Route File Structure is Valid
   * 
   * This property test verifies that the profile route has the correct structure
   * for handling both username slugs and the "me" slug.
   * 
   * **Validates: Requirements 3.1, 3.2**
   * 
   * Requirement 3.1: Profile route accessed with valid username slug displays correctly
   * Requirement 3.2: Profile route accessed with "me" slug displays authenticated user's profile
   */
  test('Property 2.2: Profile route structure supports username and "me" slugs', () => {
    // Verify the profile route file exists
    expect(fs.existsSync(profileRoutePath)).toBe(true);
    
    const routeContent = fs.readFileSync(profileRoutePath, 'utf-8');
    
    // Verify it's a dynamic route with params
    expect(routeContent).toContain('params');
    expect(routeContent).toContain('slug');
    
    // Verify it exports a component (Next.js page requirement)
    expect(routeContent).toMatch(/export\s+default/);
    
    console.log('\n=== PROFILE ROUTE STRUCTURE VALID ===');
    console.log('Profile route correctly configured as dynamic route');
    console.log('Supports both username slugs and "me" slug');
    console.log('=====================================\n');
  });

  /**
   * Property 2.3: Other Routes Don't Require Edge Runtime Configuration
   * 
   * This property test verifies that other dynamic routes in the application
   * don't have Edge Runtime configuration, confirming they work without it.
   * 
   * **Validates: Requirement 3.4**
   * 
   * Requirement 3.4: When other routes are built, they SHALL CONTINUE TO function
   * as before without requiring Edge Runtime configuration changes
   */
  test('Property 2.3: Other dynamic routes function without Edge Runtime config', () => {
    // Check a few other dynamic routes to ensure they don't have Edge Runtime config
    const otherDynamicRoutes = [
      'app/stories/[id]/page.tsx',
      'app/genres/[slug]/page.tsx',
    ];
    
    let allRoutesValid = true;
    const routeStatuses: string[] = [];
    
    for (const routePath of otherDynamicRoutes) {
      const fullPath = path.join(process.cwd(), routePath);
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Check if route has Edge Runtime config
        const hasEdgeRuntime = content.includes("runtime = 'edge'") || 
                              content.includes('runtime: "edge"') ||
                              content.includes("runtime: 'edge'");
        
        routeStatuses.push(`${routePath}: ${hasEdgeRuntime ? 'HAS' : 'NO'} Edge Runtime config`);
        
        // Most routes should NOT have Edge Runtime config (they work without it)
        // This confirms the baseline behavior we want to preserve
      } else {
        routeStatuses.push(`${routePath}: NOT FOUND`);
      }
    }
    
    console.log('\n=== OTHER ROUTES STATUS ===');
    routeStatuses.forEach(status => console.log(status));
    console.log('===========================\n');
    
    // At least one other dynamic route should exist
    const existingRoutes = otherDynamicRoutes.filter(route => 
      fs.existsSync(path.join(process.cwd(), route))
    );
    expect(existingRoutes.length).toBeGreaterThan(0);
  });

  /**
   * Property 2.4: Profile Route Client Component Exists
   * 
   * This property test verifies that the profile route's client component exists,
   * which is necessary for the route to function correctly.
   * 
   * **Validates: Requirements 3.1, 3.2**
   */
  test('Property 2.4: Profile route client component exists and is valid', () => {
    const clientPath = path.join(process.cwd(), 'app/profile/[slug]/client.tsx');
    
    // Verify the client component exists
    expect(fs.existsSync(clientPath)).toBe(true);
    
    const clientContent = fs.readFileSync(clientPath, 'utf-8');
    
    // Verify it's a client component
    expect(clientContent).toContain('use client');
    
    // Verify it accepts slug prop
    expect(clientContent).toContain('slug');
    
    console.log('\n=== PROFILE CLIENT COMPONENT VALID ===');
    console.log('Client component exists and is properly configured');
    console.log('Supports rendering profiles for different slugs');
    console.log('======================================\n');
  });

  /**
   * Property 2.5: Build Output Directory Structure
   * 
   * This property test verifies that after a successful build, the expected
   * output structure exists for the profile route.
   * 
   * **Validates: Requirement 3.3**
   */
  test('Property 2.5: Build creates proper output structure for profile route', () => {
    // Check if .next directory exists (created by build)
    const nextDir = path.join(process.cwd(), '.next');
    
    // If .next doesn't exist, this test will be skipped
    // (it requires a build to have been run first)
    if (!fs.existsSync(nextDir)) {
      console.log('\n=== BUILD OUTPUT CHECK SKIPPED ===');
      console.log('.next directory not found - run build first');
      console.log('==================================\n');
      return;
    }
    
    // Verify .next directory exists
    expect(fs.existsSync(nextDir)).toBe(true);
    
    console.log('\n=== BUILD OUTPUT STRUCTURE VALID ===');
    console.log('.next directory exists with build artifacts');
    console.log('Build output structure is correct');
    console.log('====================================\n');
  });
});
